import { Point, normalizePoint } from "./geometry.js";
import { place, stack } from "./layout.js";
import { text } from "./primitives.js";

function finiteNumber(value, fallback, name) {
  const result = value == null ? fallback : Number(value);
  if (!Number.isFinite(result)) throw new RangeError(`${name} must be finite.`);
  return result;
}

function nonNegativeNumber(value, fallback, name) {
  const result = finiteNumber(value, fallback, name);
  if (result < 0) throw new RangeError(`${name} must be non-negative.`);
  return result;
}

function directionVector(value) {
  const direction = value == null ? new Point(0, -1) : normalizePoint(value);
  const length = Math.hypot(direction.x, direction.y);
  return length > 1e-9
    ? new Point(direction.x / length, direction.y / length)
    : new Point(0, -1);
}

function labelDiagram(item, options) {
  const supplied = item.diagram ?? item.content;
  if (supplied?.node) return supplied;
  const value = item.value ?? item.label;
  if (value?.node) return value;
  if (value == null) throw new TypeError("Every placeLabels() item needs value, label, or diagram.");
  return text(String(value), item.fontSize ?? item.size ?? options.fontSize ?? 18)
    .fill(item.color ?? options.color ?? "#111827")
    .fontWeight(item.weight ?? options.weight ?? 600);
}

function candidatePoints(item, at, options) {
  if (item.candidates != null) {
    if (!Array.isArray(item.candidates) || !item.candidates.length) {
      throw new TypeError("label candidates must be a non-empty array of points.");
    }
    return item.candidates.map(normalizePoint);
  }

  const direction = directionVector(item.direction);
  const tangent = new Point(-direction.y, direction.x);
  const offset = nonNegativeNumber(item.offset, options.offset ?? 24, "label offset");
  const step = nonNegativeNumber(item.step, options.step ?? 12, "label step");
  const rings = Math.max(0, Math.floor(finiteNumber(item.rings, options.rings ?? 2, "label rings")));
  const candidates = [];

  for (let ring = 0; ring <= rings; ring += 1) {
    const radial = offset + ring * step;
    const base = new Point(at.x + direction.x * radial, at.y + direction.y * radial);
    candidates.push(base);
    if (ring > 0) {
      const shift = step * ring;
      candidates.push(
        new Point(base.x + tangent.x * shift, base.y + tangent.y * shift),
        new Point(base.x - tangent.x * shift, base.y - tangent.y * shift),
      );
    }
  }
  return candidates;
}

function isPointLike(value) {
  return Array.isArray(value)
    ? value.length >= 2 && Number.isFinite(Number(value[0])) && Number.isFinite(Number(value[1]))
    : value && typeof value === "object"
      && Number.isFinite(Number(value.x)) && Number.isFinite(Number(value.y));
}

function normalizeObstacle(value) {
  if (value?.node && value.bounds) return { type: "bounds", bounds: value.bounds };
  if (value?.bounds && Number.isFinite(value.bounds.minX)) return { type: "bounds", bounds: value.bounds };
  if (Number.isFinite(value?.minX) && Number.isFinite(value?.minY)
    && Number.isFinite(value?.maxX) && Number.isFinite(value?.maxY)) {
    return { type: "bounds", bounds: value };
  }
  if (Array.isArray(value) && value.length === 2 && isPointLike(value[0]) && isPointLike(value[1])) {
    return { type: "segment", start: normalizePoint(value[0]), end: normalizePoint(value[1]) };
  }
  if (value && (value.start != null || value.from != null) && (value.end != null || value.to != null)) {
    return {
      type: "segment",
      start: normalizePoint(value.start ?? value.from),
      end: normalizePoint(value.end ?? value.to),
    };
  }
  if (isPointLike(value)) return { type: "point", point: normalizePoint(value), radius: 0 };
  if (value?.point != null) {
    return {
      type: "point",
      point: normalizePoint(value.point),
      radius: nonNegativeNumber(value.radius, 0, "obstacle radius"),
    };
  }
  throw new TypeError("Unsupported placeLabels() obstacle.");
}

function expanded(bounds, amount) {
  return {
    minX: bounds.minX - amount,
    minY: bounds.minY - amount,
    maxX: bounds.maxX + amount,
    maxY: bounds.maxY + amount,
  };
}

function overlapArea(first, second) {
  const width = Math.min(first.maxX, second.maxX) - Math.max(first.minX, second.minX);
  const height = Math.min(first.maxY, second.maxY) - Math.max(first.minY, second.minY);
  return width > 0 && height > 0 ? width * height : 0;
}

