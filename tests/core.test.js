import test from "node:test";
import assert from "node:assert/strict";
import {
  angleMark,
  circle,
  column,
  dimensionLine,
  extendLine,
  path,
  pen,
  point,
  polygon,
  renderSVG,
  row,
  text,
  arc,
  connect,
  math,
  mathText,
  overlay,
  parallelMarks,
  rightAngleMark,
  sideTicks,
  stack,
} from "../src/index.js";

test("fluent transforms accept numeric x/y coordinates", () => {
  const moved = circle(10).translate(-40, 12);
  assert.equal(moved.center.x, -40);
  assert.equal(moved.center.y, 12);
});

test("row preserves the requested visual gap", () => {
  const diagram = row(20, [circle(10), circle(10)]);
  assert.equal(diagram.width, 64); // two diameter-22 ink bounds plus a 20 gap
});

test("column lays diagrams out without overlap", () => {
  const diagram = column(10, [text("A", 20), text("B", 20)]);
  assert.ok(diagram.height >= 60);
});

test("later fluent styles override earlier styles", () => {
  const svg = renderSVG(circle(10).fill("red").fill("blue"), { padding: 0 });
  assert.match(svg, /fill="blue"/);
  assert.doesNotMatch(svg, /fill="red"/);
});

test("SVG output is deterministic", () => {
  const diagram = circle(20).clip(circle(10));
  assert.equal(renderSVG(diagram), renderSVG(diagram));
});

test("zero-valued polygon coordinates are preserved", () => {
  const diagram = polygon([[0, 0], [10, 0], [0, 10]]);
  assert.equal(diagram.bounds.minX, -1);
  assert.equal(diagram.bounds.minY, -1);
});

test("cubic path bounds include interior extrema", () => {
  const data = pen().moveTo(0, 0).cubicTo(0, 100, 100, 100, 100, 0);
  const diagram = path(data);
  assert.ok(diagram.bounds.maxY > 70 && diagram.bounds.maxY < 80);
});

test("text is XML escaped", () => {
  const svg = renderSVG(text("a < b & c", 16));
  assert.match(svg, /a &lt; b &amp; c/);
});

test("plain diagram text uses the CoFo Sans family", () => {
  const svg = renderSVG(text("CoFo label", 18));
  assert.match(svg, /font-family="[^"]*CoFo Sans/);
});

test("arc paths use analytic bounds rather than endpoint radius boxes", () => {
  const quarter = arc(100, 0, Math.PI / 2);
  assert.ok(quarter.bounds.minX >= -2);
  assert.ok(quarter.bounds.minY >= -2);
  assert.ok(quarter.bounds.maxX <= 102);
  assert.ok(quarter.bounds.maxY <= 102);
});

test("circle connectors terminate on the actual circumference", () => {
  const first = circle(20).translate(0, 0);
  const second = circle(20).translate(100, 100);
  const connector = connect(first, second);
  const expected = 20 / Math.sqrt(2);
  assert.ok(Math.abs(connector.bounds.minX - (expected - 1)) < 0.01);
  assert.ok(Math.abs(connector.bounds.minY - (expected - 1)) < 0.01);
});

test("math() emits standalone TeX SVG geometry", () => {
  const svg = renderSVG(math(String.raw`\frac{x^2}{\sqrt{y}}`, 24));
  assert.match(svg, /<path\b/);
  assert.doesNotMatch(svg, /foreignObject|(?:href|src)=["']https?:\/\//);
  assert.doesNotMatch(svg, />\\frac/);
});

test("prose inside MathJax formulas uses CoFo Sans while symbols remain paths", () => {
  const svg = renderSVG(math(String.raw`\text{speed}=5`, 22));
  assert.match(svg, /CoFo Sans/);
  assert.match(svg, /<path\b/);
});

test("dollar-delimited text is promoted to real math geometry", () => {
  const svg = renderSVG(text("$x^2$", 22));
  assert.match(svg, /data-mml-node/);
  assert.equal(typeof mathText, "function");
});

test("styles applied to grouped diagrams propagate to their primitives", () => {
  const svg = renderSVG(row(4, [circle(5), circle(5)]).fill("magenta"));
  assert.equal((svg.match(/fill="magenta"/g) ?? []).length, 2);
});

test("stack is canonical while overlay remains a compatibility alias", () => {
  assert.equal(overlay, stack);

  const layers = [circle(20).fill("navy"), circle(8).fill("white")];
  assert.equal(renderSVG(overlay(layers)), renderSVG(stack(layers)));
});

test("angleMark calculates minor and major sweeps with automatic labels", () => {
  const minor = angleMark([0, 0], [100, 0], [0, 100], {
    label: "x",
    fill: "orange",
  });
  const major = angleMark([0, 0], [100, 0], [0, 100], {
    mode: "major",
    label: "y",
    fill: "blue",
  });

  assert.ok(minor.anchor("label").x > 0);
  assert.ok(minor.anchor("label").y > 0);
  assert.ok(major.anchor("label").x < 0);
  assert.ok(major.anchor("label").y < 0);
  assert.match(renderSVG(minor), />x<\/text>/);
  assert.match(renderSVG(major), />y<\/text>/);
});

test("angleMark rejects a zero-length or repeated ray", () => {
  assert.throws(
    () => angleMark([0, 0], [0, 0], [20, 0]),
    /must differ from the vertex/,
  );
  assert.throws(
    () => angleMark([0, 0], [20, 0], [40, 0]),
    /two distinct rays/,
  );
});

test("extendLine exposes original and extended endpoints", () => {
  const extended = extendLine([0, 0], [100, 0], { before: 20, after: 30 });
  assert.equal(extended.anchor("start").x, 0);
  assert.equal(extended.anchor("end").x, 100);
  assert.equal(extended.anchor("extendedStart").x, -20);
  assert.equal(extended.anchor("extendedEnd").x, 130);
});

test("semantic geometry annotations render finite SVG", () => {
  const diagram = stack([
    rightAngleMark([0, 0], [50, 0], [0, 50]),
    sideTicks([-50, 70], [50, 70], { count: 2 }),
    parallelMarks([-50, 100], [50, 100], { count: 2 }),
    dimensionLine([-50, 130], [50, 130], { unit: " cm", precision: 0 }),
  ]);
  const svg = renderSVG(diagram);
  assert.match(svg, />100 cm<\/text>/);
  assert.doesNotMatch(svg, /NaN|Infinity|undefined/);
});
