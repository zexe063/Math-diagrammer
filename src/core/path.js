import { ArcSegment } from "../geometry/index.js";
import { Bounds, EPSILON, Point, normalizePoint } from "./geometry.js";

function valueAtQuadratic(p0, p1, p2, t) {
  const mt = 1 - t;
  return mt * mt * p0 + 2 * mt * t * p1 + t * t * p2;
}

function valueAtCubic(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return mt ** 3 * p0
    + 3 * mt * mt * t * p1
    + 3 * mt * t * t * p2
    + t ** 3 * p3;
}

function quadraticExtrema(p0, p1, p2) {
  const denominator = p0 - 2 * p1 + p2;
  if (Math.abs(denominator) < EPSILON) return [];
  const t = (p0 - p1) / denominator;
  return t > 0 && t < 1 ? [t] : [];
}

function cubicExtrema(p0, p1, p2, p3) {
  const a = -p0 + 3 * p1 - 3 * p2 + p3;
  const b = 2 * (p0 - 2 * p1 + p2);
  const c = p1 - p0;
  if (Math.abs(a) < EPSILON) {
    if (Math.abs(b) < EPSILON) return [];
    const t = -c / b;
    return t > 0 && t < 1 ? [t] : [];
  }
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return [];
  const root = Math.sqrt(discriminant);
  return [(-b + root) / (2 * a), (-b - root) / (2 * a)]
    .filter((t) => t > 0 && t < 1);
}

export class PathData {
  constructor(commands = [], current = null, start = null) {
    this.commands = commands;
    this.current = current;
    this.start = start;
    Object.freeze(this.commands);
    Object.freeze(this);
  }

  _append(command, current, start = this.start) {
    return new PathData([...this.commands, command], current, start);
  }

  moveTo(x, y) {
    const point = normalizePoint(arguments.length === 1 ? x : [x, y]);
    return this._append({ type: "M", point }, point, point);
  }

  lineTo(x, y) {
    this._requireCurrent();
    const point = normalizePoint(arguments.length === 1 ? x : [x, y]);
    return this._append({ type: "L", from: this.current, point }, point);
  }

  quadTo(cx, cy, x, y) {
    this._requireCurrent();
    let control;
    let point;
    if (arguments.length === 2) {
      control = normalizePoint(cx);
      point = normalizePoint(cy);
    } else {
      control = new Point(cx, cy);
      point = new Point(x, y);
    }
    return this._append({ type: "Q", from: this.current, control, point }, point);
  }

  cubicTo(c1x, c1y, c2x, c2y, x, y) {
    this._requireCurrent();
    let control1;
    let control2;
    let point;
    if (arguments.length === 3) {
      control1 = normalizePoint(c1x);
      control2 = normalizePoint(c1y);
      point = normalizePoint(c2x);
    } else {
      control1 = new Point(c1x, c1y);
      control2 = new Point(c2x, c2y);
      point = new Point(x, y);
    }
    return this._append({ type: "C", from: this.current, control1, control2, point }, point);
  }

  arcTo(rx, ry, rotation, largeArc, sweep, x, y) {
    this._requireCurrent();
    const point = normalizePoint(arguments.length === 6 ? x : [x, y]);
    return this._append({
      type: "A", from: this.current, rx, ry, rotation,
      largeArc: Boolean(largeArc), sweep: Boolean(sweep), point,
    }, point);
  }

  close() {
    if (!this.current || !this.start) return this;
    return this._append({ type: "Z", from: this.current, point: this.start }, this.start);
  }

  _requireCurrent() {
    if (!this.current) throw new Error("A path must start with moveTo().");
  }

  bounds() {
    let bounds = Bounds.empty();
    for (const command of this.commands) {
      if (command.type === "M") {
        bounds = bounds.include(command.point);
      } else if (command.type === "L" || command.type === "Z") {
        bounds = bounds.include(command.from).include(command.point);
      } else if (command.type === "Q") {
        bounds = bounds.include(command.from).include(command.point);
        const ts = new Set([
          ...quadraticExtrema(command.from.x, command.control.x, command.point.x),
          ...quadraticExtrema(command.from.y, command.control.y, command.point.y),
        ]);
        for (const t of ts) {
          bounds = bounds.include(new Point(
            valueAtQuadratic(command.from.x, command.control.x, command.point.x, t),
            valueAtQuadratic(command.from.y, command.control.y, command.point.y, t),
          ));
        }
      } else if (command.type === "C") {
        bounds = bounds.include(command.from).include(command.point);
        const ts = new Set([
          ...cubicExtrema(command.from.x, command.control1.x, command.control2.x, command.point.x),
          ...cubicExtrema(command.from.y, command.control1.y, command.control2.y, command.point.y),
        ]);
        for (const t of ts) {
          bounds = bounds.include(new Point(
            valueAtCubic(command.from.x, command.control1.x, command.control2.x, command.point.x, t),
            valueAtCubic(command.from.y, command.control1.y, command.control2.y, command.point.y, t),
          ));
        }
      } else if (command.type === "A") {
        const arcBounds = new ArcSegment(
          command.from,
          command.point,
          command.rx,
          command.ry,
          command.rotation,
          command.largeArc,
          command.sweep,
        ).bounds();
        bounds = bounds.union(new Bounds(
          arcBounds.minX,
          arcBounds.minY,
          arcBounds.maxX,
          arcBounds.maxY,
        ));
      }
    }
    return bounds;
  }

  toSVGPath() {
    return this.commands.map((command) => {
      switch (command.type) {
        case "M": return `M ${command.point.x} ${command.point.y}`;
        case "L": return `L ${command.point.x} ${command.point.y}`;
        case "Q": return `Q ${command.control.x} ${command.control.y} ${command.point.x} ${command.point.y}`;
        case "C": return `C ${command.control1.x} ${command.control1.y} ${command.control2.x} ${command.control2.y} ${command.point.x} ${command.point.y}`;
        case "A": return `A ${command.rx} ${command.ry} ${command.rotation} ${Number(command.largeArc)} ${Number(command.sweep)} ${command.point.x} ${command.point.y}`;
        case "Z": return "Z";
        default: return "";
      }
    }).join(" ");
  }
}

export function path() { return new PathData(); }
