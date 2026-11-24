import { EPSILON, Point, normalizePoint } from "./geometry.js";
import { boundaryPoint, place, stack } from "./layout.js";
import {
  annularSector,
  arc,
  line,
  polygon,
  polyline,
  sector,
  text,
} from "./primitives.js";

const TAU = Math.PI * 2;

function positiveModulo(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}

function positiveNumber(value, fallback, name) {
  const result = value == null ? fallback : Number(value);
  if (!Number.isFinite(result) || result <= 0) {
    throw new RangeError(`${name} must be a positive finite number.`);
  }
  return result;
}

function nonNegativeNumber(value, fallback, name) {
  const result = value == null ? fallback : Number(value);
  if (!Number.isFinite(result) || result < 0) {
    throw new RangeError(`${name} must be a non-negative finite number.`);
  }
  return result;
}

function positiveCount(value, fallback = 1) {
  const count = value == null ? fallback : Number(value);
  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError("count must be a positive integer.");
  }
  return count;
}

function rayFrom(vertex, target, name) {
  const direction = target.sub(vertex);
  const magnitude = direction.magnitude();
  if (magnitude < EPSILON) {
    throw new RangeError(`${name} must differ from the vertex.`);
  }
  return {
    direction: direction.scale(1 / magnitude),
    angle: Math.atan2(direction.y, direction.x),
  };
}

function resolveAngleMode(options) {
  const requested = options.mode
    ?? (options.exterior || options.reflex ? "major" : null)
    ?? (options.clockwise ? "clockwise" : null)
    ?? (options.counterclockwise ? "counterclockwise" : null)
    ?? "minor";
  const aliases = {
    interior: "minor",
    exterior: "major",
    reflex: "major",
    ccw: "counterclockwise",
    cw: "clockwise",
  };
  const mode = aliases[requested] ?? requested;
  if (!["minor", "major", "clockwise", "counterclockwise"].includes(mode)) {
    throw new RangeError(`Unknown angle mode: ${requested}.`);
  }
  return mode;
}

function resolveAngleSweep(firstAngle, secondAngle, mode) {
  const counterclockwise = positiveModulo(secondAngle - firstAngle, TAU);
  if (counterclockwise < EPSILON || TAU - counterclockwise < EPSILON) {
    throw new RangeError("angleMark() needs two distinct rays.");
  }

  if (mode === "counterclockwise") {
    return { startAngle: firstAngle, sweepAngle: counterclockwise };
  }
  if (mode === "clockwise") {
    return { startAngle: secondAngle, sweepAngle: TAU - counterclockwise };
  }

  const firstSweep = counterclockwise;
  const secondSweep = TAU - counterclockwise;
  const useFirst = mode === "minor"
    ? firstSweep <= secondSweep
    : firstSweep > secondSweep;
  return useFirst
    ? { startAngle: firstAngle, sweepAngle: firstSweep }
    : { startAngle: secondAngle, sweepAngle: secondSweep };
}

function styleLine(diagram, options, defaultColor = "#1f2937") {
  let result = diagram.stroke(options.color ?? options.stroke ?? defaultColor, options.width ?? 2);
  if (options.dash) result = result.dash(options.dash, options.dashOffset ?? 0);
  if (options.lineCap) result = result.lineCap(options.lineCap);
  return result;
}

function annotationText(value, options = {}) {
  if (value?.node) return value;
  return text(String(value), options.labelSize ?? options.size ?? 18)
    .fill(options.labelColor ?? options.color ?? options.stroke ?? "#111827")
    .fontWeight(options.labelWeight ?? options.weight ?? 600);
}

export function arrow(start, end, options = {}) {
  const from = normalizePoint(start);
  const to = normalizePoint(end);
  const color = options.color ?? "#1f2937";
  const width = options.width ?? 2;
  const headLength = options.headLength ?? Math.max(8, width * 4);
  const headWidth = options.headWidth ?? headLength * 0.72;
  const direction = to.sub(from).normalize();
  const normal = direction.perpendicular();
  const base = to.add(direction.scale(-headLength));
  const left = base.add(normal.scale(headWidth / 2));
  const right = base.add(normal.scale(-headWidth / 2));
  return stack([
    line(from, base).stroke(color, width),
    polygon([to, left, right]).fill(color).stroke(color, 0),
  ]);
}

