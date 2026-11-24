import { Point, normalizePoint } from "../core/geometry.js";
import { placeLabels } from "../core/label-placement.js";
import { stack } from "../core/layout.js";
import {
  angleMark,
  parallelMarks,
  rightAngleMark,
  sideTicks,
} from "../core/annotations.js";
import { line, polygon } from "../core/primitives.js";

const TAU = Math.PI * 2;

function positiveNumber(value, fallback, name) {
  const result = value == null ? fallback : Number(value);
  if (!Number.isFinite(result) || result <= 0) {
    throw new RangeError(`${name} must be a positive finite number.`);
  }
  return result;
}

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

function defaultVertexName(index) {
  if (index < 26) return String.fromCharCode(65 + index);
  return `V${index + 1}`;
}

function defaultSideLabel(index) {
  if (index < 26) return String.fromCharCode(97 + index);
  return `s${index + 1}`;
}

function regularPoints(count, radius, rotation) {
  return Array.from({ length: count }, (_, index) => new Point(
    Math.cos(rotation + index * TAU / count) * radius,
    Math.sin(rotation + index * TAU / count) * radius,
  ));
}

function normalizePolygonArguments(input, options) {
  if (Array.isArray(input)) return { points: input.map(normalizePoint), options: options ?? {} };
  if (input && typeof input === "object") {
    const config = input;
    if (config.points != null) {
      if (!Array.isArray(config.points)) throw new TypeError("polygonDiagram points must be an array.");
      return { points: config.points.map(normalizePoint), options: config };
    }
    const sides = Number(config.sides ?? config.count ?? 5);
    return { points: regularPolygonPoints(sides, config), options: config };
  }
  return { points: regularPolygonPoints(input ?? 5, options ?? {}), options: options ?? {} };
}

function regularPolygonPoints(sides, options) {
  if (!Number.isInteger(Number(sides)) || Number(sides) < 3) {
    throw new RangeError("polygonDiagram needs at least three sides.");
  }
  const radius = positiveNumber(options.radius, 130, "polygon radius");
  const rotation = finiteNumber(options.rotation, -Math.PI / 2, "polygon rotation");
  return regularPoints(Number(sides), radius, rotation);
}

function centroid(points) {
  return points.reduce(
    (sum, point) => new Point(sum.x + point.x / points.length, sum.y + point.y / points.length),
    new Point(0, 0),
  );
}

function unit(from, to, fallback = new Point(0, -1)) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  return length > 1e-9 ? new Point(dx / length, dy / length) : fallback;
}

function midpoint(first, second) {
  return new Point((first.x + second.x) / 2, (first.y + second.y) / 2);
}

function radialCandidates(at, direction, offset, step = 12) {
  const normal = unit(new Point(0, 0), direction);
  const tangent = new Point(-normal.y, normal.x);
  const base = new Point(at.x + normal.x * offset, at.y + normal.y * offset);
  const farther = new Point(at.x + normal.x * (offset + step), at.y + normal.y * (offset + step));
  return [
    base,
    farther,
    new Point(base.x + tangent.x * step, base.y + tangent.y * step),
    new Point(base.x - tangent.x * step, base.y - tangent.y * step),
    new Point(farther.x + tangent.x * step, farther.y + tangent.y * step),
    new Point(farther.x - tangent.x * step, farther.y - tangent.y * step),
  ];
}

function labelValues(value, count, names, defaultFactory, defaultEnabled = false) {
  if (value == null) value = defaultEnabled;
  if (value === false) return Array(count).fill(null);
  if (value === true) return Array.from({ length: count }, (_, index) => defaultFactory(index, names[index]));
  if (Array.isArray(value)) return Array.from({ length: count }, (_, index) => value[index] ?? null);
  if (value && typeof value === "object" && !value.node) {
    return Array.from({ length: count }, (_, index) => (
      value[index] ?? value[names[index]] ?? null
    ));
  }
  throw new TypeError("Labels must be true, false, an array, or a keyed object.");
}

function sideLabelValues(value, count, names) {
  if (value == null || value === false) return Array(count).fill(null);
  if (value === true) return Array.from({ length: count }, (_, index) => defaultSideLabel(index));
  if (Array.isArray(value)) return Array.from({ length: count }, (_, index) => value[index] ?? null);
  if (value && typeof value === "object" && !value.node) {
    return Array.from({ length: count }, (_, index) => {
      const forward = sideName(names, index);
      const reverse = `${names[(index + 1) % count]}${names[index]}`;
      return value[index] ?? value[forward] ?? value[reverse] ?? null;
    });
  }
  throw new TypeError("Side labels must be true, false, an array, or a keyed object.");
}

