import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LineSegment,
  angleBisector,
  lineIntersection,
  parallelThrough,
  perpendicularThrough,
  projectPoint,
  projectPointToSegment,
  segmentIntersection,
  triangleCenters,
  triangleCentroid,
  triangleCircumcenter,
  triangleIncenter,
  triangleOrthocenter,
} from '../src/geometry/index.js';
import {
  line as drawLine,
  lineIntersection as rootLineIntersection,
  point,
  renderSvg,
} from '../src/index.js';

function close(actual, expected, epsilon = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `Expected ${actual} to be close to ${expected}`);
}

function pointClose(actual, x, y, epsilon = 1e-9) {
  assert.ok(actual);
  close(actual.x, x, epsilon);
  close(actual.y, y, epsilon);
}

test('line and segment intersections handle endpoint and segment overloads', () => {
  pointClose(lineIntersection([0, 0], [10, 0], [4, -5], [4, 5]), 4, 0);
  assert.equal(lineIntersection([0, 0], [10, 0], [0, 2], [10, 2]), null);

  const horizontal = new LineSegment([0, 0], [10, 0]);
  const vertical = new LineSegment([6, -5], [6, 5]);
  pointClose(lineIntersection(horizontal, vertical), 6, 0);
  pointClose(segmentIntersection(horizontal, vertical), 6, 0);

  assert.equal(segmentIntersection([0, 0], [2, 0], [3, -1], [3, 1]), null);
  pointClose(segmentIntersection([0, 0], [2, 0], [2, 0], [4, 0]), 2, 0);
  assert.equal(segmentIntersection([0, 0], [3, 0], [1, 0], [4, 0]), null);
});

test('point projection supports infinite lines, clamped segments, and segment overloads', () => {
  pointClose(projectPoint([12, 7], [0, 0], [10, 0]), 12, 0);
  pointClose(projectPoint([12, 7], [0, 0], [10, 0], { clamp: true }), 10, 0);
  pointClose(projectPointToSegment([-3, 7], new LineSegment([0, 0], [10, 0])), 0, 0);
  assert.throws(() => projectPoint([1, 1], [0, 0], [0, 0]), /distinct line points/);
});

test('parallelThrough and perpendicularThrough create centered drawable segments', () => {
  const parallel = parallelThrough([5, 8], [0, 0], [10, 0], { length: 20 });
  pointClose(parallel.start, -5, 8);
  pointClose(parallel.end, 15, 8);

  const perpendicular = perpendicularThrough([5, 8], new LineSegment([0, 0], [10, 0]), { length: 12 });
  pointClose(perpendicular.start, 5, 2);
  pointClose(perpendicular.end, 5, 14);
  close(parallel.derivativeAt().dot(perpendicular.derivativeAt()), 0);
});

test('angleBisector constructs internal and external ray bisectors', () => {
  const internal = angleBisector([0, 0], [10, 0], [0, 10], { length: Math.sqrt(2) * 10 });
  pointClose(internal.start, 0, 0);
  pointClose(internal.end, 10, 10);

  const external = angleBisector([0, 0], [10, 0], [0, 10], {
    mode: 'external',
    length: Math.sqrt(2) * 10,
  });
  pointClose(external.end, 10, -10);
});

test('the four standard triangle centers are exact for a right triangle', () => {
  const a = [0, 0];
  const b = [6, 0];
  const c = [0, 8];
  pointClose(triangleCentroid(a, b, c), 2, 8 / 3);
  pointClose(triangleIncenter(a, b, c), 2, 2);
  pointClose(triangleCircumcenter(a, b, c), 3, 4);
  pointClose(triangleOrthocenter(a, b, c), 0, 0);

  const centers = triangleCenters(a, b, c);
  pointClose(centers.centroid, 2, 8 / 3);
  pointClose(centers.incenter, 2, 2);
  pointClose(centers.circumcenter, 3, 4);
  pointClose(centers.orthocenter, 0, 0);
  assert.equal(Object.isFrozen(centers), true);

  assert.equal(triangleIncenter([0, 0], [1, 0], [2, 0]), null);
  assert.equal(triangleCircumcenter([0, 0], [1, 0], [2, 0]), null);
  assert.equal(triangleOrthocenter([0, 0], [1, 0], [2, 0]), null);
});

test('construction helpers are available to root Studio DSL code', () => {
  const crossing = rootLineIntersection(point(-10, 0), point(10, 0), [0, -10], [0, 10]);
  pointClose(crossing, 0, 0);
  const svg = renderSvg(drawLine([-10, 0], crossing).stroke('#111827', 2));
  assert.match(svg, /<path/);
});
