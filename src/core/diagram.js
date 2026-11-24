import { Bounds, Matrix, Point, Vector, normalizePoint } from "./geometry.js";
import { mergeStyle, style as createStyle } from "./style.js";
import { renderSvg } from "./renderer.js";

function freezeMetadata(metadata = {}) {
  return Object.freeze({
    anchors: Object.freeze({ ...(metadata.anchors ?? {}) }),
    name: metadata.name ?? null,
  });
}

export class Diagram {
  constructor(node, bounds = Bounds.empty(), currentStyle = createStyle(), metadata = {}) {
    this.node = Object.freeze(node);
    this._bounds = bounds;
    this.styleValue = currentStyle;
    this.metadata = freezeMetadata(metadata);
    Object.freeze(this);
  }

  get bounds() { return this._bounds; }
  get width() { return this._bounds.width; }
  get height() { return this._bounds.height; }
  get center() { return this._bounds.center; }

  boundaryToward(target) {
    const targetPoint = normalizePoint(target);
    const local = boundaryForNode(this.node, this, targetPoint);
    return local ?? boundaryPointForBounds(this._bounds, this.center, targetPoint);
  }

  withStyle(overrides) {
    const nextStyle = mergeStyle(this.styleValue, overrides);
    const halfStroke = strokeExtent(nextStyle);
    const oldHalfStroke = strokeExtent(this.styleValue);
    return new Diagram(
      { type: "style", diagram: this, style: nextStyle },
      this._bounds.expand(halfStroke - oldHalfStroke),
      nextStyle,
      this.metadata,
    );
  }

  _mapPrimitiveStyle(overrides) {
    if (this.node.type === "group") {
      return group(this.node.diagrams.map((child) => child.withStyle(overrides)), this.metadata);
    }
    return this.withStyle(overrides);
  }

  fill(value) { return this._mapPrimitiveStyle({ fill: value }); }
  stroke(value, width = this.styleValue.strokeWidth) {
    return this._mapPrimitiveStyle({ stroke: value, strokeWidth: width });
  }
  strokeWidth(value) { return this._mapPrimitiveStyle({ strokeWidth: value }); }
  opacity(value) { return this._mapPrimitiveStyle({ opacity: value }); }
  fillOpacity(value) { return this._mapPrimitiveStyle({ fillOpacity: value }); }
  strokeOpacity(value) { return this._mapPrimitiveStyle({ strokeOpacity: value }); }
  dash(values, offset = 0) { return this._mapPrimitiveStyle({ dashArray: [...values], dashOffset: offset }); }
  lineCap(value) { return this._mapPrimitiveStyle({ lineCap: value }); }
  lineJoin(value) { return this._mapPrimitiveStyle({ lineJoin: value }); }
  color(value) { return this._mapPrimitiveStyle({ color: value }); }
  font(value) { return this._mapPrimitiveStyle({ fontFamily: value }); }
  fontSize(value) { return this._mapPrimitiveStyle({ fontSize: value }); }
  fontWeight(value) { return this._mapPrimitiveStyle({ fontWeight: value }); }
  fontStyle(value) { return this._mapPrimitiveStyle({ fontStyle: value }); }
  textAnchor(value) { return this._mapPrimitiveStyle({ textAnchor: value }); }
  baseline(value) { return this._mapPrimitiveStyle({ dominantBaseline: value }); }

  transform(matrix) {
    const anchors = Object.fromEntries(
      Object.entries(this.metadata.anchors).map(([name, anchor]) => [name, matrix.applyToPoint(anchor)]),
    );
    return new Diagram(
      { type: "transform", diagram: this, matrix },
      this._bounds.transform(matrix),
      this.styleValue,
      { ...this.metadata, anchors },
    );
  }