function vertexNames(options, count) {
  const supplied = options.vertexNames ?? options.names;
  if (Array.isArray(supplied)) {
    return Array.from({ length: count }, (_, index) => String(supplied[index] ?? defaultVertexName(index)));
  }
  const shownLabels = options.vertexLabels ?? options.labels;
  if (Array.isArray(shownLabels)) {
    return Array.from({ length: count }, (_, index) => (
      typeof shownLabels[index] === "string"
        ? shownLabels[index]
        : defaultVertexName(index)
    ));
  }
  return Array.from({ length: count }, (_, index) => defaultVertexName(index));
}

function sideName(names, index) {
  return `${names[index]}${names[(index + 1) % names.length]}`;
}

function resolveVertexReference(reference, names) {
  if (Number.isInteger(Number(reference)) && String(reference).trim() !== "") {
    const index = Number(reference);
    if (index >= 0 && index < names.length) return index;
  }
  const index = names.indexOf(String(reference));
  if (index >= 0) return index;
  throw new RangeError(`Unknown polygon vertex: ${reference}.`);
}

function resolveSideReference(reference, names) {
  if (Number.isInteger(Number(reference)) && String(reference).trim() !== "") {
    const index = Number(reference);
    if (index >= 0 && index < names.length) return index;
  }
  if (Array.isArray(reference) && reference.length === 2) {
    const first = resolveVertexReference(reference[0], names);
    const second = resolveVertexReference(reference[1], names);
    for (let index = 0; index < names.length; index += 1) {
      const next = (index + 1) % names.length;
      if ((index === first && next === second) || (index === second && next === first)) return index;
    }
  }
  const compact = String(reference).replace(/[\s_-]/g, "");
  for (let index = 0; index < names.length; index += 1) {
    const forward = `${names[index]}${names[(index + 1) % names.length]}`;
    const backward = `${names[(index + 1) % names.length]}${names[index]}`;
    if (compact === forward || compact === backward) return index;
  }
  throw new RangeError(`Unknown polygon side: ${reference}.`);
}

function indexedValue(specification, index, key, reverseKey = null) {
  if (specification == null || specification === false) return null;
  if (specification === true) return true;
  if (Array.isArray(specification)) return specification[index] ?? null;
  if (specification && typeof specification === "object") {
    return specification[index] ?? specification[key] ?? (reverseKey ? specification[reverseKey] : null) ?? null;
  }
  return null;
}

function markOptions(value) {
  if (value === true) return {};
  if (typeof value === "number") return { count: value };
  if (typeof value === "string" && value !== "right") return { label: value };
  if (value && typeof value === "object") return value;
  return null;
}

function styledLine(start, end, options, defaults) {
  let result = line(start, end).fill("none").stroke(
    options.stroke ?? options.color ?? defaults.stroke,
    options.width ?? options.strokeWidth ?? defaults.width,
  );
  if (options.dash) result = result.dash(options.dash, options.dashOffset ?? 0);
  return result;
}

function normalizeExtensions(value) {
  if (value == null || value === false) return [];
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object" && value.side != null) return [value];
  if (value && typeof value === "object") {
    return Object.entries(value).map(([side, config]) => (
      config && typeof config === "object" ? { side, ...config } : { side, after: config }
    ));
  }
  throw new TypeError("extensions must be an array, an object, or false.");
}

function withAnchors(diagram, anchors) {
  return anchors.reduce((result, entry) => result.withAnchor(entry.name, entry.point), diagram);
}

/**
 * Build a labelled regular or custom polygon using semantic mark descriptions.
 */
