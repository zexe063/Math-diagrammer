import {
  clamp,
  extent,
  finiteNumber,
  formatNumber,
  group,
  integer,
  makeCircle,
  makeLine,
  makePolyline,
  makeRectangle,
  makeText,
  mapLinear,
  normalizeDomain,
  point,
  positiveNumber,
  tickValues,
} from "./internal.js";

const SERIES_KIND = "math-diagrammer-series";
const DEFAULT_SERIES_COLORS = Object.freeze([
  "#2563eb",
  "#dc2626",
  "#059669",
  "#9333ea",
  "#ea580c",
  "#0891b2",
]);

function normalizeNumberLineArguments(minimum, maximum, options) {
  if (minimum && typeof minimum === "object") {
    const config = minimum;
    return {
      minimum: finiteNumber(config.min ?? config.minimum, -5),
      maximum: finiteNumber(config.max ?? config.maximum, 5),
      options: config,
    };
  }
  return {
    minimum: finiteNumber(minimum, -5),
    maximum: finiteNumber(maximum, 5),
    options: options ?? {},
  };
}

export function numberLine(minimum = -5, maximum = 5, options = {}) {
  ({ minimum, maximum, options } = normalizeNumberLineArguments(minimum, maximum, options));
  [minimum, maximum] = normalizeDomain([minimum, maximum], [-5, 5]);
  const {
    width = 480,
    step,
    tickCount = 10,
    tickSize = 12,
    labels = true,
    labelOffset = 24,
    fontSize = 14,
    color = "#1f2937",
    strokeWidth = 2,
    tickColor = color,
    labelColor = color,
    formatter = formatNumber,
    includeEndTicks = true,
    arrowheads = false,
  } = options;
  const halfWidth = positiveNumber(width, 480) / 2;
  const values = tickValues(minimum, maximum, { step, count: tickCount });
  if (includeEndTicks) {
    if (!values.some((value) => Math.abs(value - minimum) < 1e-9)) values.unshift(minimum);
    if (!values.some((value) => Math.abs(value - maximum) < 1e-9)) values.push(maximum);
  }
  const diagrams = [makeLine([-halfWidth, 0], [halfWidth, 0], { color, width: strokeWidth })];

  if (arrowheads) {
    const arrowSize = Math.max(5, tickSize * 0.55);
    diagrams.push(
      makePolyline([[halfWidth - arrowSize, -arrowSize / 2], [halfWidth, 0], [halfWidth - arrowSize, arrowSize / 2]], { color, width: strokeWidth }),
      makePolyline([[-halfWidth + arrowSize, -arrowSize / 2], [-halfWidth, 0], [-halfWidth + arrowSize, arrowSize / 2]], { color, width: strokeWidth }),
    );
  }

  for (const value of values) {
    const x = mapLinear(value, minimum, maximum, -halfWidth, halfWidth);
    diagrams.push(makeLine([x, -tickSize / 2], [x, tickSize / 2], { color: tickColor, width: strokeWidth }));
    if (labels) diagrams.push(makeText(formatter(value), x, labelOffset, { fontSize, color: labelColor }));
  }
  return group(diagrams);
}

function planeConfig(options = {}) {
  const xDomain = normalizeDomain(
    options.xDomain ?? [options.xMin ?? -5, options.xMax ?? 5],
    [-5, 5],
  );
  const yDomain = normalizeDomain(
    options.yDomain ?? [options.yMin ?? -5, options.yMax ?? 5],
    [-5, 5],
  );
  return {
    ...options,
    xDomain,
    yDomain,
    width: positiveNumber(options.width, 480),
    height: positiveNumber(options.height, 360),
  };
}

