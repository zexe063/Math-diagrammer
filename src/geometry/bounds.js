import { EPSILON } from './numeric.js';
import { Point } from './point.js';
import { Vector } from './vector.js';

export class Bounds {
  constructor(minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity) {
    this.minX = Number(minX);
    this.minY = Number(minY);
    this.maxX = Number(maxX);
    this.maxY = Number(maxY);
    Object.freeze(this);
  }

  static empty() {
    return new Bounds();
  }

  static fromPoints(points) {
    let bounds = Bounds.empty();
    for (const point of points) bounds = bounds.includePoint(point);
    return bounds;
  }

  static fromRect(x, y, width, height) {
    const x2 = x + width;
    const y2 = y + height;
    return new Bounds(Math.min(x, x2), Math.min(y, y2), Math.max(x, x2), Math.max(y, y2));
  }

  get isEmpty() {
    return this.minX > this.maxX || this.minY > this.maxY;
  }

  get width() {
    return this.isEmpty ? 0 : this.maxX - this.minX;
  }

  get height() {
    return this.isEmpty ? 0 : this.maxY - this.minY;
  }

  get center() {
    return this.isEmpty ? new Point(0, 0) : new Point((this.minX + this.maxX) / 2, (this.minY + this.maxY) / 2);
  }

  get left() {
    return this.minX;
  }

  get right() {
    return this.maxX;
  }

  get top() {
    return this.minY;
  }

  get bottom() {
    return this.maxY;
  }

  clone() {
    return new Bounds(this.minX, this.minY, this.maxX, this.maxY);
  }

  includePoint(point) {
    const value = Point.from(point);
    if (!Number.isFinite(value.x) || !Number.isFinite(value.y)) return this;
    return new Bounds(
      Math.min(this.minX, value.x),
      Math.min(this.minY, value.y),
      Math.max(this.maxX, value.x),
      Math.max(this.maxY, value.y),
    );
  }

  includeBounds(other) {
    if (!other || other.isEmpty) return this;
    return new Bounds(
      Math.min(this.minX, other.minX),
      Math.min(this.minY, other.minY),
      Math.max(this.maxX, other.maxX),
      Math.max(this.maxY, other.maxY),
    );
  }

  union(other) {
    return this.includeBounds(other);
  }

  intersect(other) {
    if (this.isEmpty || other.isEmpty) return Bounds.empty();
    return new Bounds(
      Math.max(this.minX, other.minX),
      Math.max(this.minY, other.minY),
      Math.min(this.maxX, other.maxX),
      Math.min(this.maxY, other.maxY),
    );
  }

  expand(amountX, amountY = amountX) {
    if (this.isEmpty) return this.clone();
    return new Bounds(this.minX - amountX, this.minY - amountY, this.maxX + amountX, this.maxY + amountY);
  }

  translate(vectorOrX, y = 0) {
    const vector = typeof vectorOrX === 'object' ? Vector.from(vectorOrX) : new Vector(vectorOrX, y);
    if (this.isEmpty) return this.clone();
    return new Bounds(this.minX + vector.x, this.minY + vector.y, this.maxX + vector.x, this.maxY + vector.y);
  }

  containsPoint(point, epsilon = EPSILON) {
    if (this.isEmpty) return false;
    const value = Point.from(point);
    return value.x >= this.minX - epsilon && value.x <= this.maxX + epsilon && value.y >= this.minY - epsilon && value.y <= this.maxY + epsilon;
  }

  containsBounds(other, epsilon = EPSILON) {
    return !other.isEmpty && this.containsPoint(new Point(other.minX, other.minY), epsilon) && this.containsPoint(new Point(other.maxX, other.maxY), epsilon);
  }

  intersects(other, epsilon = EPSILON) {
    if (this.isEmpty || other.isEmpty) return false;
    return this.maxX >= other.minX - epsilon && this.minX <= other.maxX + epsilon
      && this.maxY >= other.minY - epsilon && this.minY <= other.maxY + epsilon;
  }

  corners() {
    if (this.isEmpty) return [];
    return [
      new Point(this.minX, this.minY),
      new Point(this.maxX, this.minY),
      new Point(this.maxX, this.maxY),
      new Point(this.minX, this.maxY),
    ];
  }

  transform(matrix) {
    return Bounds.fromPoints(this.corners().map((point) => matrix.applyToPoint(point)));
  }

  support(direction) {
    if (this.isEmpty) return -Infinity;
    const vector = Vector.from(direction);
    const point = new Point(vector.x >= 0 ? this.maxX : this.minX, vector.y >= 0 ? this.maxY : this.minY);
    return point.x * vector.x + point.y * vector.y;
  }

  include(value) {
    return this.includePoint(value);
  }

  anchor(name = 'center') {
    if (this.isEmpty) return new Point(0, 0);
    const lower = String(name).toLowerCase();
    const x = lower.includes('left') ? this.minX : lower.includes('right') ? this.maxX : this.center.x;
    const y = lower.includes('top') ? this.minY : lower.includes('bottom') ? this.maxY : this.center.y;
    return new Point(x, y);
  }

  equals(other, epsilon = EPSILON) {
    if (this.isEmpty || other.isEmpty) return this.isEmpty === other.isEmpty;
    return Math.abs(this.minX - other.minX) <= epsilon && Math.abs(this.minY - other.minY) <= epsilon && Math.abs(this.maxX - other.maxX) <= epsilon && Math.abs(this.maxY - other.maxY) <= epsilon;
  }

  toJSON() {
    return { minX: this.minX, minY: this.minY, maxX: this.maxX, maxY: this.maxY };
  }
}
