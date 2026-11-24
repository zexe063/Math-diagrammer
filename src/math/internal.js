import {
  circle,
  line,
  stack,
  point,
  polygon,
  polyline,
  rectangle,
  sector,
  text,
} from "../index.js";

export const DEFAULT_PALETTE = Object.freeze([
  "#2563eb",
  "#f97316",
  "#16a34a",
  "#dc2626",
  "#9333ea",
  "#0891b2",
  "#ca8a04",
  "#db2777",
]);

export function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function positiveNumber(value, fallback = 1) {
  const number = finiteNumber(value, fallback);
  return number > 0 ? number : fallback;
}

export function integer(value, fallback = 0, minimum = -Infinity) {
  const number = Math.floor(finiteNumber(value, fallback));
  return Math.max(minimum, number);
}

export function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function mapLinear(value, inputMinimum, inputMaximum, outputMinimum, outputMaximum) {
  if (inputMaximum === inputMinimum) return (outputMinimum + outputMaximum) / 2;
  const ratio = (value - inputMinimum) / (inputMaximum - inputMinimum);
  return outputMinimum + ratio * (outputMaximum - outputMinimum);
}

export function asPoint(value) {
  if (Array.isArray(value)) return point(value[0] ?? 0, value[1] ?? 0);
  if (value && typeof value === "object") return point(value.x ?? 0, value.y ?? 0);
  throw new TypeError("Expected [x, y] or {x, y}.");
}

export function normalizeDomain(domain, fallback = [-1, 1], padding = 0) {
  let minimum = finiteNumber(domain?.[0], fallback[0]);
  let maximum = finiteNumber(domain?.[1], fallback[1]);
  if (minimum > maximum) [minimum, maximum] = [maximum, minimum];
  if (minimum === maximum) {
    const amount = Math.abs(minimum) > 0 ? Math.abs(minimum) * 0.1 : 1;
    minimum -= amount;
    maximum += amount;
  }
  if (padding) {
    const amount = (maximum - minimum) * padding;
    minimum -= amount;
    maximum += amount;
  }
  return [minimum, maximum];
}

export function extent(values, fallback = [0, 1], padding = 0) {
  const finite = values.map(Number).filter(Number.isFinite);
  if (!finite.length) return normalizeDomain(fallback, fallback, padding);
  return normalizeDomain([Math.min(...finite), Math.max(...finite)], fallback, padding);
}

function niceStep(span, targetCount) {
  const rough = span / Math.max(1, targetCount);
  const power = 10 ** Math.floor(Math.log10(rough));
  const error = rough / power;
  const factor = error >= 7.5 ? 10 : error >= 3.5 ? 5 : error >= 1.5 ? 2 : 1;
  return factor * power;
}

export function tickValues(minimum, maximum, stepOrCount = 5) {
  if (!Number.isFinite(minimum) || !Number.isFinite(maximum)) return [];
  if (minimum > maximum) [minimum, maximum] = [maximum, minimum];
  if (minimum === maximum) return [minimum];

  const explicitStep = typeof stepOrCount === "object" ? stepOrCount.step : null;
  const targetCount = typeof stepOrCount === "object" ? stepOrCount.count ?? 5 : stepOrCount;
  const step = positiveNumber(explicitStep, niceStep(maximum - minimum, targetCount));
  const first = Math.ceil((minimum - step * 1e-9) / step) * step;
  const values = [];
  const precision = Math.max(0, -Math.floor(Math.log10(step)) + 3);
  for (let value = first, guard = 0; value <= maximum + step * 1e-9 && guard < 10_000; value += step, guard += 1) {
    const rounded = Number(value.toFixed(precision));
    values.push(Object.is(rounded, -0) ? 0 : rounded);
  }
  return values;
}

export function formatNumber(value, precision = 4) {
  if (!Number.isFinite(value)) return "";
  if (Math.abs(value) < 10 ** (-precision)) return "0";
  return Number(value.toFixed(precision)).toString();
}

