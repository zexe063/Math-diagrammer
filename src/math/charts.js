import {
  DEFAULT_PALETTE,
  extent,
  finiteNumber,
  formatNumber,
  group,
  integer,
  makeCircle,
  makeLine,
  makeRectangle,
  makeSector,
  makeText,
  mapLinear,
  normalizeDomain,
  normalizeSeries,
  positiveNumber,
  quantile,
  tickValues,
} from "./internal.js";

function chartFrame(options, maximum, minimum = 0) {
  const width = positiveNumber(options.width, 480);
  const height = positiveNumber(options.height, 300);
  const domain = normalizeDomain(options.yDomain ?? [minimum, maximum], [0, 1]);
  const [yMinimum, yMaximum] = domain;
  const y = (value) => mapLinear(value, yMinimum, yMaximum, height / 2, -height / 2);
  return { width, height, y, yMinimum, yMaximum };
}

function yAxis(frame, options = {}) {
  const {
    tickCount = 5,
    grid = true,
    labels = true,
    axisColor = "#334155",
    gridColor = "#dbe4f0",
    fontSize = 12,
    formatter = formatNumber,
  } = options;
  const diagrams = [
    makeLine([-frame.width / 2, -frame.height / 2], [-frame.width / 2, frame.height / 2], { color: axisColor, width: 2 }),
    makeLine([-frame.width / 2, frame.y(0)], [frame.width / 2, frame.y(0)], { color: axisColor, width: 2 }),
  ];
  for (const value of tickValues(frame.yMinimum, frame.yMaximum, tickCount)) {
    const y = frame.y(value);
    if (grid) diagrams.push(makeLine([-frame.width / 2, y], [frame.width / 2, y], { color: gridColor, width: 1 }));
    if (labels) diagrams.push(makeText(formatter(value), -frame.width / 2 - fontSize * 1.7, y, { fontSize, color: axisColor }));
  }
  return diagrams;
}

export function barChart(data, options = {}) {
  const series = normalizeSeries(data);
  const maximum = Math.max(0, ...series.map((entry) => entry.value));
  const minimum = Math.min(0, ...series.map((entry) => entry.value));
  const frame = chartFrame(options, maximum || 1, minimum);
  const {
    gap = 12,
    palette = DEFAULT_PALETTE,
    color = null,
    labels = true,
    values = true,
    fontSize = 12,
    labelOffset = 18,
    stroke = "none",
    strokeWidth = 0,
  } = options;
  const slot = frame.width / Math.max(1, series.length);
  const barWidth = Math.max(1, slot - gap);
  const baseline = frame.y(0);
  const diagrams = [...yAxis(frame, options)];
  series.forEach((entry, index) => {
    const valueY = frame.y(entry.value);
    const height = Math.max(0.001, Math.abs(baseline - valueY));
    const x = -frame.width / 2 + slot * (index + 0.5);
    const y = (baseline + valueY) / 2;
    const fill = entry.color ?? color ?? palette[index % palette.length];
    diagrams.push(makeRectangle(barWidth, height, x, y, { fill, stroke, strokeWidth }));
    if (labels) diagrams.push(makeText(entry.label, x, frame.height / 2 + labelOffset, { fontSize, color: "#334155" }));
    if (values) diagrams.push(makeText(formatNumber(entry.value), x, valueY + (entry.value >= 0 ? -fontSize : fontSize), { fontSize, color: "#334155" }));
  });
  return group(diagrams);
}

function histogramBins(values, binSpec, explicitDomain) {
  const domain = normalizeDomain(explicitDomain ?? extent(values, [0, 1]), [0, 1]);
  const [minimum, maximum] = domain;
  let boundaries;
  if (Array.isArray(binSpec)) {
    boundaries = [...binSpec].map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  } else {
    const count = integer(binSpec, 10, 1);
    boundaries = Array.from({ length: count + 1 }, (_, index) => minimum + (maximum - minimum) * index / count);
  }
  if (boundaries.length < 2) boundaries = [minimum, maximum];
  const bins = Array.from({ length: boundaries.length - 1 }, (_, index) => ({
    min: boundaries[index],
    max: boundaries[index + 1],
    count: 0,
  }));
  for (const value of values) {
    let index = Math.floor((value - boundaries[0]) / (boundaries.at(-1) - boundaries[0]) * bins.length);
    if (value === boundaries.at(-1)) index = bins.length - 1;
    if (index >= 0 && index < bins.length && value >= bins[index].min && value <= bins[index].max) bins[index].count += 1;
  }
  return bins;
}

export function histogram(data, options = {}) {
  if (!Array.isArray(data)) throw new TypeError("histogram expects an array of numbers.");
  const values = data.map(Number).filter(Number.isFinite);
  const bins = histogramBins(values, options.bins ?? 10, options.domain ?? options.xDomain);
  const { formatter, ...chartOptions } = options;
  const series = bins.map((bin) => ({
    label: formatter?.(bin) ?? `${formatNumber(bin.min)}–${formatNumber(bin.max)}`,
    value: bin.count,
  }));
  return barChart(series, {
    gap: options.gap ?? 1,
    values: options.values ?? false,
    color: options.color ?? "#3b82f6",
    ...chartOptions,
  });
}