export function coordinatePlane(options = {}) {
  const config = planeConfig(options);
  const {
    xDomain,
    yDomain,
    width,
    height,
    xStep,
    yStep,
    tickCount = 10,
    grid = true,
    labels = true,
    ticks = true,
    border = false,
    fontSize = 13,
    tickSize = 8,
    gridColor = "#dbe4f0",
    gridWidth = 1,
    axisColor = "#334155",
    axisWidth = 2,
    labelColor = "#334155",
    formatter = formatNumber,
  } = config;
  const [xMinimum, xMaximum] = xDomain;
  const [yMinimum, yMaximum] = yDomain;
  const xValues = tickValues(xMinimum, xMaximum, { step: xStep, count: tickCount });
  const yValues = tickValues(yMinimum, yMaximum, { step: yStep, count: tickCount });
  const xToScreen = (x) => mapLinear(x, xMinimum, xMaximum, -width / 2, width / 2);
  const yToScreen = (y) => mapLinear(y, yMinimum, yMaximum, height / 2, -height / 2);
  const xAxisY = yMinimum <= 0 && yMaximum >= 0 ? yToScreen(0) : height / 2;
  const yAxisX = xMinimum <= 0 && xMaximum >= 0 ? xToScreen(0) : -width / 2;
  const diagrams = [];

  if (grid) {
    for (const value of xValues) {
      const x = xToScreen(value);
      diagrams.push(makeLine([x, -height / 2], [x, height / 2], { color: gridColor, width: gridWidth }));
    }
    for (const value of yValues) {
      const y = yToScreen(value);
      diagrams.push(makeLine([-width / 2, y], [width / 2, y], { color: gridColor, width: gridWidth }));
    }
  }

  if (border) {
    diagrams.push(
      makeLine([-width / 2, -height / 2], [width / 2, -height / 2], { color: gridColor, width: gridWidth }),
      makeLine([width / 2, -height / 2], [width / 2, height / 2], { color: gridColor, width: gridWidth }),
      makeLine([width / 2, height / 2], [-width / 2, height / 2], { color: gridColor, width: gridWidth }),
      makeLine([-width / 2, height / 2], [-width / 2, -height / 2], { color: gridColor, width: gridWidth }),
    );
  }

  diagrams.push(
    makeLine([-width / 2, xAxisY], [width / 2, xAxisY], { color: axisColor, width: axisWidth }),
    makeLine([yAxisX, -height / 2], [yAxisX, height / 2], { color: axisColor, width: axisWidth }),
  );

  if (ticks || labels) {
    for (const value of xValues) {
      const x = xToScreen(value);
      if (ticks) diagrams.push(makeLine([x, xAxisY - tickSize / 2], [x, xAxisY + tickSize / 2], { color: axisColor, width: axisWidth }));
      if (labels && Math.abs(value) > 1e-9) {
        const labelY = clamp(xAxisY + tickSize + fontSize * 0.65, -height / 2 + fontSize, height / 2 + fontSize);
        diagrams.push(makeText(formatter(value), x, labelY, { fontSize, color: labelColor }));
      }
    }
    for (const value of yValues) {
      const y = yToScreen(value);
      if (ticks) diagrams.push(makeLine([yAxisX - tickSize / 2, y], [yAxisX + tickSize / 2, y], { color: axisColor, width: axisWidth }));
      if (labels && Math.abs(value) > 1e-9) {
        const labelX = clamp(yAxisX - tickSize - fontSize, -width / 2 - fontSize, width / 2 - fontSize);
        diagrams.push(makeText(formatter(value), labelX, y, { fontSize, color: labelColor }));
      }
    }
  }
  return group(diagrams);
}

export function axes(options = {}) {
  return coordinatePlane({ grid: false, ...options });
}

function sampleCurveAt(sample, parameters, project, jumpThreshold) {
  const paths = [];
  let current = [];
  let previous = null;
  for (const parameter of parameters) {
    let value;
    try {
      value = sample(parameter);
    } catch {
      value = null;
    }
    const projected = value == null ? null : project(parameter, value);
    const valid = projected && Number.isFinite(projected.x) && Number.isFinite(projected.y);
    const jumps = valid && previous && Math.hypot(projected.x - previous.x, projected.y - previous.y) > jumpThreshold;
    if (!valid || jumps) {
      if (current.length > 1) paths.push(current);
      current = [];
      previous = null;
      if (!valid) continue;
    }
    current.push(projected);
    previous = projected;
  }
  if (current.length > 1) paths.push(current);
  return paths;
}

