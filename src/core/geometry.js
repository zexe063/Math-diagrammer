export const EPSILON = 1e-9;

export class Vector {
  constructor(x = 0, y = 0) {
    this.x = Number(x);
    this.y = Number(y);
    Object.freeze(this);
  }

  add(other) { return new Vector(this.x + other.x, this.y + other.y); }
  sub(other) { return new Vector(this.x - other.x, this.y - other.y); }
  scale(amount) { return new Vector(this.x * amount, this.y * amount); }
  neg() { return new Vector(-this.x, -this.y); }
  dot(other) { return this.x * other.x + this.y * other.y; }
  cross(other) { return this.x * other.y - this.y * other.x; }
  magnitudeSquared() { return this.dot(this); }
  magnitude() { return Math.sqrt(this.magnitudeSquared()); }
  normalize() {
    const magnitude = this.magnitude();
    return magnitude < EPSILON ? new Vector(0, 0) : this.scale(1 / magnitude);
  }
  perpendicular() { return new Vector(-this.y, this.x); }
  rotate(angle) {
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    return new Vector(
      this.x * cosine - this.y * sine,
      this.x * sine + this.y * cosine,
    );
  }

  static polar(angle, magnitude = 1) {
    return new Vector(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
  }
}

export class Point {
  constructor(x = 0, y = 0) {
    this.x = Number(x);
    this.y = Number(y);
    Object.freeze(this);
  }

  add(vector) { return new Point(this.x + vector.x, this.y + vector.y); }
  sub(other) { return new Vector(this.x - other.x, this.y - other.y); }
  distanceTo(other) { return this.sub(other).magnitude(); }
  lerp(other, t) {
    return new Point(
      this.x + (other.x - this.x) * t,
      this.y + (other.y - this.y) * t,
    );
  }
}

export function point(x = 0, y = 0) { return new Point(x, y); }
export function vector(x = 0, y = 0) { return new Vector(x, y); }
export function polar(angle, magnitude = 1) { return Vector.polar(angle, magnitude); }
export function midpoint(a, b) { return a.lerp(b, 0.5); }
export function distance(a, b) { return a.distanceTo(b); }

export class Matrix {
  constructor(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) {
    this.a = a; this.b = b; this.c = c;
    this.d = d; this.e = e; this.f = f;
    Object.freeze(this);
  }

  multiply(other) {
    return new Matrix(
      this.a * other.a + this.c * other.b,
      this.b * other.a + this.d * other.b,
      this.a * other.c + this.c * other.d,
      this.b * other.c + this.d * other.d,
      this.a * other.e + this.c * other.f + this.e,
      this.b * other.e + this.d * other.f + this.f,
    );
  }

  applyToPoint(value) {
    return new Point(
      this.a * value.x + this.c * value.y + this.e,
      this.b * value.x + this.d * value.y + this.f,
    );
  }

  applyToVector(value) {
    return new Vector(
      this.a * value.x + this.c * value.y,
      this.b * value.x + this.d * value.y,
    );
  }

  inverse() {
    const determinant = this.a * this.d - this.b * this.c;
    if (Math.abs(determinant) < EPSILON) throw new Error("Cannot invert a singular transform.");
    return new Matrix(
      this.d / determinant,
      -this.b / determinant,
      -this.c / determinant,
      this.a / determinant,
      (this.c * this.f - this.d * this.e) / determinant,
      (this.b * this.e - this.a * this.f) / determinant,
    );
  }

  toSVG() { return `matrix(${this.a} ${this.b} ${this.c} ${this.d} ${this.e} ${this.f})`; }

  static identity() { return new Matrix(); }
  static translate(x, y) { return new Matrix(1, 0, 0, 1, x, y); }
  static scale(x, y = x) { return new Matrix(x, 0, 0, y, 0, 0); }
  static rotate(angle) {
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    return new Matrix(cosine, sine, -sine, cosine, 0, 0);
  }
  static skew(xAngle = 0, yAngle = 0) {
    return new Matrix(1, Math.tan(yAngle), Math.tan(xAngle), 1, 0, 0);
  }
}

export class Bounds {
  constructor(minX, minY, maxX, maxY) {
    this.minX = minX; this.minY = minY;
    this.maxX = maxX; this.maxY = maxY;
    Object.freeze(this);
  }

  static empty() { return new Bounds(Infinity, Infinity, -Infinity, -Infinity); }
  static fromPoints(points) {
    if (!points.length) return Bounds.empty();
    return points.reduce(
      (bounds, value) => bounds.include(value),
      Bounds.empty(),
    );
  }

  get isEmpty() { return this.minX > this.maxX || this.minY > this.maxY; }
  get width() { return this.isEmpty ? 0 : this.maxX - this.minX; }
  get height() { return this.isEmpty ? 0 : this.maxY - this.minY; }
  get center() {
    return this.isEmpty
      ? new Point(0, 0)
      : new Point((this.minX + this.maxX) / 2, (this.minY + this.maxY) / 2);
  }

  include(value) {
    if (!Number.isFinite(value.x) || !Number.isFinite(value.y)) return this;
    return new Bounds(
      Math.min(this.minX, value.x),
      Math.min(this.minY, value.y),
      Math.max(this.maxX, value.x),
      Math.max(this.maxY, value.y),
    );
  }

  union(other) {
    if (this.isEmpty) return other;
    if (other.isEmpty) return this;
    return new Bounds(
      Math.min(this.minX, other.minX),
      Math.min(this.minY, other.minY),
      Math.max(this.maxX, other.maxX),
      Math.max(this.maxY, other.maxY),
    );
  }

  expand(amountX, amountY = amountX) {
    if (this.isEmpty) return this;
    return new Bounds(
      this.minX - amountX,
      this.minY - amountY,
      this.maxX + amountX,
      this.maxY + amountY,
    );
  }

  translate(x, y) {
    if (this.isEmpty) return this;
    return new Bounds(this.minX + x, this.minY + y, this.maxX + x, this.maxY + y);
  }

  transform(matrix) {
    if (this.isEmpty) return this;
    return Bounds.fromPoints([
      matrix.applyToPoint(new Point(this.minX, this.minY)),
      matrix.applyToPoint(new Point(this.maxX, this.minY)),
      matrix.applyToPoint(new Point(this.maxX, this.maxY)),
      matrix.applyToPoint(new Point(this.minX, this.maxY)),
    ]);
  }

  anchor(name) {
    const x = name.includes("left") || name.includes("Left") ? this.minX
      : name.includes("right") || name.includes("Right") ? this.maxX
        : (this.minX + this.maxX) / 2;
    const y = name.includes("top") || name.includes("Top") ? this.minY
      : name.includes("bottom") || name.includes("Bottom") ? this.maxY
        : (this.minY + this.maxY) / 2;
    return new Point(x, y);
  }
}

export function normalizePoint(value) {
  if (value instanceof Point) return value;
  if (Array.isArray(value)) return new Point(value[0] ?? 0, value[1] ?? 0);
  if (value && typeof value === "object") return new Point(value.x ?? 0, value.y ?? 0);
  throw new TypeError("Expected a point, [x, y], or {x, y} value.");
}