  translate(x, y) {
    if (x instanceof Vector || x instanceof Point || (x && typeof x === "object")) {
      const value = x;
      return this.transform(Matrix.translate(value.x ?? 0, value.y ?? 0));
    }
    return this.transform(Matrix.translate(Number(x) || 0, Number(y) || 0));
  }
  translateX(x) { return this.translate(x, 0); }
  translateY(y) { return this.translate(0, y); }
  moveTo(x, y) {
    const target = arguments.length === 1 ? normalizePoint(x) : new Point(x, y);
    return this.translate(target.x - this.center.x, target.y - this.center.y);
  }
  scale(x, y = x) { return this.transform(Matrix.scale(x, y)); }
  rotate(angle) { return this.transform(Matrix.rotate(angle)); }
  rotateDeg(degrees) { return this.rotate(degrees * Math.PI / 180); }
  skew(xAngle = 0, yAngle = 0) { return this.transform(Matrix.skew(xAngle, yAngle)); }
  reflectX() { return this.scale(1, -1); }
  reflectY() { return this.scale(-1, 1); }

  named(name) {
    return new Diagram(this.node, this._bounds, this.styleValue, { ...this.metadata, name });
  }

  withAnchor(name, value) {
    const anchor = normalizePoint(value);
    return new Diagram(this.node, this._bounds, this.styleValue, {
      ...this.metadata,
      anchors: { ...this.metadata.anchors, [name]: anchor },
    });
  }

  anchor(name = "center") {
    if (this.metadata.anchors[name]) return this.metadata.anchors[name];
    if (name === "baseline") return new Point(this.center.x, this._bounds.maxY);
    return this._bounds.anchor(name);
  }

  pad(amountX, amountY = amountX) {
    return new Diagram(
      { type: "bounds", diagram: this },
      this._bounds.expand(amountX, amountY),
      this.styleValue,
      this.metadata,
    );
  }

  clip(mask) {
    const intersection = intersectBounds(this._bounds, mask.bounds);
    return new Diagram(
      { type: "clip", diagram: this, mask },
      intersection,
      this.styleValue,
      this.metadata,
    );
  }

  toSVG(options = {}) {
    return renderSvg(this, options);
  }
}

export function intersectBounds(a, b) {
  const minX = Math.max(a.minX, b.minX);
  const minY = Math.max(a.minY, b.minY);
  const maxX = Math.min(a.maxX, b.maxX);
  const maxY = Math.min(a.maxY, b.maxY);
  return minX <= maxX && minY <= maxY
    ? new Bounds(minX, minY, maxX, maxY)
    : Bounds.empty();
}

export function primitive(node, bounds, overrides = {}, metadata = {}) {
  const currentStyle = createStyle(overrides);
  return new Diagram(node, bounds.expand(strokeExtent(currentStyle)), currentStyle, metadata);
}

export function group(diagrams, metadata = {}) {
  const items = diagrams.filter(Boolean);
  const bounds = items.reduce((combined, diagram) => combined.union(diagram.bounds), Bounds.empty());
  return new Diagram({ type: "group", diagrams: items }, bounds, createStyle(), metadata);
}

export function empty() { return group([]); }

function strokeExtent(value) {
  return value.stroke && value.stroke !== "none"
    ? Math.max(0, Number(value.strokeWidth) || 0) / 2
    : 0;
}

function boundaryForNode(node, diagram, target) {
  if (!node) return null;
  if (["style", "bounds"].includes(node.type)) return boundaryForNode(node.diagram.node, node.diagram, target);
  if (node.type === "transform") {
    const inverse = node.matrix.inverse();
    const localTarget = inverse.applyToPoint(target);
    const localPoint = boundaryForNode(node.diagram.node, node.diagram, localTarget);
    return localPoint ? node.matrix.applyToPoint(localPoint) : null;
  }
  if (node.type === "ellipse") {
    const center = new Point(node.cx, node.cy);
    const direction = target.sub(center);
    if (direction.magnitudeSquared() < 1e-12) return center;
    const denominator = Math.sqrt(
      (direction.x * direction.x) / (node.rx * node.rx)
      + (direction.y * direction.y) / (node.ry * node.ry),
    );
    return new Point(center.x + direction.x / denominator, center.y + direction.y / denominator);
  }
  if (node.type === "rect") {
    return boundaryPointForBounds(diagram.bounds, diagram.center, target);
  }
  if (node.type === "path") {
    return pathBoundary(node.path.commands, diagram.center, target) ?? boundaryPointForBounds(diagram.bounds, diagram.center, target);
  }
  return null;
}

