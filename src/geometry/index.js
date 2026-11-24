export {
  EPSILON,
  angleDelta,
  angleOnSweep,
  clamp,
  cubicRoots,
  finiteOr,
  isFiniteNumber,
  lerp,
  nearlyEqual,
  normalizeAngle,
  positiveModulo,
  quadraticRoots,
  solveLinear,
  solveQuadratic,
} from './numeric.js';
export { Point } from './point.js';
export { Vector } from './vector.js';
export { Matrix } from './matrix.js';
export { Bounds } from './bounds.js';
export {
  ArcSegment,
  CubicSegment,
  LineSegment,
  QuadraticSegment,
  pathBounds,
  segmentBounds,
  svgArcToCenter,
} from './segments.js';
export {
  angleBisector,
  centroid,
  circumcenter,
  incenter,
  lineIntersection,
  orthocenter,
  parallelThrough,
  perpendicularThrough,
  projectPoint,
  projectPointToLine,
  projectPointToSegment,
  segmentIntersection,
  triangleCenters,
  triangleCentroid,
  triangleCircumcenter,
  triangleIncenter,
  triangleOrthocenter,
} from './constructions.js';

import { Point } from './point.js';
import { Vector } from './vector.js';

export function point(x = 0, y = 0) {
  return new Point(x, y);
}

export function vector(x = 0, y = 0) {
  return new Vector(x, y);
}

export function polar(angle, magnitude = 1) {
  return Vector.fromAngle(angle, magnitude);
}

export function midpoint(a, b) {
  return Point.from(a).lerp(Point.from(b), 0.5);
}

export function distance(a, b) {
  return Point.from(a).distanceTo(Point.from(b));
}

export function normalizePoint(value) {
  if (value instanceof Point) return value;
  if (Array.isArray(value)) return new Point(value[0] ?? 0, value[1] ?? 0);
  if (value && typeof value === 'object') return new Point(value.x ?? 0, value.y ?? 0);
  throw new TypeError('Expected a point, [x, y], or {x, y} value.');
}