export function makeText(value, x, y, options = {}) {
  const {
    fontSize = 15,
    color = "#111827",
    rotate = 0,
  } = options;
  let diagram = text(String(value), fontSize).color(color);
  if (rotate) diagram = diagram.rotate(rotate);
  return diagram.translate(x, y);
}

export function makeLine(a, b, options = {}) {
  const {
    color = "#1f2937",
    width = 2,
    dash = null,
    opacity = 1,
  } = options;
  let diagram = line(asPoint(a), asPoint(b)).fill("none").stroke(color, width);
  if (dash?.length) diagram = diagram.dash(dash);
  if (opacity !== 1) diagram = diagram.opacity(opacity);
  return diagram;
}

export function makePolyline(points, options = {}) {
  const {
    color = "#2563eb",
    width = 3,
    fill = "none",
    dash = null,
    opacity = 1,
  } = options;
  let diagram = polyline(points.map(asPoint)).fill(fill).stroke(color, width);
  if (dash?.length) diagram = diagram.dash(dash);
  if (opacity !== 1) diagram = diagram.opacity(opacity);
  return diagram;
}

export function makeRectangle(width, height, x, y, options = {}) {
  const {
    fill = "none",
    stroke = "#1f2937",
    strokeWidth = 2,
    opacity = 1,
  } = options;
  let diagram = rectangle(width, height).fill(fill).stroke(stroke, strokeWidth).translate(x, y);
  if (opacity !== 1) diagram = diagram.opacity(opacity);
  return diagram;
}

export function makeCircle(radius, x, y, options = {}) {
  const {
    fill = "none",
    stroke = "#1f2937",
    strokeWidth = 2,
    opacity = 1,
  } = options;
  let diagram = circle(radius).fill(fill).stroke(stroke, strokeWidth).translate(x, y);
  if (opacity !== 1) diagram = diagram.opacity(opacity);
  return diagram;
}

export function makeSector(radius, startAngle, endAngle, x, y, options = {}) {
  const {
    fill = "none",
    stroke = "#1f2937",
    strokeWidth = 2,
    opacity = 1,
  } = options;
  let diagram = sector(radius, startAngle, endAngle)
    .fill(fill)
    .stroke(stroke, strokeWidth)
    .translate(x, y);
  if (opacity !== 1) diagram = diagram.opacity(opacity);
  return diagram;
}

export function makePolygon(points, options = {}) {
  const {
    fill = "none",
    stroke = "#1f2937",
    strokeWidth = 2,
    opacity = 1,
  } = options;
  let diagram = polygon(points.map(asPoint)).fill(fill).stroke(stroke, strokeWidth);
  if (opacity !== 1) diagram = diagram.opacity(opacity);
  return diagram;
}

export function group(items) {
  return stack(items.flat(Infinity).filter(Boolean));
}

export function wedgePoints(center, radius, startAngle, endAngle, segments = 32) {
  center = asPoint(center);
  const sweep = endAngle - startAngle;
  const count = Math.max(2, Math.ceil(Math.abs(sweep) / (Math.PI * 2) * segments));
  const points = [center];
  for (let index = 0; index <= count; index += 1) {
    const angle = startAngle + sweep * (index / count);
    points.push(point(
      center.x + Math.cos(angle) * radius,
      center.y + Math.sin(angle) * radius,
    ));
  }
  return points;
}

export function normalizeSeries(data, defaultPrefix = "Item") {
  if (!Array.isArray(data)) throw new TypeError("Expected an array of values.");
  return data.map((entry, index) => {
    if (typeof entry === "number") {
      return { label: `${defaultPrefix} ${index + 1}`, value: entry };
    }
    if (Array.isArray(entry)) {
      return { label: String(entry[0]), value: finiteNumber(entry[1]) };
    }
    return {
      ...entry,
      label: String(entry?.label ?? entry?.name ?? `${defaultPrefix} ${index + 1}`),
      value: finiteNumber(entry?.value ?? entry?.count ?? entry?.y),
    };
  });
}

export function quantile(sortedValues, probability) {
  if (!sortedValues.length) return NaN;
  const position = (sortedValues.length - 1) * probability;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sortedValues[lower];
  const weight = position - lower;
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}

export { point };
