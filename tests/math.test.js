import test from "node:test";
import assert from "node:assert/strict";

import { circle, Diagram, renderSVG } from "../src/index.js";
import {
  axes,
  barChart,
  boxPlot,
  cellGrid,
  coordinatePlane,
  fractionBar,
  fractionCircle,
  functionPlot,
  histogram,
  numberLine,
  parametricPlot,
  pieChart,
  probabilityTree,
  pythagoras,
  radialPartition,
  radialPolygon,
  rightTriangle,
  scatterPlot,
  sierpinski,
  spiral,
  vennDiagram,
} from "../src/math/index.js";

function assertRenderable(diagram, name) {
  const svg = renderSVG(diagram);
  assert.match(svg, /^<svg\b/, `${name} should render an SVG root`);
  assert.doesNotMatch(svg, /NaN|Infinity|undefined/, `${name} should emit finite deterministic geometry`);
}

test("axis and plot helpers render", () => {
  const diagrams = {
    numberLine: numberLine(-3, 3, { step: 1 }),
    coordinatePlane: coordinatePlane({ xDomain: [-2, 2], yDomain: [-2, 2] }),
    axes: axes({ xDomain: [-2, 2], yDomain: [-2, 2] }),
    functionPlot: functionPlot((x) => x * x, { xDomain: [-2, 2], yDomain: [-1, 4] }),
    parametricPlot: parametricPlot((t) => [Math.cos(t), Math.sin(t)], { xDomain: [-1.2, 1.2], yDomain: [-1.2, 1.2] }),
    scatterPlot: scatterPlot([[0, 1], [1, 3], [2, 2]]),
  };
  for (const [name, diagram] of Object.entries(diagrams)) assertRenderable(diagram, name);
});

test("fraction helpers support proper and improper fractions", () => {
  assertRenderable(fractionBar(7, 4), "fractionBar");
  assertRenderable(fractionCircle(5, 3), "fractionCircle");
  assertRenderable(fractionCircle(1, 1), "whole fractionCircle");
});

test("cellGrid describes addressed cells without manual coordinates", () => {
  const diagram = cellGrid({
    diagonals: [
      ["\\", "\\", "/", "/"],
      ["\\", "\\", "/", "/"],
      ["/", "/", "\\", "\\"],
      ["/", "/", "\\", "\\"],
    ],
    shadedTriangles: [
      [2, 0, "nw"],
      [0, 1, "ne"],
      [3, 2, "ne"],
      [1, 3, "nw"],
    ],
    cellSize: 88,
    highlightFill: "#a97aee",
    borderRadius: 4,
  });

  assertRenderable(diagram, "cellGrid diagonal pattern");
  assert.ok(diagram.width >= 352);
  assert.ok(diagram.height >= 352);
});