function sampleCurve(sample, minimum, maximum, count, project, jumpThreshold) {
  const parameters = Array.from(
    { length: count + 1 },
    (_, index) => minimum + (maximum - minimum) * (index / count),
  );
  return sampleCurveAt(sample, parameters, project, jumpThreshold);
}

function normalizeSpikePeak(entry, index, defaultSpread) {
  let center;
  let amplitude;
  let spread;

  if (typeof entry === "number") {
    center = index;
    amplitude = entry;
    spread = defaultSpread;
  } else if (Array.isArray(entry)) {
    [center, amplitude, spread = defaultSpread] = entry;
  } else if (entry && typeof entry === "object") {
    center = entry.x ?? entry.center ?? index;
    amplitude = entry.height ?? entry.amplitude ?? entry.value ?? entry.y;
    spread = entry.spread ?? entry.width ?? defaultSpread;
  } else {
    throw new TypeError(`spikeSeries peak ${index} must be a number, array, or object.`);
  }

  center = Number(center);
  amplitude = Number(amplitude);
  spread = Number(spread);
  if (!Number.isFinite(center) || !Number.isFinite(amplitude)) {
    throw new TypeError(`spikeSeries peak ${index} needs finite x and height values.`);
  }
  if (!Number.isFinite(spread) || spread <= 0) {
    throw new RangeError(`spikeSeries peak ${index} needs a positive spread.`);
  }
  return Object.freeze({ x: center, height: amplitude, spread });
}

function spikeExtent(peaks, tail) {
  return [
    Math.min(...peaks.map((peak) => peak.x - peak.spread * tail)),
    Math.max(...peaks.map((peak) => peak.x + peak.spread * tail)),
  ];
}

/**
 * Describes a smooth series made from Gaussian peaks. Pass the result to plot().
 */
export function spikeSeries(peaks, options = {}) {
  if (!Array.isArray(peaks) || peaks.length === 0) {
    throw new TypeError("spikeSeries expects a non-empty array of peaks.");
  }
  const defaultSpread = positiveNumber(options.spread, 0.2);
  const normalizedPeaks = Object.freeze(
    peaks.map((entry, index) => normalizeSpikePeak(entry, index, defaultSpread)),
  );
  const baseline = finiteNumber(options.baseline, 0);
  const tail = positiveNumber(options.tail, 3.5);
  const xExtent = spikeExtent(normalizedPeaks, tail);
  const requestedDomain = options.domain ?? options.xDomain;
  const hasEndpoint = options.start !== undefined || options.end !== undefined;
  const domain = requestedDomain || hasEndpoint
    ? normalizeDomain(
      requestedDomain ?? [options.start ?? xExtent[0], options.end ?? xExtent[1]],
      xExtent,
    )
    : null;

  const valueAt = (x) => {
    x = Number(x);
    if (!Number.isFinite(x)) return NaN;
    if (domain && (x < domain[0] || x > domain[1])) return NaN;
    return normalizedPeaks.reduce((value, peak) => (
      value + peak.height * Math.exp(-(((x - peak.x) / peak.spread) ** 2))
    ), baseline);
  };

  return Object.freeze({
    kind: SERIES_KIND,
    type: "spike",
    peaks: normalizedPeaks,
    baseline,
    tail,
    domain: domain ? Object.freeze([...domain]) : null,
    xExtent: Object.freeze(domain ? [...domain] : xExtent),
    valueAt,
    color: options.color ?? null,
    strokeWidth: positiveNumber(options.strokeWidth, 3),
    opacity: clamp(finiteNumber(options.opacity, 1), 0, 1),
    samples: integer(options.samples, Math.max(320, normalizedPeaks.length * 90), 2),
    jumpThreshold: options.jumpThreshold,
    dash: Array.isArray(options.dash) ? Object.freeze([...options.dash]) : null,
  });
}