function pathBoundary(commands, center, target) {
  const direction = target.sub(center);
  const lengthSquared = direction.magnitudeSquared();
  if (lengthSquared < 1e-12) return center;
  const length = Math.sqrt(lengthSquared);
  const unit = direction.scale(1 / length);
  const intersections = [];
  let previous = null;
  for (const command of commands) {
    if (command.type === "M") {
      previous = command.point;
      continue;
    }
    if (!previous) continue;
    const points = [previous];
    if (command.type === "L" || command.type === "Z") {
      points.push(command.point);
    } else if (command.type === "Q") {
      for (let i = 1; i <= 32; i += 1) {
        const t = i / 32;
        const u = 1 - t;
        points.push(new Point(
          u * u * previous.x + 2 * u * t * command.control.x + t * t * command.point.x,
          u * u * previous.y + 2 * u * t * command.control.y + t * t * command.point.y,
        ));
      }
    } else if (command.type === "C") {
      for (let i = 1; i <= 48; i += 1) {
        const t = i / 48;
        const u = 1 - t;
        points.push(new Point(
          u ** 3 * previous.x + 3 * u * u * t * command.control1.x + 3 * u * t * t * command.control2.x + t ** 3 * command.point.x,
          u ** 3 * previous.y + 3 * u * u * t * command.control1.y + 3 * u * t * t * command.control2.y + t ** 3 * command.point.y,
        ));
      }
    } else if (command.type === "A") {
      for (let i = 1; i <= 48; i += 1) {
        const t = i / 48;
        points.push(new Point(
          previous.x + (command.point.x - previous.x) * t,
          previous.y + (command.point.y - previous.y) * t,
        ));
      }
    } else {
      previous = command.point ?? previous;
      continue;
    }
    for (let index = 1; index < points.length; index += 1) {
      const a = points[index - 1];
      const b = points[index];
      const edge = b.sub(a);
      const denominator = unit.cross(edge);
      if (Math.abs(denominator) < 1e-10) continue;
      const delta = a.sub(center);
      const rayDistance = delta.cross(edge) / denominator;
      const edgeParameter = delta.cross(unit) / denominator;
      if (rayDistance >= 0 && edgeParameter >= -1e-9 && edgeParameter <= 1 + 1e-9) {
        intersections.push(rayDistance);
      }
    }
    previous = command.point ?? previous;
  }
  if (!intersections.length) return null;
  return center.add(unit.scale(Math.min(...intersections)));
}

function boundaryPointForBounds(bounds, center, target) {
  const direction = target.sub(center);
  if (direction.magnitudeSquared() < 1e-12) return center;
  const candidates = [];
  if (Math.abs(direction.x) > 1e-9) {
    for (const x of [bounds.minX, bounds.maxX]) {
      const t = (x - center.x) / direction.x;
      const y = center.y + direction.y * t;
      if (t >= 0 && y >= bounds.minY - 1e-9 && y <= bounds.maxY + 1e-9) candidates.push({ t, point: new Point(x, y) });
    }
  }
  if (Math.abs(direction.y) > 1e-9) {
    for (const y of [bounds.minY, bounds.maxY]) {
      const t = (y - center.y) / direction.y;
      const x = center.x + direction.x * t;
      if (t >= 0 && x >= bounds.minX - 1e-9 && x <= bounds.maxX + 1e-9) candidates.push({ t, point: new Point(x, y) });
    }
  }
  candidates.sort((a, b) => a.t - b.t);
  return candidates[0]?.point ?? center;
}
