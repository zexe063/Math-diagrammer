import test from "node:test";
import assert from "node:assert/strict";

import {
  placeLabels,
  point,
  polygonDiagram,
  renderSVG,
  triangleDiagram,
} from "../src/index.js";

function assertRenderable(diagram) {
  const svg = renderSVG(diagram);
  assert.match(svg, /^<svg\b/);
  assert.doesNotMatch(svg, /NaN|Infinity|undefined/);
  return svg;
}

test("placeLabels deterministically avoids segments and earlier labels", () => {
  const items = [
    { value: "A", at: point(0, 0), direction: [0, -1], name: "first" },
    { value: "B", at: point(0, 0), direction: [0, -1], name: "second" },
  ];
  const options = { obstacles: [[[ -30, -24 ], [ 30, -24 ]]] };
  const first = placeLabels(items, options);
  const second = placeLabels(items, options);

  assert.deepEqual(first.anchor("first"), second.anchor("first"));
  assert.deepEqual(first.anchor("second"), second.anchor("second"));
  assert.notDeepEqual(first.anchor("first"), first.anchor("second"));
  assert.ok(first.anchor("first").y < -24);
  assertRenderable(first);
});

test("polygonDiagram owns regular layout, labels, marks, and extensions", () => {
  const diagram = polygonDiagram(5, {
    vertexLabels: ["A", "B", "C", "D", "E"],
    sideLabels: ["a", "b", "c", "d", "e"],
    angleLabels: { A: "x", C: "y" },
    sideMarks: { AB: 1, BC: 1, CD: 2 },
    parallelMarks: { DE: 1 },
    angleMarks: { A: 1, C: { count: 2 } },
    extensions: [{ side: "AB", after: 60, afterLabel: "F" }],
  });
  const svg = assertRenderable(diagram);

  assert.equal(diagram.anchor("A").y, -130);
  assert.ok(diagram.anchor("vertexLabel0").y < diagram.anchor("A").y);
  assert.ok(diagram.anchor("extension0After").distanceTo(diagram.anchor("B")) > 59);
  for (const value of ["A", "B", "C", "D", "E", "a", "b", "c", "d", "e", "x", "y", "F"]) {
    assert.match(svg, new RegExp(`>${value}</text>`));
  }
});

test("polygonDiagram accepts explicit points and named side references", () => {
  const diagram = polygonDiagram({
    points: [[-100, 70], [90, 70], [120, -40], [-45, -95]],
    labels: ["P", "Q", "R", "S"],
    sideLabels: { PQ: "p", QR: "q" },
    sideMarks: { PQ: 1, RS: 2 },
    angleMarks: { P: "p" },
    extensions: { QR: { after: 35 } },
  });

  assert.deepEqual(diagram.anchor("P"), point(-100, 70));
  assert.ok(diagram.anchor("extension0After").distanceTo(diagram.anchor("R")) > 34);
  assert.match(assertRenderable(diagram), />p<\/text>/);
  assert.match(assertRenderable(diagram), />q<\/text>/);
});

test("triangleDiagram creates presets and infers marks from side lengths", () => {
  const right = triangleDiagram({
    layout: "right",
    sideLabels: true,
    angleLabels: { B: "x" },
    extensions: [{ side: "AB", after: 50, afterLabel: "D" }],
  });
  const measured = triangleDiagram({ lengths: [3, 4, 5], sideLabels: true });

  assert.equal(right.anchor("A").x, right.anchor("C").x);
  assert.match(assertRenderable(right), />x<\/text>/);
  assert.match(assertRenderable(right), />D<\/text>/);

  const ab = measured.anchor("A").distanceTo(measured.anchor("B"));
  const bc = measured.anchor("B").distanceTo(measured.anchor("C"));
  const ca = measured.anchor("C").distanceTo(measured.anchor("A"));
  assert.ok(Math.abs(ab / bc - 3 / 4) < 1e-9);
  assert.ok(Math.abs(bc / ca - 4 / 5) < 1e-9);
  assertRenderable(measured);
});

test("triangle and polygon diagrams reject impossible geometry", () => {
  assert.throws(() => polygonDiagram(2), /at least three sides/);
  assert.throws(() => polygonDiagram([[0, 0], [0, 0], [10, 10]]), /distinct adjacent points/);
  assert.throws(() => triangleDiagram({ lengths: [1, 2, 4] }), /triangle inequality/);
  assert.throws(() => triangleDiagram({ layout: "circular" }), /Unknown triangle layout/);
});