function normalizeBoxData(data) {
  if (!Array.isArray(data)) throw new TypeError("boxPlot expects an array.");
  if (data.length && Array.isArray(data[0])) {
    return data.map((values, index) => ({ label: `Series ${index + 1}`, values }));
  }
  if (data.length && typeof data[0] === "object" && !Number.isFinite(Number(data[0]))) {
    return data.map((entry, index) => ({
      label: String(entry.label ?? entry.name ?? `Series ${index + 1}`),
      values: entry.values ?? entry.data ?? [],
      color: entry.color,
    }));
  }
  return [{ label: "", values: data }];
}

export function boxPlot(data, options = {}) {
  const series = normalizeBoxData(data).map((entry) => ({
    ...entry,
    values: entry.values.map(Number).filter(Number.isFinite).sort((a, b) => a - b),
  })).filter((entry) => entry.values.length);
  const allValues = series.flatMap((entry) => entry.values);
  const domain = normalizeDomain(options.domain ?? extent(allValues, [0, 1], 0.05), [0, 1]);
  const width = positiveNumber(options.width, 480);
  const rowHeight = positiveNumber(options.rowHeight, 72);
  const boxHeight = positiveNumber(options.boxHeight, 34);
  const palette = options.palette ?? DEFAULT_PALETTE;
  const color = options.color ?? "#2563eb";
  const x = (value) => mapLinear(value, domain[0], domain[1], -width / 2, width / 2);
  const diagrams = [];

  series.forEach((entry, index) => {
    const q1 = quantile(entry.values, 0.25);
    const median = quantile(entry.values, 0.5);
    const q3 = quantile(entry.values, 0.75);
    const iqr = q3 - q1;
    const lowerFence = q1 - iqr * 1.5;
    const upperFence = q3 + iqr * 1.5;
    const whiskerMinimum = entry.values.find((value) => value >= lowerFence) ?? entry.values[0];
    const whiskerMaximum = [...entry.values].reverse().find((value) => value <= upperFence) ?? entry.values.at(-1);
    const outliers = entry.values.filter((value) => value < whiskerMinimum || value > whiskerMaximum);
    const y = (index - (series.length - 1) / 2) * rowHeight;
    const fill = entry.color ?? palette[index % palette.length] ?? color;
    diagrams.push(
      makeLine([x(whiskerMinimum), y], [x(whiskerMaximum), y], { color: "#334155", width: 2 }),
      makeLine([x(whiskerMinimum), y - boxHeight / 3], [x(whiskerMinimum), y + boxHeight / 3], { color: "#334155", width: 2 }),
      makeLine([x(whiskerMaximum), y - boxHeight / 3], [x(whiskerMaximum), y + boxHeight / 3], { color: "#334155", width: 2 }),
      makeRectangle(x(q3) - x(q1), boxHeight, (x(q1) + x(q3)) / 2, y, { fill, stroke: "#334155", strokeWidth: 2, opacity: 0.55 }),
      makeLine([x(median), y - boxHeight / 2], [x(median), y + boxHeight / 2], { color: "#0f172a", width: 3 }),
      outliers.map((value) => makeCircle(4, x(value), y, { fill: "#fff", stroke: "#334155", strokeWidth: 2 })),
      entry.label ? makeText(entry.label, -width / 2 - 44, y, { fontSize: 13, color: "#334155" }) : null,
    );
  });

  const axisY = series.length * rowHeight / 2;
  diagrams.push(makeLine([-width / 2, axisY], [width / 2, axisY], { color: "#334155", width: 2 }));
  for (const value of tickValues(domain[0], domain[1], options.tickCount ?? 6)) {
    const px = x(value);
    diagrams.push(
      makeLine([px, axisY - 4], [px, axisY + 4], { color: "#334155", width: 2 }),
      makeText(formatNumber(value), px, axisY + 18, { fontSize: 12, color: "#334155" }),
    );
  }
  return group(diagrams);
}

export function pieChart(data, options = {}) {
  const series = normalizeSeries(data).filter((entry) => entry.value > 0);
  const total = series.reduce((sum, entry) => sum + entry.value, 0);
  if (!(total > 0)) throw new RangeError("pieChart needs at least one positive value.");
  const {
    radius = 100,
    palette = DEFAULT_PALETTE,
    startAngle = -Math.PI / 2,
    stroke = "#ffffff",
    strokeWidth = 2,
    labels = true,
    labelRadius = radius * 0.64,
    fontSize = 12,
    formatter = (entry) => entry.label,
  } = options;
  const diagrams = [];
  let angle = startAngle;
  series.forEach((entry, index) => {
    const sweep = Math.PI * 2 * entry.value / total;
    const fill = entry.color ?? palette[index % palette.length];
    diagrams.push(series.length === 1
      ? makeCircle(radius, 0, 0, { fill, stroke, strokeWidth })
      : makeSector(radius, angle, angle + sweep, 0, 0, { fill, stroke, strokeWidth }));
    if (labels) {
      const middle = angle + sweep / 2;
      diagrams.push(makeText(
        formatter(entry, entry.value / total),
        Math.cos(middle) * labelRadius,
        Math.sin(middle) * labelRadius,
        { fontSize, color: options.labelColor ?? "#ffffff" },
      ));
    }
    angle += sweep;
  });
  if (positiveNumber(options.innerRadius, 0) > 0) {
    diagrams.push(makeCircle(options.innerRadius, 0, 0, { fill: options.holeColor ?? "#ffffff", stroke: "none", strokeWidth: 0 }));
  }
  return group(diagrams);
}