export function functionPlot(fn, options = {}) {
  if (typeof fn !== "function") throw new TypeError("functionPlot expects a function.");
  const config = planeConfig(options);
  const {
    xDomain,
    yDomain,
    width,
    height,
    samples = 320,
    color = "#2563eb",
    strokeWidth = 3,
    showAxes = true,
    plane = {},
    jumpThreshold = Math.max(width, height) * 0.5,
  } = config;
  const [xMinimum, xMaximum] = xDomain;
  const [yMinimum, yMaximum] = yDomain;
  const project = (x, y) => point(
    mapLinear(x, xMinimum, xMaximum, -width / 2, width / 2),
    mapLinear(Number(y), yMinimum, yMaximum, height / 2, -height / 2),
  );
  const paths = sampleCurve(fn, xMinimum, xMaximum, integer(samples, 320, 2), project, jumpThreshold)
    .map((points) => makePolyline(points, { color, width: strokeWidth }));
  return group([
    showAxes ? coordinatePlane({ ...config, ...plane }) : null,
    paths,
  ]);
}

function normalizeParametricArguments(curveOrX, yOrOptions, maybeOptions) {
  if (typeof yOrOptions === "function") {
    return {
      curve: (t) => [curveOrX(t), yOrOptions(t)],
      options: maybeOptions ?? {},
    };
  }
  return { curve: curveOrX, options: yOrOptions ?? {} };
}

export function parametricPlot(curveOrX, yOrOptions = {}, maybeOptions = {}) {
  const { curve, options } = normalizeParametricArguments(curveOrX, yOrOptions, maybeOptions);
  if (typeof curve !== "function") throw new TypeError("parametricPlot expects a curve function.");
  const config = planeConfig(options);
  const {
    xDomain,
    yDomain,
    width,
    height,
    tDomain = [options.tMin ?? 0, options.tMax ?? Math.PI * 2],
    samples = 400,
    color = "#7c3aed",
    strokeWidth = 3,
    showAxes = true,
    plane = {},
    jumpThreshold = Math.max(width, height) * 0.5,
  } = config;
  const [tMinimum, tMaximum] = normalizeDomain(tDomain, [0, Math.PI * 2]);
  const [xMinimum, xMaximum] = xDomain;
  const [yMinimum, yMaximum] = yDomain;
  const project = (_t, value) => {
    const raw = Array.isArray(value) ? value : [value?.x, value?.y];
    return point(
      mapLinear(Number(raw[0]), xMinimum, xMaximum, -width / 2, width / 2),
      mapLinear(Number(raw[1]), yMinimum, yMaximum, height / 2, -height / 2),
    );
  };
  const paths = sampleCurve(curve, tMinimum, tMaximum, integer(samples, 400, 2), project, jumpThreshold)
    .map((points) => makePolyline(points, { color, width: strokeWidth }));
  return group([
    showAxes ? coordinatePlane({ ...config, ...plane }) : null,
    paths,
  ]);
}