test("cellGrid supports reusable shading and semantic custom content", () => {
  const diagram = cellGrid({
    rows: 10,
    columns: 10,
    cellSize: 20,
    shadedCells: 37,
    content: (grid) => [
      grid.cell(9, 9).place(circle(5).fill("#ef7187").stroke("none", 0)),
    ],
  });
  const svg = renderSVG(diagram);

  assert.match(svg, /#a97aee/);
  assert.match(svg, /#ef7187/);
  assert.doesNotMatch(svg, /NaN|Infinity|undefined/);
});

test("cellGrid geometry maps vertices, diagonals, and every triangle corner exactly", () => {
  const captured = {};
  const diagram = cellGrid({
    rows: 1,
    columns: 2,
    cellWidth: 40,
    cellHeight: 20,
    diagonals: [["\\", "/"]],
    shadedTriangles: [
      [0, 0, "nw", "#111111"],
      [0, 0, "ne", "#222222"],
      [1, 0, "se", "#333333"],
      [1, 0, "sw", "#444444"],
    ],
    content: (grid) => {
      captured.topLeft = grid.vertex(0, 0);
      captured.middle = grid.vertex(1, 1);
      captured.falling = grid.cell(0, 0).diagonal("\\");
      captured.rising = grid.cell(1, 0).diagonal("/");
      captured.triangles = ["nw", "ne", "se", "sw"]
        .map((corner) => grid.cell(corner === "nw" || corner === "ne" ? 0 : 1, 0).triangle(corner));
      return [];
    },
  });

  assert.deepEqual([captured.topLeft.x, captured.topLeft.y], [-40, -10]);
  assert.deepEqual([captured.middle.x, captured.middle.y], [0, 10]);
  assert.deepEqual(
    captured.falling.map(({ x, y }) => [x, y]),
    [[-40, -10], [0, 10]],
  );
  assert.deepEqual(
    captured.rising.map(({ x, y }) => [x, y]),
    [[40, -10], [0, 10]],
  );
  assert.deepEqual(
    captured.triangles.map((points) => points.map(({ x, y }) => [x, y])),
    [
      [[-40, -10], [0, -10], [-40, 10]],
      [[-40, -10], [0, -10], [0, 10]],
      [[40, -10], [40, 10], [0, 10]],
      [[0, -10], [40, 10], [0, 10]],
    ],
  );
  assertRenderable(diagram, "cellGrid exact geometry");
});

test("cellGrid returns a normal Diagram and explicit clipping works for square grids", () => {
  const unclipped = cellGrid({
    rows: 1,
    columns: 1,
    cellSize: 50,
    border: false,
    content: (grid) => grid.cell(0, 0).place(circle(40)),
  });
  const clipped = cellGrid({
    rows: 1,
    columns: 1,
    cellSize: 50,
    border: false,
    clipContent: true,
    content: (grid) => grid.cell(0, 0).place(circle(40)),
  });

  assert.ok(clipped instanceof Diagram);
  assert.ok(unclipped.width > 80);
  assert.equal(clipped.width, 50);
  assert.equal(clipped.height, 50);
  assert.ok(clipped.translate(10, 20).scale(2).toSVG().startsWith("<svg"));
});

test("cellGrid rejects malformed patterns and invalid addresses", () => {
  assert.throws(
    () => cellGrid({ diagonals: [["\\", "/"], ["\\"]] }),
    /rectangular matrix/,
  );
  assert.throws(
    () => cellGrid({ rows: 2, columns: 2, shadedTriangles: [[2, 0, "nw"]] }),
    /outside/,
  );
  assert.throws(
    () => cellGrid({ rows: 2, columns: 2, shadedTriangles: [[0, 0, "middle"]] }),
    /corner/,
  );
  assert.throws(
    () => cellGrid({ rows: 2, columns: 2, shadedCells: [[null, null]] }),
    /integer/,
  );
  assert.throws(
    () => cellGrid({ rows: 2, columns: 2, shadedCells: [{ column: 0, row: 0, opacity: 2 }] }),
    /opacity/,
  );
});

test("statistics helpers render representative datasets", () => {
  const diagrams = {
    histogram: histogram([1, 1.5, 2, 2.1, 2.2, 4], { bins: 4 }),
    barChart: barChart([{ label: "A", value: 3 }, { label: "B", value: 5 }]),
    scatterPlot: scatterPlot([{ x: 1, y: 2 }, { x: 2, y: 4 }]),
    boxPlot: boxPlot([1, 2, 3, 4, 5, 9]),
    pieChart: pieChart([{ label: "A", value: 2 }, { label: "B", value: 3 }]),
    oneSlicePieChart: pieChart([{ label: "All", value: 1 }]),
  };
  for (const [name, diagram] of Object.entries(diagrams)) assertRenderable(diagram, name);
});

test("general math diagrams render", () => {
  const diagrams = {
    vennDiagram: vennDiagram(["A", "B", "C"]),
    probabilityTree: probabilityTree({
      label: "Start",
      children: [
        { label: "Heads", probability: "1/2" },
        { label: "Tails", probability: "1/2" },
      ],
    }),
    rightTriangle: rightTriangle(3, 4),
    pythagoras: pythagoras(3, 4),
    spiral: spiral({ turns: 3, endRadius: 80 }),
    sierpinski: sierpinski(3, { size: 200 }),
  };
  for (const [name, diagram] of Object.entries(diagrams)) assertRenderable(diagram, name);
});

test("radialPolygon creates regular partitions and alternating-radius spikes", () => {
  const partition = radialPolygon(12, {
    radius: 120,
    palette: ["#1598d5", "#ffad2f"],
    stroke: "#172033",
    strokeWidth: 3,
  });
  const spiked = radialPolygon({
    spikes: 6,
    radius: 120,
    innerRadius: 62,
    palette: ["#7c3aed", "#fbbf24"],
  });

  assertRenderable(partition, "regular radial partition");
  assertRenderable(spiked, "spiked radial polygon");
  assert.ok(Math.abs(partition.anchor("vertex0").distanceTo(partition.anchor("center")) - 120) < 1e-9);
  assert.ok(Math.abs(spiked.anchor("vertex0").distanceTo(spiked.anchor("center")) - 120) < 1e-9);
  assert.ok(Math.abs(spiked.anchor("vertex1").distanceTo(spiked.anchor("center")) - 62) < 1e-9);
  assert.equal(radialPartition, radialPolygon);
});

test("radialPolygon validates radial grammar inputs", () => {
  assert.throws(() => radialPolygon(2), /at least 3/);
  assert.throws(() => radialPolygon(5, { innerRadius: 40 }), /even parts count/);
  assert.throws(() => radialPolygon({ parts: 10, spikes: 6 }), /twice/);
  assert.throws(() => radialPolygon(6, { radii: [20, 30] }), /exactly 6/);
  assert.throws(() => radialPolygon(6, { palette: [] }), /non-empty array/);
});

test("histogram bin formatters do not replace numeric y-axis formatting", () => {
  const diagram = histogram([1, 2, 3, 4, 5, 6], {
    bins: [0, 2, 4, 6],
    formatter: bin => `${bin.min}-${bin.max}`,
  });
  const svg = renderSVG(diagram);

  assert.match(svg, />0-2</);
  assert.doesNotMatch(svg, /undefined|NaN|Infinity/);
});

test("invalid chart data fails with useful errors", () => {
  assert.throws(() => pieChart([0, 0]), /positive value/);
  assert.throws(() => probabilityTree(null), /tree object/);
  assert.throws(() => functionPlot(null), /function/);
});
