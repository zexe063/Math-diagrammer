import { Bounds } from './bounds.js';
import { Point } from './point.js';
import { Vector } from './vector.js';
import { angleOnSweep, clamp, EPSILON, quadraticRoots } from './numeric.js';

function unitIntervalRoots(values, epsilon = EPSILON) {
  return values.filter((value) => value > epsilon && value < 1 - epsilon);
}

function uniqueParameters(values, epsilon = EPSILON) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.filter((value, index) => index === 0 || Math.abs(value - sorted[index - 1]) > epsilon);
}

function componentBounds(segment, parameters) {
  return Bounds.fromPoints(uniqueParameters(parameters).map((t) => segment.pointAt(t)));
}

export class LineSegment {
  constructor(start, end) {
    this.start = Point.from(start);
    this.end = Point.from(end);
    Object.freeze(this);
  }

  pointAt(t) {
    return this.start.lerp(this.end, t);
  }

  at(t) {
    return this.pointAt(t);
  }

  derivativeAt() {
    return this.end.subtract(this.start);
  }

  tangentAt(t = 0) {
    return this.derivativeAt(t).normalized();
  }

  bounds() {
    return Bounds.fromPoints([this.start, this.end]);
  }

  reverse() {
    return new LineSegment(this.end, this.start);
  }

  transform(matrix) {
    return new LineSegment(matrix.applyToPoint(this.start), matrix.applyToPoint(this.end));
  }

  transformed(matrix) {
    return this.transform(matrix);
  }
}

export class QuadraticSegment {
  constructor(start, control, end) {
    this.start = Point.from(start);
    this.control = Point.from(control);
    this.end = Point.from(end);
    Object.freeze(this);
  }

  pointAt(t) {
    const u = 1 - t;
    return new Point(
      u * u * this.start.x + 2 * u * t * this.control.x + t * t * this.end.x,
      u * u * this.start.y + 2 * u * t * this.control.y + t * t * this.end.y,
    );
  }

  at(t) {
    return this.pointAt(t);
  }

  derivativeAt(t) {
    return new Vector(
      2 * ((1 - t) * (this.control.x - this.start.x) + t * (this.end.x - this.control.x)),
      2 * ((1 - t) * (this.control.y - this.start.y) + t * (this.end.y - this.control.y)),
    );
  }

  tangentAt(t) {
    return this.derivativeAt(t).normalized();
  }

  extremaParameters() {
    const roots = [];
    for (const key of ['x', 'y']) {
      const denominator = this.start[key] - 2 * this.control[key] + this.end[key];
      if (Math.abs(denominator) > EPSILON) roots.push((this.start[key] - this.control[key]) / denominator);
    }
    return uniqueParameters(unitIntervalRoots(roots));
  }

  bounds() {
    return componentBounds(this, [0, 1, ...this.extremaParameters()]);
  }

  reverse() {
    return new QuadraticSegment(this.end, this.control, this.start);
  }

  transform(matrix) {
    return new QuadraticSegment(
      matrix.applyToPoint(this.start),
      matrix.applyToPoint(this.control),
      matrix.applyToPoint(this.end),
    );
  }

  transformed(matrix) {
    return this.transform(matrix);
  }
}

export class CubicSegment {
  constructor(start, control1, control2, end) {
    this.start = Point.from(start);
    this.control1 = Point.from(control1);
    this.control2 = Point.from(control2);
    this.end = Point.from(end);
    Object.freeze(this);
  }

  pointAt(t) {
    const u = 1 - t;
    return new Point(
      u ** 3 * this.start.x + 3 * u * u * t * this.control1.x + 3 * u * t * t * this.control2.x + t ** 3 * this.end.x,
      u ** 3 * this.start.y + 3 * u * u * t * this.control1.y + 3 * u * t * t * this.control2.y + t ** 3 * this.end.y,
    );
  }

  at(t) {
    return this.pointAt(t);
  }

  derivativeAt(t) {
    const u = 1 - t;
    return new Vector(
      3 * u * u * (this.control1.x - this.start.x) + 6 * u * t * (this.control2.x - this.control1.x) + 3 * t * t * (this.end.x - this.control2.x),
      3 * u * u * (this.control1.y - this.start.y) + 6 * u * t * (this.control2.y - this.control1.y) + 3 * t * t * (this.end.y - this.control2.y),
    );
  }

  tangentAt(t) {
    return this.derivativeAt(t).normalized();
  }

  extremaParameters() {
    const roots = [];
    for (const key of ['x', 'y']) {
      const p0 = this.start[key];
      const p1 = this.control1[key];
      const p2 = this.control2[key];
      const p3 = this.end[key];
      const a = -p0 + 3 * p1 - 3 * p2 + p3;
      const b = 2 * (p0 - 2 * p1 + p2);
      const c = p1 - p0;
      roots.push(...quadraticRoots(a, b, c));
    }
    return uniqueParameters(unitIntervalRoots(roots));
  }