export function connect(first, second, options = {}) {
  const fromCenter = first.anchor(options.fromAnchor ?? "center");
  const toCenter = second.anchor(options.toAnchor ?? "center");
  const from = first.boundaryToward(toCenter);
  const to = second.boundaryToward(fromCenter);
  return line(from, to).stroke(options.color ?? "#64748b", options.width ?? 2);
}

export const connectOutside = connect;

export function arrowBetween(first, second, options = {}) {
  const fromCenter = first.anchor(options.fromAnchor ?? "center");
  const toCenter = second.anchor(options.toAnchor ?? "center");
  return arrow(
    first.boundaryToward(toCenter),
    second.boundaryToward(fromCenter),
    options,
  );
}

export function label(value, target, options = {}) {
  const targetPoint = normalizePoint(target);
  const offset = options.offset ?? [0, 0];
  const labelDiagram = text(value, options.size ?? 18)
    .color(options.color ?? "#111827")
    .fontWeight(options.weight ?? 600);
  return place(labelDiagram, new Point(targetPoint.x + offset[0], targetPoint.y + offset[1]));
}

export function tick(target, options = {}) {
  const at = normalizePoint(target);
  const size = options.size ?? 10;
  const angle = options.angle ?? Math.PI / 2;
  const direction = new Point(Math.cos(angle) * size / 2, Math.sin(angle) * size / 2);
  return line(
    [at.x - direction.x, at.y - direction.y],
    [at.x + direction.x, at.y + direction.y],
  ).stroke(options.color ?? "#1f2937", options.width ?? 2);
}

/**
 * Draw an automatically measured angle between two rays sharing a vertex.
 */
export function angleMark(vertex, firstRayPoint, secondRayPoint, options = {}) {
  const at = normalizePoint(vertex);
  const first = normalizePoint(firstRayPoint);
  const second = normalizePoint(secondRayPoint);
  const firstRay = rayFrom(at, first, "firstRayPoint");
  const secondRay = rayFrom(at, second, "secondRayPoint");
  const mode = resolveAngleMode(options);
  const { startAngle, sweepAngle } = resolveAngleSweep(firstRay.angle, secondRay.angle, mode);
  const radius = positiveNumber(options.radius, 28, "radius");
  const count = positiveCount(options.count);
  const gap = nonNegativeNumber(options.gap, 6, "gap");
  const stroke = options.stroke ?? options.color ?? "#1f2937";
  const width = options.width ?? 2;
  const fill = options.fill ?? "none";
  const diagrams = [];

  if (fill !== "none") {
    const innerRadius = nonNegativeNumber(options.innerRadius, 0, "innerRadius");
    if (innerRadius >= radius) {
      throw new RangeError("innerRadius must be smaller than radius.");
    }
    let region = innerRadius > 0
      ? annularSector(innerRadius, radius, startAngle, startAngle + sweepAngle)
      : sector(radius, startAngle, startAngle + sweepAngle);
    region = region.fill(fill).stroke(stroke, width);
    if (options.fillOpacity != null) region = region.fillOpacity(options.fillOpacity);
    diagrams.push(region.translate(at));
  }

  const firstArcIndex = fill === "none" ? 0 : 1;
  for (let index = firstArcIndex; index < count; index += 1) {
    let curve = arc(radius + index * gap, startAngle, startAngle + sweepAngle)
      .fill("none")
      .stroke(stroke, width);
    if (options.dash) curve = curve.dash(options.dash, options.dashOffset ?? 0);
    if (options.lineCap) curve = curve.lineCap(options.lineCap);
    diagrams.push(curve.translate(at));
  }

  const outerRadius = radius + Math.max(0, count - 1) * gap;
  const middleAngle = startAngle + sweepAngle / 2;
  let labelPoint = null;
  if (options.label != null && options.label !== false) {
    const labelRadius = positiveNumber(options.labelRadius, outerRadius + 20, "labelRadius");
    const offset = options.labelOffset ?? [0, 0];
    labelPoint = new Point(
      at.x + Math.cos(middleAngle) * labelRadius + Number(offset[0] ?? offset.x ?? 0),
      at.y + Math.sin(middleAngle) * labelRadius + Number(offset[1] ?? offset.y ?? 0),
    );
    diagrams.push(place(annotationText(options.label, options), labelPoint));
  }

  let result = stack(diagrams).withAnchor("vertex", at);
  const firstArcPoint = new Point(
    at.x + Math.cos(startAngle) * radius,
    at.y + Math.sin(startAngle) * radius,
  );
  const secondArcPoint = new Point(
    at.x + Math.cos(startAngle + sweepAngle) * radius,
    at.y + Math.sin(startAngle + sweepAngle) * radius,
  );
  result = result
    .withAnchor("start", firstArcPoint)
    .withAnchor("end", secondArcPoint);
  if (labelPoint) result = result.withAnchor("label", labelPoint);
  return result;
}