export function scatterPlot(data, options = {}) {
  if (!Array.isArray(data)) throw new TypeError("scatterPlot expects an array of points.");
  const points = data.map((entry) => {
    if (Array.isArray(entry)) return { x: Number(entry[0]), y: Number(entry[1]), raw: entry };
    return { x: Number(entry?.x), y: Number(entry?.y), raw: entry };
  }).filter((entry) => Number.isFinite(entry.x) && Number.isFinite(entry.y));
  const xDomain = options.xDomain ?? extent(points.map((entry) => entry.x), [0, 1], 0.08);
  const yDomain = options.yDomain ?? extent(points.map((entry) => entry.y), [0, 1], 0.08);
  const config = planeConfig({ ...options, xDomain, yDomain });
  const {
    width,
    height,
    radius = 5,
    color = "#2563eb",
    opacity = 0.85,
    showAxes = true,
    plane = {},
    colorAccessor,
    radiusAccessor,
  } = config;
  const [xMinimum, xMaximum] = config.xDomain;
  const [yMinimum, yMaximum] = config.yDomain;
  const dots = points.map((entry, index) => makeCircle(
    positiveNumber(radiusAccessor?.(entry.raw, index) ?? radius, radius),
    mapLinear(entry.x, xMinimum, xMaximum, -width / 2, width / 2),
    mapLinear(entry.y, yMinimum, yMaximum, height / 2, -height / 2),
    {
      fill: colorAccessor?.(entry.raw, index) ?? entry.raw?.color ?? color,
      stroke: "none",
      strokeWidth: 0,
      opacity,
    },
  ));
  return group([showAxes ? coordinatePlane({ ...config, ...plane }) : null, dots]);
}

function normalizePlotArguments(series, options) {
  if (
    series
    && typeof series === "object"
    && !Array.isArray(series)
    && series.kind !== SERIES_KIND
    && Object.hasOwn(series, "series")
  ) {
    return { series: series.series, options: series };
  }
  return { series, options: options ?? {} };
}

function normalizePlotSeries(series) {
  const entries = Array.isArray(series) ? series : [series];
  if (!entries.length) throw new TypeError("plot expects at least one series.");
  return entries.map((entry, index) => {
    if (typeof entry === "function") {
      return Object.freeze({
        kind: SERIES_KIND,
        type: "function",
        valueAt: entry,
        xExtent: null,
      });
    }
    if (entry?.kind === SERIES_KIND && typeof entry.valueAt === "function") return entry;
    throw new TypeError(`plot series ${index} must be a function or a series helper result.`);
  });
}

function paddedExtent(values, fallback, padding, includeZero) {
  const finite = values.map(Number).filter(Number.isFinite);
  if (!finite.length) return normalizeDomain(fallback, fallback);
  let minimum = Math.min(...finite);
  let maximum = Math.max(...finite);
  if (includeZero) {
    minimum = Math.min(0, minimum);
    maximum = Math.max(0, maximum);
  }
  [minimum, maximum] = normalizeDomain([minimum, maximum], fallback);
  const amount = (maximum - minimum) * padding;
  if (includeZero && minimum >= 0) return [0, maximum + amount];
  if (includeZero && maximum <= 0) return [minimum - amount, 0];
  return [minimum - amount, maximum + amount];
}

function sampleSeriesValues(series, xDomain, count) {
  const values = [];
  for (const descriptor of series) {
    const minimum = Math.max(xDomain[0], descriptor.domain?.[0] ?? xDomain[0]);
    const maximum = Math.min(xDomain[1], descriptor.domain?.[1] ?? xDomain[1]);
    if (minimum > maximum) continue;
    const semanticSamples = descriptor.type === "spike"
      ? descriptor.peaks.flatMap((peak) => [-2, -1, -0.5, 0, 0.5, 1, 2]
        .map((offset) => peak.x + peak.spread * offset))
      : [];
    for (const x of semanticSamples) {
      if (x < minimum || x > maximum) continue;
      const value = Number(descriptor.valueAt(x));
      if (Number.isFinite(value)) values.push(value);
    }
    for (let index = 0; index <= count; index += 1) {
      const x = minimum + (maximum - minimum) * (index / count);
      try {
        const value = Number(descriptor.valueAt(x));
        if (Number.isFinite(value)) values.push(value);
      } catch {
        // A failed sample creates a gap, just like functionPlot().
      }
    }
  }
  return values;
}

