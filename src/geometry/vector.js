import { EPSILON } from './numeric.js';

export class Vector {
  constructor(x = 0, y = 0) {
    this.x = Number(x);
    this.y = Number(y);
    Object.freeze(this);
  }

  add(other) {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  subtract(other) {
    return new Vector(this.x - other.x, this.y - other.y);
  }

  sub(other) {
    return this.subtract(other);
  }

  scale(scalar) {
    return new Vector(this.x * scalar, this.y * scalar);
  }

  divide(scalar) {
    return new Vector(this.x / scalar, this.y / scalar);
  }

  dot(other) {
    return this.x * other.x + this.y * other.y;
  }

  cross(other) {
    return this.x * other.y - this.y * other.x;
  }

  magnitudeSquared() {
    return this.x * this.x + this.y * this.y;
  }

  lengthSquared() {
    return this.magnitudeSquared();
  }

  magnitude() {
    return Math.hypot(this.x, this.y);
  }

  length() {
    return this.magnitude();
  }

  normalized(epsilon = EPSILON) {
    const length = this.magnitude();
    return length <= epsilon ? new Vector(0, 0) : this.divide(length);
  }

  normalize(epsilon = EPSILON) {
    return this.normalized(epsilon);
  }

  perpendicular() {
    return new Vector(-this.y, this.x);
  }

  rotate(radians) {
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);
    return new Vector(this.x * cosine - this.y * sine, this.x * sine + this.y * cosine);
  }

  angle() {
    return Math.atan2(this.y, this.x);
  }

  isZero(epsilon = EPSILON) {
    return this.magnitudeSquared() <= epsilon * epsilon;
  }

  equals(other, epsilon = EPSILON) {
    return Math.abs(this.x - other.x) <= epsilon && Math.abs(this.y - other.y) <= epsilon;
  }

  nearlyEquals(other, epsilon = EPSILON) {
    return this.equals(other, epsilon);
  }

  negate() {
    return new Vector(-this.x, -this.y);
  }

  neg() {
    return this.negate();
  }

  toArray() {
    return [this.x, this.y];
  }

  static from(value) {
    if (value instanceof Vector) return value;
    if (Array.isArray(value)) return new Vector(value[0], value[1]);
    return new Vector(value?.x, value?.y);
  }

  static fromAngle(radians, magnitude = 1) {
    return new Vector(Math.cos(radians) * magnitude, Math.sin(radians) * magnitude);
  }

  static polar(radians, magnitude = 1) {
    return Vector.fromAngle(radians, magnitude);
  }
}
