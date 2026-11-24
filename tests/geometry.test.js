import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ArcSegment,
  Bounds,
  CubicSegment,
  EPSILON,
  LineSegment,
  Matrix,
  Point,
  QuadraticSegment,
  Vector,
  angleOnSweep,
  nearlyEqual,
  pathBounds,
  quadraticRoots,
  svgArcToCenter,
} from '../src/geometry/index.js';

function close(actual, expected, epsilon = 1e-9, message) {
  assert.ok(
    Math.abs(actual - expected) <= epsilon * Math.max(1, Math.abs(actual), Math.abs(expected)),
    message ?? `Expected ${actual} to be within ${epsilon} of ${expected}`,
  );
}

function pointClose(actual, expected, epsilon = 1e-9) {
  close(actual.x, expected.x, epsilon);
  close(actual.y, expected.y, epsilon);
}

function boundsClose(actual, expected, epsilon = 1e-9) {
  close(actual.minX, expected.minX, epsilon);
  close(actual.minY, expected.minY, epsilon);
  close(actual.maxX, expected.maxX, epsilon);
  close(actual.maxY, expected.maxY, epsilon);
}

test('numeric helpers handle scaled equality, roots, and angular sweeps', () => {
  assert.equal(nearlyEqual(1_000_000_000, 1_000_000_000.5), true);
  assert.deepEqual(quadraticRoots(1, -3, 2), [1, 2]);
  assert.deepEqual(quadraticRoots(0, 2, -8), [4]);
  assert.equal(angleOnSweep(Math.PI / 2, 0, Math.PI), true);
  assert.equal(angleOnSweep(-Math.PI / 2, 0, Math.PI), false);
  assert.equal(angleOnSweep(-Math.PI / 2, 0, -Math.PI), true);
  assert.ok(EPSILON > 0);
});

test('Point and Vector preserve point/vector semantics', () => {
  const p = new Point(2, 3);
  const q = p.add(new Vector(4, -1));
  assert.deepEqual(q.toArray(), [6, 2]);
  assert.deepEqual(q.subtract(p).toArray(), [4, -1]);
  close(p.distanceTo(q), Math.sqrt(17));

  const v = new Vector(3, 4);
  close(v.magnitude(), 5);
  pointClose(v.normalized(), new Vector(0.6, 0.8));
  assert.deepEqual(v.perpendicular().toArray(), [-4, 3]);
  close(v.cross(new Vector(1, 2)), 2);
  pointClose(new Vector(1, 0).rotate(Math.PI / 2), new Vector(0, 1));
  assert.deepEqual(new Vector(0, 0).normalized().toArray(), [0, 0]);
});

test('Matrix composes affine transforms and has a reliable inverse', () => {
  const matrix = Matrix.translation(10, -4).multiply(Matrix.rotation(Math.PI / 2)).multiply(Matrix.scaling(2, 3));
  const transformed = matrix.applyToPoint(new Point(1, 2));
  pointClose(transformed, new Point(4, -2));
  pointClose(matrix.applyToVector(new Vector(1, 2)), new Vector(-6, 2));

  const inverse = matrix.inverse();
  assert.ok(inverse);
  pointClose(inverse.applyToPoint(transformed), new Point(1, 2));
  assert.ok(matrix.multiply(inverse).isIdentity());
  assert.equal(Matrix.scaling(0).inverse(), null);

  const usingThen = Matrix.translation(5, 0).then(Matrix.scaling(2));
  pointClose(usingThen.applyToPoint(new Point(1, 0)), new Point(12, 0));
});

test('Bounds union, intersection, expansion, support, and transforms are immutable', () => {
  const original = Bounds.fromPoints([new Point(-2, 3), new Point(4, -5)]);
  boundsClose(original, new Bounds(-2, -5, 4, 3));
  boundsClose(original.includePoint(new Point(10, 0)), new Bounds(-2, -5, 10, 3));
  boundsClose(original, new Bounds(-2, -5, 4, 3));

  boundsClose(original.union(new Bounds(3, 2, 8, 9)), new Bounds(-2, -5, 8, 9));
  boundsClose(original.intersect(new Bounds(3, 2, 8, 9)), new Bounds(3, 2, 4, 3));
  assert.equal(original.intersect(new Bounds(20, 20, 30, 30)).isEmpty, true);
  boundsClose(original.expand(2, 1), new Bounds(-4, -6, 6, 4));
  close(original.support(new Vector(2, -3)), 23);
  pointClose(original.anchor('topRight'), new Point(4, -5));

  const rotated = Bounds.fromRect(0, 0, 2, 4).transform(Matrix.rotation(Math.PI / 2));
  boundsClose(rotated, new Bounds(-4, 0, 0, 2));
});