function pointInside(point, bounds) {
  return point.x >= bounds.minX && point.x <= bounds.maxX
    && point.y >= bounds.minY && point.y <= bounds.maxY;
}

function orientation(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function segmentsIntersect(a, b, c, d) {
  const abC = orientation(a, b, c);
  const abD = orientation(a, b, d);
  const cdA = orientation(c, d, a);
  const cdB = orientation(c, d, b);
  const epsilon = 1e-9;
  const onSegment = (start, end, point) => (
    point.x >= Math.min(start.x, end.x) - epsilon
    && point.x <= Math.max(start.x, end.x) + epsilon
    && point.y >= Math.min(start.y, end.y) - epsilon
    && point.y <= Math.max(start.y, end.y) + epsilon
  );
  if (Math.abs(abC) <= epsilon && onSegment(a, b, c)) return true;
  if (Math.abs(abD) <= epsilon && onSegment(a, b, d)) return true;
  if (Math.abs(cdA) <= epsilon && onSegment(c, d, a)) return true;
  if (Math.abs(cdB) <= epsilon && onSegment(c, d, b)) return true;
  return (abC > 0) !== (abD > 0) && (cdA > 0) !== (cdB > 0);
}

function segmentHitsBounds(start, end, bounds) {
  if (pointInside(start, bounds) || pointInside(end, bounds)) return true;
  const topLeft = new Point(bounds.minX, bounds.minY);
  const topRight = new Point(bounds.maxX, bounds.minY);
  const bottomRight = new Point(bounds.maxX, bounds.maxY);
  const bottomLeft = new Point(bounds.minX, bounds.maxY);
  return segmentsIntersect(start, end, topLeft, topRight)
    || segmentsIntersect(start, end, topRight, bottomRight)
    || segmentsIntersect(start, end, bottomRight, bottomLeft)
    || segmentsIntersect(start, end, bottomLeft, topLeft);
}

function collisionScore(bounds, placedBounds, obstacles, clearance) {
  const padded = expanded(bounds, clearance);
  let score = 0;

  for (const previous of placedBounds) {
    const area = overlapArea(padded, expanded(previous, clearance));
    if (area > 0) score += 1_000_000 + area;
  }

  for (const obstacle of obstacles) {
    if (obstacle.type === "bounds") {
      const area = overlapArea(padded, expanded(obstacle.bounds, clearance));
      if (area > 0) score += 100_000 + area;
    } else if (obstacle.type === "segment") {
      if (segmentHitsBounds(obstacle.start, obstacle.end, padded)) score += 100_000;
    } else if (obstacle.type === "point") {
      const pointBounds = expanded({
        minX: obstacle.point.x,
        minY: obstacle.point.y,
        maxX: obstacle.point.x,
        maxY: obstacle.point.y,
      }, obstacle.radius);
      if (overlapArea(padded, pointBounds) > 0 || pointInside(obstacle.point, padded)) score += 100_000;
    }
  }
  return score;
}

/**
 * Place several labels near preferred anchors while avoiding earlier labels and
 * simple geometric obstacles. Candidate order is stable, so output is deterministic.
 */
export function placeLabels(items, options = {}) {
  if (!Array.isArray(items)) throw new TypeError("placeLabels() expects an array of label items.");
  const clearance = nonNegativeNumber(options.clearance, 4, "label clearance");
  const obstacles = (options.obstacles ?? options.avoid ?? []).map(normalizeObstacle);
  const placedBounds = [];
  const placedDiagrams = [];
  const anchors = [];

  items.forEach((item, index) => {
    if (!item || typeof item !== "object") throw new TypeError("Every placeLabels() item must be an object.");
    const at = normalizePoint(item.at ?? item.anchor);
    const diagram = labelDiagram(item, options);
    const candidates = candidatePoints(item, at, options);
    let chosen = null;

    candidates.forEach((candidate, candidateIndex) => {
      const placed = place(diagram, candidate, item.sourceAnchor ?? "center");
      const collisions = collisionScore(placed.bounds, placedBounds, obstacles, clearance);
      const distance = candidate.distanceTo(at);
      const score = collisions + distance * 0.001 + candidateIndex * 1e-7;
      if (!chosen || score < chosen.score) chosen = { point: candidate, diagram: placed, score };
    });

    placedBounds.push(chosen.diagram.bounds);
    placedDiagrams.push(chosen.diagram);
    anchors.push({ name: item.name ?? `label${index}`, point: chosen.point });
  });

  let result = stack(placedDiagrams);
  anchors.forEach(({ name, point }, index) => {
    result = result.withAnchor(name, point);
    if (name !== `label${index}`) result = result.withAnchor(`label${index}`, point);
  });
  return result;
}