export function polygonDiagram(input = 5, options = {}) {
  const normalized = normalizePolygonArguments(input, options);
  const points = normalized.points;
  options = normalized.options;
  if (points.length < 3) throw new RangeError("polygonDiagram needs at least three points.");

  const count = points.length;
  points.forEach((point, index) => {
    const next = points[(index + 1) % count];
    if (point.distanceTo(next) <= 1e-9) {
      throw new RangeError("polygonDiagram needs distinct adjacent points.");
    }
  });
  const names = vertexNames(options, count);
  const center = centroid(points);
  const stroke = options.stroke ?? options.color ?? "#1f2937";
  const strokeWidth = positiveNumber(options.strokeWidth, 2.5, "polygon strokeWidth");
  const layers = [];
  const obstacleSegments = [];
  const anchors = [];
  const labelItems = [];

  let outline = polygon(points)
    .fill(options.fill ?? "none")
    .stroke(stroke, strokeWidth);
  if (options.opacity != null) outline = outline.opacity(options.opacity);
  layers.push(outline);

  const vertexLabels = labelValues(
    options.vertexLabels ?? options.labels,
    count,
    names,
    (_index, name) => name,
    true,
  );
  const sideLabels = sideLabelValues(options.sideLabels, count, names);
  const angleLabels = labelValues(
    options.angleLabels,
    count,
    names,
    (_index, name) => `\u2220${name}`,
  );

  for (let index = 0; index < count; index += 1) {
    const start = points[index];
    const end = points[(index + 1) % count];
    const middle = midpoint(start, end);
    const outward = unit(center, middle);
    const vertexOutward = unit(center, start);
    const name = names[index];
    const edgeName = sideName(names, index);
    const reverseEdgeName = `${names[(index + 1) % count]}${name}`;
    obstacleSegments.push([start, end]);
    anchors.push(
      { name: `vertex${index}`, point: start },
      { name: `side${index}`, point: middle },
      { name, point: start },
    );

    if (vertexLabels[index] != null && vertexLabels[index] !== false) {
      labelItems.push({
        value: vertexLabels[index],
        at: start,
        direction: vertexOutward,
        candidates: radialCandidates(
          start,
          vertexOutward,
          nonNegativeNumber(options.vertexLabelOffset, 25, "vertexLabelOffset"),
        ),
        name: `vertexLabel${index}`,
        fontSize: options.vertexFontSize ?? options.fontSize ?? 18,
        color: options.vertexLabelColor ?? options.labelColor,
        weight: options.labelWeight,
      });
    }

    if (sideLabels[index] != null && sideLabels[index] !== false) {
      labelItems.push({
        value: sideLabels[index],
        at: middle,
        direction: outward,
        candidates: radialCandidates(
          middle,
          outward,
          nonNegativeNumber(options.sideLabelOffset, 24, "sideLabelOffset"),
        ),
        name: `sideLabel${index}`,
        fontSize: options.sideFontSize ?? options.fontSize ?? 18,
        color: options.sideLabelColor ?? options.labelColor,
        weight: options.labelWeight,
      });
    }

    const ticks = markOptions(indexedValue(options.sideMarks, index, edgeName, reverseEdgeName));
    if (ticks) layers.push(sideTicks(start, end, {
      ...ticks,
      color: ticks.color ?? ticks.stroke ?? stroke,
      width: ticks.width ?? options.markWidth ?? 2,
    }));

    const parallels = markOptions(indexedValue(options.parallelMarks, index, edgeName, reverseEdgeName));
    if (parallels) layers.push(parallelMarks(start, end, {
      ...parallels,
      color: parallels.color ?? parallels.stroke ?? stroke,
      width: parallels.width ?? options.markWidth ?? 2,
    }));
  }

  for (let index = 0; index < count; index += 1) {
    const previous = points[(index - 1 + count) % count];
    const vertex = points[index];
    const next = points[(index + 1) % count];
    const name = names[index];
    const markValue = indexedValue(options.angleMarks, index, name);
    const config = markOptions(markValue);
    const isRight = markValue === "right" || config?.type === "right" || config?.right === true;

    if (isRight) {
      layers.push(rightAngleMark(vertex, previous, next, {
        ...config,
        color: config?.color ?? config?.stroke ?? stroke,
        width: config?.width ?? options.markWidth ?? 2,
      }));
    } else if (config) {
      layers.push(angleMark(vertex, previous, next, {
        ...config,
        label: false,
        color: config.color ?? config.stroke ?? stroke,
        width: config.width ?? options.markWidth ?? 2,
      }));
    }

    const labelValue = angleLabels[index] ?? config?.label;
    if (labelValue != null && labelValue !== false) {
      const inward = unit(vertex, center);
      const radius = nonNegativeNumber(
        config?.labelRadius ?? options.angleLabelRadius,
        46,
        "angleLabelRadius",
      );
      labelItems.push({
        value: labelValue,
        at: vertex,
        direction: inward,
        candidates: radialCandidates(vertex, inward, radius, 10),
        name: `angleLabel${index}`,
        fontSize: config?.labelSize ?? options.angleFontSize ?? options.fontSize ?? 18,
        color: config?.labelColor ?? options.angleLabelColor ?? options.labelColor,
        weight: config?.labelWeight ?? options.labelWeight,
      });
    }
  }

  normalizeExtensions(options.extensions).forEach((extension, extensionIndex) => {
    const sideIndex = resolveSideReference(extension.side ?? extension.edge ?? 0, names);
    const start = points[sideIndex];
    const end = points[(sideIndex + 1) % count];
    const direction = unit(start, end);
    const before = nonNegativeNumber(extension.before, 0, "extension before");
    const after = nonNegativeNumber(
      extension.after,
      extension.before == null ? 50 : 0,
      "extension after",
    );
    const extendedStart = new Point(start.x - direction.x * before, start.y - direction.y * before);
    const extendedEnd = new Point(end.x + direction.x * after, end.y + direction.y * after);

    if (before > 0) {
      layers.push(styledLine(extendedStart, start, extension, { stroke, width: strokeWidth }));
      obstacleSegments.push([extendedStart, start]);
    }
    if (after > 0) {
      layers.push(styledLine(end, extendedEnd, extension, { stroke, width: strokeWidth }));
      obstacleSegments.push([end, extendedEnd]);
    }
    anchors.push(
      { name: `extension${extensionIndex}Before`, point: extendedStart },
      { name: `extension${extensionIndex}After`, point: extendedEnd },
    );

    if (extension.beforeLabel != null && extension.beforeLabel !== false) {
      labelItems.push({
        value: extension.beforeLabel,
        at: extendedStart,
        direction: new Point(-direction.x, -direction.y),
        name: `extension${extensionIndex}BeforeLabel`,
        fontSize: extension.fontSize ?? options.vertexFontSize ?? options.fontSize ?? 18,
        color: extension.labelColor ?? options.labelColor,
      });
    }
    if (extension.afterLabel != null && extension.afterLabel !== false) {
      labelItems.push({
        value: extension.afterLabel,
        at: extendedEnd,
        direction,
        name: `extension${extensionIndex}AfterLabel`,
        fontSize: extension.fontSize ?? options.vertexFontSize ?? options.fontSize ?? 18,
        color: extension.labelColor ?? options.labelColor,
      });
    }
  });

  const labelLayer = placeLabels(labelItems, {
    obstacles: obstacleSegments,
    clearance: nonNegativeNumber(options.labelClearance, 4, "labelClearance"),
    color: options.labelColor ?? "#111827",
    weight: options.labelWeight ?? 600,
  });
  layers.push(labelLayer);
  for (const item of labelItems) anchors.push({ name: item.name, point: labelLayer.anchor(item.name) });

  return withAnchors(stack(layers), anchors);
}