/** Extend a segment before its start, after its end, or both. */
export function extendLine(start, end, options = {}) {
  const from = normalizePoint(start);
  const to = normalizePoint(end);
  const ray = rayFrom(from, to, "end");
  const before = nonNegativeNumber(options.before, 0, "before");
  const after = nonNegativeNumber(options.after, 40, "after");
  const extendedStart = from.add(ray.direction.scale(-before));
  const extendedEnd = to.add(ray.direction.scale(after));
  return styleLine(line(extendedStart, extendedEnd), options)
    .withAnchor("start", from)
    .withAnchor("end", to)
    .withAnchor("extendedStart", extendedStart)
    .withAnchor("extendedEnd", extendedEnd);
}

export const lineExtension = extendLine;

/** Draw the familiar square corner used to identify a right angle. */
export function rightAngleMark(vertex, firstRayPoint, secondRayPoint, options = {}) {
  const at = normalizePoint(vertex);
  const first = normalizePoint(firstRayPoint);
  const second = normalizePoint(secondRayPoint);
  const firstRay = rayFrom(at, first, "firstRayPoint");
  const secondRay = rayFrom(at, second, "secondRayPoint");
  const size = positiveNumber(options.size, 18, "size");
  const firstCorner = at.add(firstRay.direction.scale(size));
  const secondCorner = at.add(secondRay.direction.scale(size));
  const outerCorner = at.add(firstRay.direction.add(secondRay.direction).scale(size));
  const color = options.color ?? options.stroke ?? "#1f2937";
  const width = options.width ?? 2;
  const diagrams = [];

  if (options.fill && options.fill !== "none") {
    let region = polygon([at, firstCorner, outerCorner, secondCorner])
      .fill(options.fill)
      .stroke("none", 0);
    if (options.fillOpacity != null) region = region.fillOpacity(options.fillOpacity);
    diagrams.push(region);
  }
  diagrams.push(polyline([firstCorner, outerCorner, secondCorner])
    .fill("none")
    .stroke(color, width));

  return stack(diagrams)
    .withAnchor("vertex", at)
    .withAnchor("corner", outerCorner);
}

/** Draw one or more equality ticks centered on a segment. */
export function sideTicks(start, end, options = {}) {
  const from = normalizePoint(start);
  const to = normalizePoint(end);
  const ray = rayFrom(from, to, "end");
  const count = positiveCount(options.count);
  const size = positiveNumber(options.size, 12, "size");
  const gap = nonNegativeNumber(options.gap, 7, "gap");
  const position = Number(options.position ?? 0.5);
  if (!Number.isFinite(position)) throw new RangeError("position must be finite.");
  const middle = from.lerp(to, position);
  const normal = ray.direction.perpendicular();
  const diagrams = Array.from({ length: count }, (_, index) => {
    const along = (index - (count - 1) / 2) * gap;
    const center = middle.add(ray.direction.scale(along));
    const half = normal.scale(size / 2);
    return styleLine(line(center.add(half.neg()), center.add(half)), options);
  });
  return stack(diagrams).withAnchor("center", middle);
}

