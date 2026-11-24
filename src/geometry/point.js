import { EPSILON } from './numeric.js';
import { Vector } from './vector.js';

export class Point {
  constructor(x = 0, y = 0) {
    this.x = Number(x);
    this.y = Number(y);
    Object.freeze(this);
  }

  add(vector) {
    const value = Vector.from(vector);
    return new Point(this.x + value.x, this.y + value.y);
  }

  translate(vector) {
    return this.add(vector);
  }

  subtract(point) {
    const value = Point.from(point);
    return new Vector(this.x - value.x, this.y - value.y);
  }

  sub(point) {
    return this.subtract(point);
  }

  distanceTo(point) {
    return this.subtract(point).magnitude();
  }

  lerp(point, t) {
    const value = Point.from(point);
    return new Point(this.x + (value.x - this.x) * t, this.y + (value.y - this.y) * t);
  }

  equals(other, epsilon = EPSILON) {
    const value = Point.from(other);
    return Math.abs(this.x - value.x) <= epsilon && Math.abs(this.y - value.y) <= epsilon;
  }

  nearlyEquals(other, epsilon = EPSILON) {
    return this.equals(other, epsilon);
  }

  transform(matrix) {
    return matrix.applyToPoint(this);
  }

  toArray() {
    return [this.x, this.y];
  }

  static from(value) {
    if (value instanceof Point) return value;
    if (Array.isArray(value)) return new Point(value[0], value[1]);
    return new Point(value?.x, value?.y);
  }
}