function trianglePointsFromLengths(lengths, options) {
  if (!Array.isArray(lengths) || lengths.length !== 3) {
    throw new TypeError("triangleDiagram lengths must be [AB, BC, CA].");
  }
  const [ab, bc, ca] = lengths.map((value, index) => positiveNumber(value, null, `triangle length ${index}`));
  if (ab + bc <= ca || bc + ca <= ab || ca + ab <= bc) {
    throw new RangeError("triangleDiagram lengths must satisfy the triangle inequality.");
  }
  const x = (ca * ca + ab * ab - bc * bc) / (2 * ab);
  const height = Math.sqrt(Math.max(0, ca * ca - x * x));
  const raw = [new Point(0, 0), new Point(ab, 0), new Point(x, -height)];
  const minX = Math.min(...raw.map(point => point.x));
  const maxX = Math.max(...raw.map(point => point.x));
  const minY = Math.min(...raw.map(point => point.y));
  const maxY = Math.max(...raw.map(point => point.y));
  const targetWidth = positiveNumber(options.width, 320, "triangle width");
  const targetHeight = positiveNumber(options.height, 220, "triangle height");
  const scale = Math.min(targetWidth / (maxX - minX), targetHeight / (maxY - minY));
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  return raw.map(point => new Point((point.x - centerX) * scale, (point.y - centerY) * scale));
}