/** Draw one or more chevrons used to identify parallel segments. */
export function parallelMarks(start, end, options = {}) {
  const from = normalizePoint(start);
  const to = normalizePoint(end);
  const ray = rayFrom(from, to, "end");
  const count = positiveCount(options.count);
  const size = positiveNumber(options.size, 14, "size");
  const gap = nonNegativeNumber(options.gap, 10, "gap");
  const position = Number(options.position ?? 0.5);
  if (!Number.isFinite(position)) throw new RangeError("position must be finite.");
  const middle = from.lerp(to, position);
  const normal = ray.direction.perpendicular();
  const diagrams = [];

  for (let index = 0; index < count; index += 1) {
    const along = (index - (count - 1) / 2) * gap;
    const center = middle.add(ray.direction.scale(along));
    const tip = center.add(ray.direction.scale(size / 2));
    const back = center.add(ray.direction.scale(-size / 2));
    const wing = normal.scale(size * 0.34);
    diagrams.push(
      styleLine(line(back.add(wing), tip), options),
      styleLine(line(back.add(wing.neg()), tip), options),
    );
  }
  return stack(diagrams).withAnchor("center", middle);
}

/** Draw a measured line with automatic extensions, arrows, and a label. */
export function dimensionLine(start, end, options = {}) {
  const from = normalizePoint(start);
  const to = normalizePoint(end);
  const ray = rayFrom(from, to, "end");
  const offset = Number(options.offset ?? 28);
  if (!Number.isFinite(offset)) throw new RangeError("offset must be finite.");
  const overshoot = nonNegativeNumber(options.overshoot, 7, "overshoot");
  const normal = ray.direction.perpendicular();
  const dimensionStart = from.add(normal.scale(offset));
  const dimensionEnd = to.add(normal.scale(offset));
  const outward = offset < 0 ? -1 : 1;
  const extensionVector = normal.scale(offset + outward * overshoot);
  const color = options.color ?? options.stroke ?? "#1f2937";
  const width = options.width ?? 2;
  const diagrams = [];

  if (options.extensions !== false) {
    diagrams.push(
      styleLine(line(from, from.add(extensionVector)), options),
      styleLine(line(to, to.add(extensionVector)), options),
    );
  }

  if (options.arrows === false) {
    diagrams.push(styleLine(line(dimensionStart, dimensionEnd), options));
  } else {
    const arrowOptions = {
      color,
      width,
      headLength: options.headLength,
      headWidth: options.headWidth,
    };
    diagrams.push(
      arrow(dimensionStart, dimensionEnd, arrowOptions),
      arrow(dimensionEnd, dimensionStart, arrowOptions),
    );
  }

  if (options.label !== false) {
    const precision = Number(options.precision ?? 0);
    if (!Number.isInteger(precision) || precision < 0 || precision > 12) {
      throw new RangeError("precision must be an integer from 0 to 12.");
    }
    const automaticLabel = `${from.distanceTo(to).toFixed(precision)}${options.unit ?? ""}`;
    const labelValue = options.label ?? automaticLabel;
    const labelGap = Number(options.labelGap ?? 17);
    if (!Number.isFinite(labelGap)) throw new RangeError("labelGap must be finite.");
    const labelPoint = dimensionStart.lerp(dimensionEnd, 0.5)
      .add(normal.scale(outward * labelGap));
    diagrams.push(place(annotationText(labelValue, options), labelPoint));
  }

  return stack(diagrams)
    .withAnchor("start", dimensionStart)
    .withAnchor("end", dimensionEnd)
    .withAnchor("center", dimensionStart.lerp(dimensionEnd, 0.5));
}