  bounds() {
    return componentBounds(this, [0, 1, ...this.extremaParameters()]);
  }

  reverse() {
    return new CubicSegment(this.end, this.control2, this.control1, this.start);
  }

  transform(matrix) {
    return new CubicSegment(
      matrix.applyToPoint(this.start),
      matrix.applyToPoint(this.control1),
      matrix.applyToPoint(this.control2),
      matrix.applyToPoint(this.end),
    );
  }

  transformed(matrix) {
    return this.transform(matrix);
  }
}

function vectorAngle(ux, uy, vx, vy) {
  return Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
}

/** Convert an SVG endpoint arc into center parameterization. */
export function svgArcToCenter(start, end, radiusX, radiusY, rotationDegrees = 0, largeArc = false, sweep = true) {
  const p0 = Point.from(start);
  const p1 = Point.from(end);
  let rx = Math.abs(Number(radiusX));
  let ry = Math.abs(Number(radiusY));
  const phi = Number(rotationDegrees) * Math.PI / 180;

  if (p0.equals(p1) || rx <= EPSILON || ry <= EPSILON) {
    return {
      center: p0.lerp(p1, 0.5), radiusX: rx, radiusY: ry, rotation: phi,
      rotationDegrees: Number(rotationDegrees),
      startAngle: 0, sweepAngle: 0, degenerate: true,
    };
  }

  const cosine = Math.cos(phi);
  const sine = Math.sin(phi);
  const halfDx = (p0.x - p1.x) / 2;
  const halfDy = (p0.y - p1.y) / 2;
  const xPrime = cosine * halfDx + sine * halfDy;
  const yPrime = -sine * halfDx + cosine * halfDy;

  const radiiScale = (xPrime * xPrime) / (rx * rx) + (yPrime * yPrime) / (ry * ry);
  if (radiiScale > 1) {
    const scale = Math.sqrt(radiiScale);
    rx *= scale;
    ry *= scale;
  }

  const rx2 = rx * rx;
  const ry2 = ry * ry;
  const numerator = Math.max(0, rx2 * ry2 - rx2 * yPrime * yPrime - ry2 * xPrime * xPrime);
  const denominator = rx2 * yPrime * yPrime + ry2 * xPrime * xPrime;
  const sign = largeArc === sweep ? -1 : 1;
  const coefficient = denominator <= EPSILON ? 0 : sign * Math.sqrt(numerator / denominator);
  const centerPrimeX = coefficient * (rx * yPrime) / ry;
  const centerPrimeY = coefficient * (-ry * xPrime) / rx;
  const center = new Point(
    cosine * centerPrimeX - sine * centerPrimeY + (p0.x + p1.x) / 2,
    sine * centerPrimeX + cosine * centerPrimeY + (p0.y + p1.y) / 2,
  );

  const ux = (xPrime - centerPrimeX) / rx;
  const uy = (yPrime - centerPrimeY) / ry;
  const vx = (-xPrime - centerPrimeX) / rx;
  const vy = (-yPrime - centerPrimeY) / ry;
  const startAngle = Math.atan2(uy, ux);
  let sweepAngle = vectorAngle(ux, uy, vx, vy);
  if (!sweep && sweepAngle > 0) sweepAngle -= Math.PI * 2;
  if (sweep && sweepAngle < 0) sweepAngle += Math.PI * 2;

  return {
    center, radiusX: rx, radiusY: ry, rotation: phi,
    rotationDegrees: Number(rotationDegrees), startAngle, sweepAngle, degenerate: false,
  };
}

export class ArcSegment {
  constructor(start, end, radiusX, radiusY = radiusX, rotationDegrees = 0, largeArc = false, sweep = true) {
    this.start = Point.from(start);
    this.end = Point.from(end);
    this.largeArc = Boolean(largeArc);
    this.sweep = Boolean(sweep);
    const values = svgArcToCenter(this.start, this.end, radiusX, radiusY, rotationDegrees, largeArc, sweep);
    Object.assign(this, values);
    this.basisX = new Vector(
      this.radiusX * Math.cos(this.rotation),
      this.radiusX * Math.sin(this.rotation),
    );
    this.basisY = new Vector(
      -this.radiusY * Math.sin(this.rotation),
      this.radiusY * Math.cos(this.rotation),
    );
    Object.freeze(this);
  }

  static fromSvg(start, end, radiusX, radiusY = radiusX, rotationDegrees = 0, largeArc = false, sweep = true) {
    return new ArcSegment(start, end, radiusX, radiusY, rotationDegrees, largeArc, sweep);
  }

  static fromSvgEndpoint(start, end, radiusX, radiusY = radiusX, rotationDegrees = 0, largeArc = false, sweep = true) {
    return ArcSegment.fromSvg(start, end, radiusX, radiusY, rotationDegrees, largeArc, sweep);
  }

