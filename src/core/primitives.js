import { Bounds, Point, normalizePoint } from "./geometry.js";
import { group, primitive } from "./diagram.js";
import { PathData, path as createPath } from "./path.js";
import { typesetMath } from "./mathjax.js";

export function path(value = createPath()) {
  if (!(value instanceof PathData)) throw new TypeError("path() expects PathData.");
  return primitive({ type: "path", path: value }, value.bounds());
}

export { createPath as pen };

export function line(start, end) {
  if (arguments.length === 1 && typeof start === "number") {
    const half = start / 2;
    start = new Point(-half, 0);
    end = new Point(half, 0);
  } else {
    start = normalizePoint(start);
    end = normalizePoint(end);
  }
  return path(createPath().moveTo(start).lineTo(end));
}

export function polyline(points) {
  const values = points.map(normalizePoint);
  if (!values.length) return group([]);
  let data = createPath().moveTo(values[0]);
  for (let index = 1; index < values.length; index += 1) data = data.lineTo(values[index]);
  return path(data);
}

export function polygon(points) {
  const values = points.map(normalizePoint);
  if (!values.length) return group([]);
  let data = createPath().moveTo(values[0]);
  for (let index = 1; index < values.length; index += 1) data = data.lineTo(values[index]);
  return path(data.close()).fill("#e5e7eb");
}

export function rectangle(width, height = width) {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  return primitive(
    { type: "rect", x: -halfWidth, y: -halfHeight, width, height, radius: 0 },
    new Bounds(-halfWidth, -halfHeight, halfWidth, halfHeight),
    { fill: "#e5e7eb" },
  );
}

export const rect = rectangle;
export const square = (size) => rectangle(size, size);

export function roundedRect(width, height, radius = Math.min(width, height) * 0.1) {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  return primitive(
    { type: "rect", x: -halfWidth, y: -halfHeight, width, height, radius },
    new Bounds(-halfWidth, -halfHeight, halfWidth, halfHeight),
    { fill: "#e5e7eb" },
  );
}

export function circle(radius) {
  return primitive(
    { type: "ellipse", cx: 0, cy: 0, rx: radius, ry: radius },
    new Bounds(-radius, -radius, radius, radius),
    { fill: "#e5e7eb" },
  );
}

export function ellipse(rx, ry) {
  return primitive(
    { type: "ellipse", cx: 0, cy: 0, rx, ry },
    new Bounds(-rx, -ry, rx, ry),
    { fill: "#e5e7eb" },
  );
}

export function regularPolygon(sides, radius) {
  if (!Number.isInteger(sides) || sides < 3) throw new RangeError("regularPolygon needs at least 3 sides.");
  const phase = -Math.PI / 2;
  return polygon(Array.from({ length: sides }, (_, index) => [
    Math.cos(phase + index * Math.PI * 2 / sides) * radius,
    Math.sin(phase + index * Math.PI * 2 / sides) * radius,
  ]));
}

export function triangle(sizeOrPoints = 100) {
  if (Array.isArray(sizeOrPoints)) return polygon(sizeOrPoints);
  return regularPolygon(3, sizeOrPoints / Math.sqrt(3) * 1.2);
}

export function arc(radius, startAngle, endAngle) {
  if (Math.abs(endAngle - startAngle) >= Math.PI * 2 - 1e-9) return circle(radius);
  const start = new Point(Math.cos(startAngle) * radius, Math.sin(startAngle) * radius);
  const end = new Point(Math.cos(endAngle) * radius, Math.sin(endAngle) * radius);
  const delta = ((endAngle - startAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  return path(createPath().moveTo(start).arcTo(
    radius, radius, 0, delta > Math.PI, true, end.x, end.y,
  ));
}

export function sector(radius, startAngle, endAngle) {
  if (Math.abs(endAngle - startAngle) >= Math.PI * 2 - 1e-9) return circle(radius);
  const start = new Point(Math.cos(startAngle) * radius, Math.sin(startAngle) * radius);
  const end = new Point(Math.cos(endAngle) * radius, Math.sin(endAngle) * radius);
  const delta = ((endAngle - startAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  return path(createPath()
    .moveTo(0, 0)
    .lineTo(start)
    .arcTo(radius, radius, 0, delta > Math.PI, true, end.x, end.y)
    .close()).fill("#e5e7eb");
}

export const wedge = sector;

export function annularSector(innerRadius, outerRadius, startAngle, endAngle) {
  if (innerRadius < 0 || outerRadius <= innerRadius) {
    throw new RangeError("annularSector requires 0 <= innerRadius < outerRadius.");
  }
  const outerStart = new Point(Math.cos(startAngle) * outerRadius, Math.sin(startAngle) * outerRadius);
  const outerEnd = new Point(Math.cos(endAngle) * outerRadius, Math.sin(endAngle) * outerRadius);
  const innerEnd = new Point(Math.cos(endAngle) * innerRadius, Math.sin(endAngle) * innerRadius);
  const innerStart = new Point(Math.cos(startAngle) * innerRadius, Math.sin(startAngle) * innerRadius);
  const delta = ((endAngle - startAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  return path(createPath()
    .moveTo(outerStart)
    .arcTo(outerRadius, outerRadius, 0, delta > Math.PI, true, outerEnd.x, outerEnd.y)
    .lineTo(innerEnd)
    .arcTo(innerRadius, innerRadius, 0, delta > Math.PI, false, innerStart.x, innerStart.y)
    .close()).fill("#e5e7eb");
}

export function ring(innerRadius, outerRadius) {
  return annularSector(innerRadius, outerRadius, 0, Math.PI * 2 - 1e-7);
}

export function text(value, size = 18) {
  const content = String(value);
  if (/^\$[\s\S]*\$$/.test(content)) return math(content, size);
  const width = Math.max(size * 0.6, content.length * size * 0.58);
  const height = size * 1.25;
  return primitive(
    { type: "text", value: content, size },
    new Bounds(-width / 2, -height / 2, width / 2, height / 2),
    { fill: "none", stroke: "none", fontSize: size },
    { anchors: { baseline: new Point(0, size * 0.35) } },
  );
}

export function math(value, size = 20) {
  const typeset = typesetMath(value, { fontSize: size });
  return primitive(
    { type: "math", ...typeset, size },
    new Bounds(-typeset.width / 2, -typeset.height / 2, typeset.width / 2, typeset.height / 2),
    { fill: "none", stroke: "none", fontSize: size },
  );
}

export const mathText = math;
export const latex = math;

export function dot(radius = 3) { return circle(radius).fill("#111827").stroke("none", 0); }