function trianglePresetPoints(layout, options) {
  const width = positiveNumber(options.width, layout === "equilateral" ? 280 : 320, "triangle width");
  if (layout === "equilateral") {
    const height = width * Math.sqrt(3) / 2;
    return [
      new Point(-width / 2, height / 3),
      new Point(width / 2, height / 3),
      new Point(0, -height * 2 / 3),
    ];
  }
  const height = positiveNumber(options.height, 220, "triangle height");
  if (layout === "right") {
    return [
      new Point(-width / 2, height / 2),
      new Point(width / 2, height / 2),
      new Point(-width / 2, -height / 2),
    ];
  }
  const apex = layout === "isosceles" ? 0.5 : finiteNumber(options.apex, 0.62, "triangle apex");
  return [
    new Point(-width / 2, height / 2),
    new Point(width / 2, height / 2),
    new Point((apex - 0.5) * width, -height / 2),
  ];
}

function mergeMarkDefaults(specification, defaults) {
  if (Array.isArray(specification)) {
    const result = [...specification];
    Object.entries(defaults).forEach(([index, value]) => {
      if (result[index] == null) result[index] = value;
    });
    return result;
  }
  return { ...defaults, ...(specification && typeof specification === "object" ? specification : {}) };
}

function inferredLengthMarks(lengths) {
  const sideMarks = {};
  const tolerance = Math.max(...lengths) * 1e-8;
  const groups = [];
  lengths.forEach((length, index) => {
    const group = groups.find(entry => Math.abs(entry.length - length) <= tolerance);
    if (group) group.indices.push(index);
    else groups.push({ length, indices: [index] });
  });
  let tickCount = 1;
  groups.filter(group => group.indices.length > 1).forEach((group) => {
    group.indices.forEach(index => { sideMarks[index] = tickCount; });
    tickCount += 1;
  });

  const squares = lengths.map(value => value * value);
  const angleMarks = {};
  const longest = squares.indexOf(Math.max(...squares));
  const others = squares.filter((_value, index) => index !== longest);
  if (Math.abs(squares[longest] - others[0] - others[1]) <= Math.max(...squares) * 1e-8) {
    const oppositeVertex = [2, 0, 1][longest];
    angleMarks[oppositeVertex] = "right";
  }
  return { sideMarks, angleMarks };
}

/**
 * Build a semantic triangle from a preset, three side lengths, or explicit points.
 */
export function triangleDiagram(options = {}) {
  if (Array.isArray(options)) options = { points: options };
  if (!options || typeof options !== "object") throw new TypeError("triangleDiagram expects an options object.");
  const layout = options.layout ?? options.type ?? "scalene";
  if (!['scalene', 'right', 'isosceles', 'equilateral'].includes(layout)) {
    throw new RangeError(`Unknown triangle layout: ${layout}.`);
  }
  let points;
  if (options.points != null) {
    if (!Array.isArray(options.points) || options.points.length !== 3) {
      throw new TypeError("triangleDiagram points must contain exactly three points.");
    }
    points = options.points.map(normalizePoint);
  } else if (options.lengths != null) {
    points = trianglePointsFromLengths(options.lengths, options);
  } else {
    points = trianglePresetPoints(layout, options);
  }

  const polygonOptions = { ...options, points };
  if (polygonOptions.sideLabels === true) {
    polygonOptions.sideLabels = options.lengths
      ? options.lengths.map(String)
      : ["c", "a", "b"];
  }

  if (options.automaticMarks !== false) {
    let defaults = { sideMarks: {}, angleMarks: {} };
    if (options.lengths != null) defaults = inferredLengthMarks(options.lengths.map(Number));
    else if (layout === "right") defaults.angleMarks[0] = "right";
    else if (layout === "isosceles") defaults.sideMarks = { 1: 1, 2: 1 };
    else if (layout === "equilateral") defaults.sideMarks = { 0: 1, 1: 1, 2: 1 };
    polygonOptions.sideMarks = mergeMarkDefaults(options.sideMarks, defaults.sideMarks);
    polygonOptions.angleMarks = mergeMarkDefaults(options.angleMarks, defaults.angleMarks);
  }
  if (options.rightAngle != null) {
    const names = vertexNames(polygonOptions, 3);
    const index = resolveVertexReference(options.rightAngle, names);
    if (Array.isArray(polygonOptions.angleMarks)) {
      polygonOptions.angleMarks = [...polygonOptions.angleMarks];
      polygonOptions.angleMarks[index] = "right";
    } else {
      polygonOptions.angleMarks = {
        ...(polygonOptions.angleMarks && typeof polygonOptions.angleMarks === "object"
          ? polygonOptions.angleMarks
          : {}),
        [index]: "right",
      };
    }
  }

  return polygonDiagram(polygonOptions);
}
