import { Point } from './point.js';
import { Vector } from './vector.js';
import { EPSILON } from './numeric.js';

/** 2D affine matrix using SVG's [a b c d e f] convention. */
export class Matrix {
  constructor(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) {
    this.a = Number(a);
    this.b = Number(b);
    this.c = Number(c);
    this.d = Number(d);
    this.e = Number(e);
    this.f = Number(f);
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

  then(other) {
    return other.multiply(this);
  }

  applyToPoint(point) {
    const value = Point.from(point);
    return new Point(
      this.a * value.x + this.c * value.y + this.e,
      this.b * value.x + this.d * value.y + this.f,
    );
  }

  applyToVector(vector) {
    const value = Vector.from(vector);
    return new Vector(this.a * value.x + this.c * value.y, this.b * value.x + this.d * value.y);
  }

  determinant() {
    return this.a * this.d - this.b * this.c;
  }

  inverse(epsilon = EPSILON) {
    const determinant = this.determinant();
    if (Math.abs(determinant) <= epsilon) return null;
    return new Matrix(
      this.d / determinant,
      -this.b / determinant,
      -this.c / determinant,
      this.a / determinant,
      (this.c * this.f - this.d * this.e) / determinant,
      (this.b * this.e - this.a * this.f) / determinant,
    );
  }

  isIdentity(epsilon = EPSILON) {
    return this.equals(Matrix.identity(), epsilon);
  }

  equals(other, epsilon = EPSILON) {
    return ['a', 'b', 'c', 'd', 'e', 'f'].every((key) => Math.abs(this[key] - other[key]) <= epsilon);
  }

  nearlyEquals(other, epsilon = EPSILON) {
    return this.equals(other, epsilon);
  }

  toArray() {
    return [this.a, this.b, this.c, this.d, this.e, this.f];
  }

  toSvgString() {
    return this.toArray().join(' ');
  }

  toSVG() {
    return `matrix(${this.toSvgString()})`;
  }

  get tx() {
    return this.e;
  }

  get ty() {
    return this.f;
  }

  static identity() {
    return new Matrix();
  }

  static translation(x, y = 0) {
    if (typeof x === 'object') return new Matrix(1, 0, 0, 1, x.x, x.y);
    return new Matrix(1, 0, 0, 1, x, y);
  }

  static translate(x, y = 0) {
    return Matrix.translation(x, y);
  }

  static scaling(x, y = x) {
    return new Matrix(x, 0, 0, y, 0, 0);
  }

  static scale(x, y = x) {
    return Matrix.scaling(x, y);
  }

  static rotation(radians) {
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);
    return new Matrix(cosine, sine, -sine, cosine, 0, 0);
  }

  static rotate(radians) {
    return Matrix.rotation(radians);
  }

  static skewX(radians) {
    return new Matrix(1, 0, Math.tan(radians), 1, 0, 0);
  }

  static skewY(radians) {
    return new Matrix(1, Math.tan(radians), 0, 1, 0, 0);
  }

  static skew(xRadians = 0, yRadians = 0) {
    return new Matrix(1, Math.tan(yRadians), Math.tan(xRadians), 1, 0, 0);
  }
}
