import test from "node:test";
import assert from "node:assert/strict";

import {
  plot,
  renderSVG,
  spikeSeries,
} from "../src/index.js";

test("spikeSeries turns compact peak data into a smooth sampled rule", () => {
  const series = spikeSeries([[2, 6, 0.25]], {
    baseline: 1,
    domain: [0, 4],
  });

  assert.equal(series.type, "spike");
  assert.equal(series.valueAt(2), 7);
  assert.ok(series.valueAt(1) > 1);
  assert.ok(Number.isNaN(series.valueAt(5)));
  assert.deepEqual(series.peaks[0], { x: 2, height: 6, spread: 0.25 });
});

test("plot owns inferred domains, clipping, titles, units, and axis spacing", () => {
  const diagram = plot({
    series: spikeSeries([
      [0, 2.5, 0.24],
      [1, 3.5, 0.18],
      [2, 8.5, 0.17],
    ], { baseline: 0.5, end: 2.6, color: "#249d91" }),
    title: "Leap-year searches",
    x: { label: "Year", step: 1 },
    y: { label: "Searches", unit: "millions", step: 1 },
    width: 520,
    height: 340,
  });
  const svg = renderSVG(diagram);

  assert.match(svg, /Leap-year searches/);
  assert.match(svg, /Searches \(millions\)/);
  assert.match(svg, />Year</);
  assert.match(svg, /clip-path=/);
  assert.match(svg, /#249d91/);
  assert.doesNotMatch(svg, /NaN|Infinity|undefined/);
  assert.ok(diagram.width > 520, "axis captions should reserve horizontal space");
  assert.ok(diagram.height > 340, "title and x caption should reserve vertical space");
});

test("plot accepts ordinary functions and explicit semantic axis domains", () => {
  const svg = renderSVG(plot((x) => x * x, {
    title: "Square function",
    x: { domain: [-3, 3], label: "x" },
    y: { domain: [0, 9], label: "y" },
    axes: { grid: false },
  }));

  assert.match(svg, /Square function/);
  assert.match(svg, />x</);
  assert.match(svg, />y</);
  assert.doesNotMatch(svg, /NaN|Infinity|undefined/);
});

test("plot adaptively samples narrow semantic spikes on wide domains", () => {
  const svg = renderSVG(plot(
    spikeSeries([[500, 7, 0.001]], { color: "#249d91" }),
    {
      x: { domain: [0, 1000] },
      y: { domain: [0, 8] },
      width: 500,
      height: 320,
    },
  ));
  const path = svg.match(/<path d="([^"]+)"[^>]*stroke="#249d91"/)?.[1];
  const yValues = [...(path ?? "").matchAll(/[ML] [-+.\deE]+ ([-+.\deE]+)/g)]
    .map((match) => Number(match[1]));

  assert.ok(path, "the spike curve should render");
  assert.ok(new Set(yValues).size > 10, "the narrow peak should not collapse to its baseline");
});

test("plot helpers reject malformed series data with useful errors", () => {
  assert.throws(() => spikeSeries([]), /non-empty array/);
  assert.throws(() => spikeSeries([[0, 1, 0]]), /positive spread/);
  assert.throws(() => plot(null), /function or a series helper/);
});
