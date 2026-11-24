import { Bounds, Point, Vector, normalizePoint, vector } from "./geometry.js";
import { Diagram, group, primitive } from "./diagram.js";

export function stack(diagrams) { return group(diagrams); }

/**
 * @deprecated Use stack() for layered composition.
 */
export const overlay = stack;
export function layer(base, children = []) { return group([base, ...children]); }

function arranged(diagrams, axis, gap, align = "center") {
  const items = diagrams.filter(Boolean);
  if (!items.length) return group([]);
  let cursor = 0;
  const placed = [];
  for (const item of items) {
    const alongSize = axis === "x" ? item.width : item.height;
    const alongMin = axis === "x" ? item.bounds.minX : item.bounds.minY;
    const crossOffset = alignmentOffset(item, axis, align);
    const alongOffset = cursor - alongMin;
    placed.push(axis === "x"
      ? item.translate(alongOffset, crossOffset)
      : item.translate(crossOffset, alongOffset));
    cursor += alongSize + gap;
  }
  const result = group(placed);
  return result.translate(-result.center.x, -result.center.y);
}

function alignmentOffset(item, axis, align) {
  const bounds = item.bounds;
  if (axis === "x") {
    if (align === "top") return -bounds.minY;
    if (align === "bottom") return -bounds.maxY;
    if (align === "baseline") return -item.anchor("baseline").y;
    return -bounds.center.y;
  }
  if (align === "left") return -bounds.minX;
  if (align === "right") return -bounds.maxX;
  return -bounds.center.x;
}

export function row(gapOrItems, maybeItems, options = {}) {
  const gap = Array.isArray(gapOrItems) ? 0 : gapOrItems;
  const items = Array.isArray(gapOrItems) ? gapOrItems : maybeItems;
  return arranged(items ?? [], "x", gap ?? 0, options.align ?? "center");
}

export function column(gapOrItems, maybeItems, options = {}) {
  const gap = Array.isArray(gapOrItems) ? 0 : gapOrItems;
  const items = Array.isArray(gapOrItems) ? gapOrItems : maybeItems;
  return arranged(items ?? [], "y", gap ?? 0, options.align ?? "center");
}

export const hcat = row;
export const vcat = column;

export function grid(columns, gapOrOptions, itemsMaybe) {
  const options = typeof gapOrOptions === "number"
    ? { gapX: gapOrOptions, gapY: gapOrOptions }
    : (gapOrOptions ?? {});
  const items = typeof gapOrOptions === "number" ? itemsMaybe : itemsMaybe ?? options.items;
  const rows = [];
  for (let index = 0; index < (items?.length ?? 0); index += columns) {
    rows.push(row(options.gapX ?? 0, items.slice(index, index + columns), { align: options.rowAlign }));
  }
  return column(options.gapY ?? 0, rows, { align: options.columnAlign });
}

export function distribute(direction, diagrams, gap = 0, options = {}) {
  const dir = direction instanceof Vector ? direction : vector(direction.x ?? direction[0], direction.y ?? direction[1]);
  return Math.abs(dir.x) >= Math.abs(dir.y)
    ? arranged(diagrams, "x", gap, options.align ?? "center")
    : arranged(diagrams, "y", gap, options.align ?? "center");
}

export function frame(width, height, diagram, options = {}) {
  const offsetX = options.alignX === "left" ? -width / 2 - diagram.bounds.minX
    : options.alignX === "right" ? width / 2 - diagram.bounds.maxX
      : -diagram.center.x;
  const offsetY = options.alignY === "top" ? -height / 2 - diagram.bounds.minY
    : options.alignY === "bottom" ? height / 2 - diagram.bounds.maxY
      : -diagram.center.y;
  const moved = diagram.translate(offsetX, offsetY);
  return new Diagram(
    { type: "bounds", diagram: moved },
    new Bounds(-width / 2, -height / 2, width / 2, height / 2),
    moved.styleValue,
    moved.metadata,
  );
}

export function scaleToFit(width, height, diagram, options = {}) {
  if (!diagram.width || !diagram.height) return diagram;
  const scale = options.cover
    ? Math.max(width / diagram.width, height / diagram.height)
    : Math.min(width / diagram.width, height / diagram.height);
  return diagram.scale(scale);
}

export function beside(direction, first, second, gap = 0) {
  const dir = direction instanceof Vector ? direction.normalize() : vector(direction.x, direction.y).normalize();
  if (Math.abs(dir.x) >= Math.abs(dir.y)) {
    return dir.x >= 0 ? row(gap, [first, second]) : row(gap, [second, first]);
  }
  return dir.y >= 0 ? column(gap, [first, second]) : column(gap, [second, first]);
}

export function align(diagram, where = "center") {
  const anchor = diagram.anchor(where);
  return diagram.translate(-anchor.x, -anchor.y);
}

export const alignLeft = (diagram) => align(diagram, "left");
export const alignRight = (diagram) => align(diagram, "right");
export const alignTop = (diagram) => align(diagram, "top");
export const alignBottom = (diagram) => align(diagram, "bottom");
export const center = (diagram) => align(diagram, "center");
export const pad = (amount, diagram) => diagram.pad(amount);

export function strut(width, height) {
  return primitive({ type: "empty" }, new Bounds(-width / 2, -height / 2, width / 2, height / 2));
}

export const spacer = strut;

export function place(diagram, target, sourceAnchor = "center") {
  const point = normalizePoint(target);
  const source = diagram.anchor(sourceAnchor);
  return diagram.translate(point.x - source.x, point.y - source.y);
}

export function connectWith(first, second, options = {}) {
  const from = first instanceof Diagram ? first.anchor(options.fromAnchor ?? "center") : normalizePoint(first);
  const to = second instanceof Diagram ? second.anchor(options.toAnchor ?? "center") : normalizePoint(second);
  const start = first instanceof Diagram ? boundaryPoint(first.bounds, from, to) : from;
  const end = second instanceof Diagram ? boundaryPoint(second.bounds, to, from) : to;
  const lineFactory = options.lineFactory;
  if (lineFactory) return lineFactory(start, end);
  throw new Error("connectWith() requires a lineFactory option.");
}

export function boundaryPoint(bounds, centerPoint, towardPoint) {
  const center = centerPoint ?? bounds.center;
  const direction = towardPoint.sub(center);
  if (direction.magnitudeSquared() === 0) return center;
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