test('line segment bounds and reversal are exact', () => {
  const line = new LineSegment(new Point(-3, 4), new Point(8, -2));
  boundsClose(line.bounds(), new Bounds(-3, -2, 8, 4));
  pointClose(line.pointAt(0.25), new Point(-0.25, 2.5));
  pointClose(line.reverse().start, line.end);
});

test('quadratic bounds use derivative extrema instead of control-point bounds', () => {
  const curve = new QuadraticSegment([0, 0], [10, 20], [20, 0]);
  boundsClose(curve.bounds(), new Bounds(0, 0, 20, 10));
  assert.deepEqual(curve.extremaParameters(), [0.5]);
  pointClose(curve.pointAt(0.5), new Point(10, 10));
});

test('cubic bounds find both roots of each derivative robustly', () => {
  const arch = new CubicSegment([0, 0], [0, 100], [100, 100], [100, 0]);
  boundsClose(arch.bounds(), new Bounds(0, 0, 100, 75));

  const loop = new CubicSegment([0, 0], [100, 0], [-100, 0], [0, 0]);
  const extent = 50 / Math.sqrt(3);
  boundsClose(loop.bounds(), new Bounds(-extent, 0, extent, 0));
  assert.equal(loop.extremaParameters().length, 2);

  const transformed = arch.transform(Matrix.rotation(Math.PI / 2));
  boundsClose(transformed.bounds(), new Bounds(-75, 0, 0, 100));
});

test('center-parameterized circular and rotated elliptical arc bounds are analytic', () => {
  const quarter = ArcSegment.fromCenter([0, 0], 10, 10, 0, Math.PI / 2);
  boundsClose(quarter.bounds(), new Bounds(0, 0, 10, 10));
  pointClose(quarter.pointAt(0), new Point(10, 0));
  pointClose(quarter.pointAt(1), new Point(0, 10));

  const full = ArcSegment.fromCenter([3, -2], 10, 4, 0, Math.PI * 2, Math.PI / 4);
  const extent = Math.sqrt(58);
  boundsClose(full.bounds(), new Bounds(3 - extent, -2 - extent, 3 + extent, -2 + extent));

  for (let index = 0; index <= 1_000; index += 1) {
    assert.equal(full.bounds().containsPoint(full.pointAt(index / 1_000), 1e-8), true);
  }
});

test('SVG endpoint arcs correct undersized radii and honor sweep direction', () => {
  const centerData = svgArcToCenter([0, 0], [20, 0], 5, 5, 0, false, true);
  close(centerData.radiusX, 10);
  close(centerData.radiusY, 10);

  const lowerHalf = ArcSegment.fromSvg([0, 0], [20, 0], 5, 5, 0, false, true);
  boundsClose(lowerHalf.bounds(), new Bounds(0, -10, 20, 0));
  pointClose(lowerHalf.pointAt(0), new Point(0, 0));
  pointClose(lowerHalf.pointAt(1), new Point(20, 0));

  const reversed = lowerHalf.reverse();
  pointClose(reversed.start, lowerHalf.end);
  pointClose(reversed.end, lowerHalf.start);
  boundsClose(reversed.bounds(), lowerHalf.bounds());
});

test('SVG endpoint arc rotation is specified in degrees', () => {
  const arc = ArcSegment.fromSvg([-10, 0], [10, 0], 10, 5, 90, false, true);
  close(arc.rotation, Math.PI / 2);
  close(arc.rotationDegrees, 90);
  pointClose(arc.pointAt(0), new Point(-10, 0));
  pointClose(arc.pointAt(1), new Point(10, 0));
});

test('affine transforms preserve exact arc bounds under shear', () => {
  const circle = ArcSegment.fromCenter([0, 0], 10, 10, 0, Math.PI * 2);
  const shear = Matrix.skewX(Math.PI / 4).multiply(Matrix.translation(3, -2));
  const transformed = circle.transform(shear);
  const bounds = transformed.bounds();

  const expectedXExtent = 10 * Math.sqrt(2);
  boundsClose(bounds, new Bounds(1 - expectedXExtent, -12, 1 + expectedXExtent, 8));
  for (let index = 0; index <= 2_000; index += 1) {
    assert.equal(bounds.containsPoint(transformed.pointAt(index / 2_000), 1e-8), true);
  }
});

test('pathBounds combines heterogeneous segment bounds', () => {
  const segments = [
    new LineSegment([0, 0], [10, 0]),
    new QuadraticSegment([10, 0], [15, 10], [20, 0]),
    ArcSegment.fromCenter([20, 5], 5, 5, -Math.PI / 2, Math.PI),
  ];
  boundsClose(pathBounds(segments), new Bounds(0, 0, 25, 10));
});
