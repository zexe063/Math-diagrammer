import { Point, normalizePoint } from "../core/geometry.js";
import { group } from "../core/diagram.js";
import { line, polygon } from "../core/primitives.js";

const TAU = Math.PI * 2;

function finiteNumber(value, fallback, name) {
  const result = value == null ? fallback : Number(value);
  if (!Number.isFinite(result)) throw new RangeError(`${name} must be finite.`);
  return result;
}

function positiveNumber(value, fallback, name) {
  const result = value == null ? fallback : Number(value);
  if (!Number.isFinite(result) || result <= 0) {
    throw new RangeError(`${name} must be a positive finite number.`);
  }
  return result;
}

function integer(value, fallback, minimum, name) {
  const result = value == null ? fallback : Number(value);
  if (!Number.isInteger(result) || result < minimum) {
    throw new RangeError(`${name} must be an integer of at least ${minimum}.`);
  }
  return result;
}

function requestedSpikeCount(value) {
  if (value == null || typeof value === "boolean") return null;
  const result = Number(value);
  if (!Number.isInteger(result) || result < 2) {
    throw new RangeError("spikes must be an integer of at least 2.");
  }
  return result;
}

function normalizeArguments(partsOrOptions, maybeOptions) {
  if (partsOrOptions && typeof partsOrOptions === "object" && !Array.isArray(partsOrOptions)) {
    const options = { ...partsOrOptions };
    const requestedSpikes = requestedSpikeCount(options.spikes);
    const parts = options.parts ?? options.sides ?? options.count
      ?? (requestedSpikes == null ? 12 : requestedSpikes * 2);
    return { parts, options };
  }
  return { parts: partsOrOptions ?? 12, options: maybeOptions ?? {} };
}

function normalizePalette(options) {
  const palette = options.palette ?? options.colors;
  if (palette != null) {
    if (!Array.isArray(palette) || palette.length === 0) {
      throw new TypeError("radialPolygon palette must be a non-empty array.");
    }
    return palette.slice();
  }
  return options.fill != null
    ? [options.fill]
    : ["#1598d5", "#ffad2f"];
}

function usesRadiusProfile(options) {
  return options.radii != null
    || options.vertexRadii != null
    || options.innerRadius != null
    || options.spikeRadius != null
    || options.spikeDepth != null
    || options.spikes === true
    || requestedSpikeCount(options.spikes) != null;
}

function normalizeRadii(parts, options, radius) {
  const supplied = options.radii ?? options.vertexRadii;
  if (supplied != null) {
    if (typeof supplied === "function") {
      return Array.from({ length: parts }, (_, index) => positiveNumber(
        supplied(index, parts),
        radius,
        `radii[${index}]`,
      ));
    }
    if (!Array.isArray(supplied) || supplied.length !== parts) {
      throw new RangeError(`radii must contain exactly ${parts} values.`);
    }
    return supplied.map((value, index) => positiveNumber(value, radius, `radii[${index}]`));
  }

  const innerValue = options.innerRadius ?? options.spikeRadius;
  const depth = options.spikeDepth;
  const hasSpikes = innerValue != null
    || depth != null
    || options.spikes === true
    || requestedSpikeCount(options.spikes) != null;
  if (!hasSpikes) return Array(parts).fill(radius);
  if (parts % 2 !== 0) {
    throw new RangeError("Alternating radial spikes require an even parts count.");
  }
  const inner = innerValue != null
    ? positiveNumber(innerValue, radius * 0.58, "innerRadius")
    : depth != null
      ? radius - finiteNumber(depth, radius * 0.42, "spikeDepth")
      : radius * 0.58;
  if (inner <= 0 || inner >= radius) {
    throw new RangeError("innerRadius must be positive and smaller than radius.");
  }
  return Array.from({ length: parts }, (_, index) => index % 2 ? inner : radius);
}

function colorFor(palette, options, index, pointCount) {
  if (typeof options.sectorColor === "function") {
    return options.sectorColor(index, pointCount) ?? palette[index % palette.length];
  }
  return palette[index % palette.length];
}

function addAnchors(diagram, anchors) {
  return anchors.reduce((result, entry) => result.withAnchor(entry.name, entry.point), diagram);
}

/**
 * Draws a polygon divided into equal-angle sectors from a shared center.
 *
 * A regular radial partition is the default. Supplying `innerRadius`,
 * `spikeRadius`, `spikeDepth`, or `radii` creates an alternating or custom
 * spiked boundary while preserving the same central-sector grammar.
 */
export function radialPolygon(partsOrOptions = 12, maybeOptions = {}) {
  let { parts, options } = normalizeArguments(partsOrOptions, maybeOptions);
  const spikeCount = requestedSpikeCount(options.spikes);
  if (spikeCount != null && options.parts == null && options.sides == null && options.count == null) {
    parts = spikeCount * 2;
  }
  parts = integer(parts, 12, 3, "parts");
  if (spikeCount != null && parts !== spikeCount * 2) {
    throw new RangeError("parts must equal twice the numeric spikes count.");
  }

  const radius = positiveNumber(options.radius ?? options.outerRadius, 120, "radius");
  const center = normalizePoint(options.center ?? [0, 0]);
  const rotation = finiteNumber(
    options.rotation,
    usesRadiusProfile(options) ? -Math.PI / 2 : -Math.PI / 2 + Math.PI / parts,
    "rotation",
  );
  const radii = normalizeRadii(parts, options, radius);
  const palette = normalizePalette(options);
  const stroke = options.stroke
    ?? (typeof options.outline === "string" ? options.outline : "#172033");
  const strokeWidth = positiveNumber(options.strokeWidth, 2.5, "strokeWidth");
  const drawSpokes = options.spokes !== false && options.dividers !== false;
  const drawOutline = options.outline !== false && options.boundary !== false;

  const vertices = Array.from({ length: parts }, (_, index) => {
    const angle = rotation + index * TAU / parts;
    return new Point(
      center.x + Math.cos(angle) * radii[index],
      center.y + Math.sin(angle) * radii[index],
    );
  });
  const sectors = [];
  const anchors = [{ name: "center", point: center }];

  for (let index = 0; index < parts; index += 1) {
    const next = (index + 1) % parts;
    const midpoint = new Point(
      (center.x + vertices[index].x + vertices[next].x) / 3,
      (center.y + vertices[index].y + vertices[next].y) / 3,
    );
    sectors.push(
      polygon([center, vertices[index], vertices[next]])
        .fill(colorFor(palette, options, index, parts))
        .stroke("none", 0),
    );
    anchors.push(
      { name: `vertex${index}`, point: vertices[index] },
      { name: `sector${index}`, point: midpoint },
    );
  }

  const marks = [];
  if (drawSpokes) {
    for (const vertex of vertices) marks.push(line(center, vertex).stroke(stroke, strokeWidth));
  }
  if (drawOutline) {
    marks.push(polygon(vertices).fill("none").stroke(stroke, strokeWidth));
  }

  let result = group([...sectors, ...marks]);
  if (options.opacity != null) result = result.opacity(options.opacity);
  return addAnchors(result, anchors);
}

/** Concise semantic alias for a center-divided radial polygon. */
export const radialPartition = radialPolygon;