function plotDomain(series, options) {
  const domainPadding = Math.max(0, finiteNumber(options.domainPadding, 0.06));
  const xOptions = options.x && typeof options.x === "object" ? options.x : {};
  const yOptions = options.y && typeof options.y === "object" ? options.y : {};
  const requestedX = xOptions.domain ?? options.xDomain
    ?? (options.xMin !== undefined || options.xMax !== undefined
      ? [options.xMin ?? -5, options.xMax ?? 5]
      : null);
  const extents = series.flatMap((descriptor) => descriptor.xExtent ?? [-5, 5]);
  const xDomain = requestedX
    ? normalizeDomain(requestedX, [-5, 5])
    : extents.length
      ? paddedExtent(extents, [-5, 5], domainPadding, false)
      : [-5, 5];

  const requestedY = yOptions.domain ?? options.yDomain
    ?? (options.yMin !== undefined || options.yMax !== undefined
      ? [options.yMin ?? -5, options.yMax ?? 5]
      : null);
  if (requestedY) return { xDomain, yDomain: normalizeDomain(requestedY, [-5, 5]) };

  const sampleCount = integer(options.domainSamples, 480, 20);
  const values = sampleSeriesValues(series, xDomain, sampleCount);
  const includeZero = options.includeZero ?? series.some((descriptor) => descriptor.type === "spike");
  return {
    xDomain,
    yDomain: paddedExtent(values, [-1, 1], domainPadding, includeZero),
  };
}

function axisCaption(options, axis) {
  const descriptor = options[axis] && typeof options[axis] === "object" ? options[axis] : {};
  const label = descriptor.label ?? options[`${axis}Label`];
  const unit = descriptor.unit ?? options[`${axis}Unit`] ?? options.units?.[axis];
  if (label != null && unit != null) return `${label} (${unit})`;
  if (label != null) return String(label);
  if (unit != null) return String(unit);
  return "";
}

function plotPadding(diagram, padding) {
  if (padding && typeof padding === "object") {
    const horizontal = Math.max(0, finiteNumber(padding.x ?? padding.horizontal, 0));
    const vertical = Math.max(0, finiteNumber(padding.y ?? padding.vertical, horizontal));
    return diagram.pad(horizontal, vertical);
  }
  const amount = Math.max(0, finiteNumber(padding, 0));
  return amount ? diagram.pad(amount) : diagram;
}

function renderPlotSeries(descriptor, options) {
  if (descriptor.type !== "spike") {
    return functionPlot(descriptor.valueAt, { ...options, showAxes: false });
  }

  const {
    xDomain,
    yDomain,
    width,
    height,
    samples,
    color,
    strokeWidth,
    jumpThreshold = Math.max(width, height) * 0.5,
  } = options;
  const [xMinimum, xMaximum] = xDomain;
  const [yMinimum, yMaximum] = yDomain;
  const parameters = Array.from(
    { length: samples + 1 },
    (_, index) => xMinimum + (xMaximum - xMinimum) * (index / samples),
  );
  const localSamples = Math.min(120, Math.max(32, Math.ceil(samples / descriptor.peaks.length / 2)));
  for (const peak of descriptor.peaks) {
    for (let index = 0; index <= localSamples; index += 1) {
      const offset = -descriptor.tail + descriptor.tail * 2 * (index / localSamples);
      parameters.push(peak.x + peak.spread * offset);
    }
    parameters.push(peak.x);
  }
  if (descriptor.domain) parameters.push(...descriptor.domain);
  parameters.sort((a, b) => a - b);
  const uniqueParameters = parameters.filter((value, index) => (
    value >= xMinimum
    && value <= xMaximum
    && (index === 0 || Math.abs(value - parameters[index - 1]) > 1e-12)
  ));
  const project = (x, y) => point(
    mapLinear(x, xMinimum, xMaximum, -width / 2, width / 2),
    mapLinear(Number(y), yMinimum, yMaximum, height / 2, -height / 2),
  );
  const paths = sampleCurveAt(
    descriptor.valueAt,
    uniqueParameters,
    project,
    jumpThreshold,
  ).map((points) => makePolyline(points, { color, width: strokeWidth }));
  return group(paths);
}