  static fromCenter(center, radiusX, radiusY, startAngle, sweepAngle, rotation = 0) {
    const c = Point.from(center);
    const rx = Math.abs(Number(radiusX));
    const ry = Math.abs(Number(radiusY));
    const cosine = Math.cos(rotation);
    const sine = Math.sin(rotation);
    const pointAtAngle = (angle) => new Point(
      c.x + rx * cosine * Math.cos(angle) - ry * sine * Math.sin(angle),
      c.y + rx * sine * Math.cos(angle) + ry * cosine * Math.sin(angle),
    );
    const result = Object.create(ArcSegment.prototype);
    result.start = pointAtAngle(startAngle);
    result.end = pointAtAngle(startAngle + sweepAngle);
    result.center = c;
    result.radiusX = rx;
    result.radiusY = ry;
    result.rotation = rotation;
    result.rotationDegrees = rotation * 180 / Math.PI;
    result.basisX = new Vector(rx * cosine, rx * sine);
    result.basisY = new Vector(-ry * sine, ry * cosine);
    result.startAngle = startAngle;
    result.sweepAngle = sweepAngle;
    result.largeArc = Math.abs(sweepAngle) > Math.PI;
    result.sweep = sweepAngle >= 0;
    result.degenerate = rx <= EPSILON || ry <= EPSILON || Math.abs(sweepAngle) <= EPSILON;
    return Object.freeze(result);
  }

  static fromBasis(center, basisX, basisY, startAngle, sweepAngle) {
    const result = Object.create(ArcSegment.prototype);
    result.center = Point.from(center);
    result.basisX = Vector.from(basisX);
    result.basisY = Vector.from(basisY);
    result.radiusX = result.basisX.magnitude();
    result.radiusY = result.basisY.magnitude();
    result.rotation = result.basisX.angle();
    result.rotationDegrees = result.rotation * 180 / Math.PI;
    result.startAngle = startAngle;
    result.sweepAngle = sweepAngle;
    result.largeArc = Math.abs(sweepAngle) > Math.PI;
    result.sweep = sweepAngle >= 0;
    result.degenerate = result.basisX.isZero() || result.basisY.isZero() || Math.abs(sweepAngle) <= EPSILON;
    result.start = result.pointAtAngle(startAngle);
    result.end = result.pointAtAngle(startAngle + sweepAngle);
    return Object.freeze(result);
  }

  pointAt(t) {
    if (this.degenerate) return this.start.lerp(this.end, clamp(t));
    return this.pointAtAngle(this.startAngle + this.sweepAngle * t);
  }

  at(t) {
    return this.pointAt(t);
  }

  pointAtAngle(angle) {
    return this.center
      .add(this.basisX.scale(Math.cos(angle)))
      .add(this.basisY.scale(Math.sin(angle)));
  }

  derivativeAt(t) {
    if (this.degenerate) return this.end.subtract(this.start);
    const angle = this.startAngle + this.sweepAngle * t;
    return this.basisX.scale(-Math.sin(angle) * this.sweepAngle)
      .add(this.basisY.scale(Math.cos(angle) * this.sweepAngle));
  }

  tangentAt(t) {
    return this.derivativeAt(t).normalized();
  }

  extremaAngles() {
    if (this.degenerate) return [];
    const xAngle = Math.atan2(this.basisY.x, this.basisX.x);
    const yAngle = Math.atan2(this.basisY.y, this.basisX.y);
    return [xAngle, xAngle + Math.PI, yAngle, yAngle + Math.PI]
      .filter((angle) => angleOnSweep(angle, this.startAngle, this.sweepAngle));
  }

  bounds() {
    if (this.degenerate) return Bounds.fromPoints([this.start, this.end]);
    return Bounds.fromPoints([
      this.start,
      this.end,
      ...this.extremaAngles().map((angle) => this.pointAtAngle(angle)),
    ]);
  }

  reverse() {
    return ArcSegment.fromBasis(
      this.center, this.basisX, this.basisY,
      this.startAngle + this.sweepAngle,
      -this.sweepAngle,
    );
  }

  transform(matrix) {
    return ArcSegment.fromBasis(
      matrix.applyToPoint(this.center),
      matrix.applyToVector(this.basisX),
      matrix.applyToVector(this.basisY),
      this.startAngle,
      this.sweepAngle,
    );
  }

  transformed(matrix) {
    return this.transform(matrix);
  }
}

export function segmentBounds(segment) {
  if (!segment || typeof segment.bounds !== 'function') throw new TypeError('Expected a path segment with bounds().');
  return segment.bounds();
}

export function pathBounds(segments) {
  return segments.reduce((bounds, segment) => bounds.union(segmentBounds(segment)), Bounds.empty());
}