/**
 * Builds a complete graph around functions or semantic series descriptors.
 */
export function plot(series, options = {}) {
  ({ series, options } = normalizePlotArguments(series, options));
  const descriptors = normalizePlotSeries(series);
  const { xDomain, yDomain } = plotDomain(descriptors, options);
  const width = positiveNumber(options.width, 520);
  const height = positiveNumber(options.height, 340);
  const palette = Array.isArray(options.palette) && options.palette.length
    ? options.palette
    : DEFAULT_SERIES_COLORS;
  const samples = integer(options.samples, 360, 2);
  const defaultStrokeWidth = positiveNumber(options.strokeWidth, 3);

  const renderedSeries = descriptors.map((descriptor, index) => {
    let diagram = renderPlotSeries(descriptor, {
      xDomain,
      yDomain,
      width,
      height,
      samples: descriptor.samples ?? samples,
      color: descriptor.color ?? options.color ?? palette[index % palette.length],
      strokeWidth: descriptor.strokeWidth ?? defaultStrokeWidth,
      jumpThreshold: descriptor.jumpThreshold ?? options.jumpThreshold,
    });
    if (descriptor.opacity !== undefined && descriptor.opacity !== 1) {
      diagram = diagram.opacity(descriptor.opacity);
    }
    if (descriptor.dash?.length) diagram = diagram.dash(descriptor.dash);
    return diagram;
  });
  const clippingRectangle = makeRectangle(width, height, 0, 0, {
    fill: "#ffffff",
    stroke: "none",
    strokeWidth: 0,
  });
  const curves = group(renderedSeries).clip(clippingRectangle);

  const axesOptions = options.axes && typeof options.axes === "object" ? options.axes : {};
  const planeOptions = options.plane && typeof options.plane === "object" ? options.plane : {};
  const showAxes = options.showAxes !== false && options.axes !== false;
  const plane = showAxes ? coordinatePlane({
    ...options,
    ...planeOptions,
    ...axesOptions,
    xStep: axesOptions.xStep ?? planeOptions.xStep ?? options.x?.step ?? options.xStep,
    yStep: axesOptions.yStep ?? planeOptions.yStep ?? options.y?.step ?? options.yStep,
    xDomain,
    yDomain,
    width,
    height,
  }) : null;

  const labelColor = options.titleColor ?? options.labelColor ?? "#172033";
  const titleSize = positiveNumber(options.titleSize, 22);
  const axisLabelSize = positiveNumber(options.axisLabelSize, 15);
  const titleGap = Math.max(0, finiteNumber(options.titleGap, 16));
  const xLabelGap = Math.max(0, finiteNumber(options.xLabelGap, 30));
  const yLabelGap = Math.max(0, finiteNumber(options.yLabelGap, 36));
  const xCaption = axisCaption(options, "x");
  const yCaption = axisCaption(options, "y");
  const labels = [];

  if (options.title != null && String(options.title)) {
    let title = makeText(options.title, 0, 0, { fontSize: titleSize, color: labelColor })
      .fontWeight(options.titleWeight ?? 700);
    title = title.translate(0, -height / 2 - titleGap - title.height / 2);
    labels.push(title);
  }
  if (xCaption) {
    let label = makeText(xCaption, 0, 0, {
      fontSize: axisLabelSize,
      color: options.axisLabelColor ?? labelColor,
    });
    label = label.translate(0, height / 2 + xLabelGap + label.height / 2);
    labels.push(label);
  }
  if (yCaption) {
    let label = makeText(yCaption, 0, 0, {
      fontSize: axisLabelSize,
      color: options.axisLabelColor ?? labelColor,
    }).rotate(-Math.PI / 2);
    label = label.translate(-width / 2 - yLabelGap - label.width / 2, 0);
    labels.push(label);
  }

  return plotPadding(group([plane, curves, labels]), options.padding);
}
