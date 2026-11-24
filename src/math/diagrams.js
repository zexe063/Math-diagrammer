import {
  DEFAULT_PALETTE,
  finiteNumber,
  group,
  integer,
  makeCircle,
  makeLine,
  makePolygon,
  makePolyline,
  makeText,
  point,
  positiveNumber,
} from "./internal.js";

export function vennDiagram(sets = ["A", "B"], options = {}) {
  if (sets && !Array.isArray(sets) && typeof sets === "object") {
    options = sets;
    sets = options.sets ?? ["A", "B"];
  }
  const normalized = sets.slice(0, 3).map((entry, index) => (
    typeof entry === "string"
      ? { label: entry, color: null }
      : { ...entry, label: String(entry?.label ?? entry?.name ?? String.fromCharCode(65 + index)) }
  ));
  if (normalized.length < 2) throw new RangeError("vennDiagram needs two or three sets.");
  const radius = positiveNumber(options.radius, 82);
  const separation = finiteNumber(options.separation, radius * 0.9);
  const palette = options.palette ?? DEFAULT_PALETTE;
  const opacity = options.opacity ?? 0.45;
  const positions = normalized.length === 2
    ? [[-separation / 2, 0], [separation / 2, 0]]
    : [[-separation / 2, separation * 0.22], [separation / 2, separation * 0.22], [0, -separation * 0.52]];
  const diagrams = normalized.flatMap((entry, index) => {
    const [x, y] = positions[index];
    const fill = entry.color ?? palette[index % palette.length];
    return [
      makeCircle(radius, x, y, { fill, stroke: fill, strokeWidth: 2, opacity }),
      makeText(entry.label, x + (index === 0 ? -radius * 0.52 : index === 1 ? radius * 0.52 : 0), y - radius * 0.56, {
        fontSize: options.fontSize ?? 16,
        color: options.labelColor ?? "#0f172a",
      }),
    ];
  });
  if (options.centerLabel) diagrams.push(makeText(options.centerLabel, 0, normalized.length === 3 ? 0 : 0, { fontSize: options.fontSize ?? 16 }));
  return group(diagrams);
}

function normalizeTree(tree) {
  if (Array.isArray(tree)) return { label: "", children: tree };
  if (!tree || typeof tree !== "object") throw new TypeError("probabilityTree expects a tree object or branch array.");
  return tree;
}

function childNodes(node) {
  return node.children ?? node.branches ?? [];
}

function layoutTree(root, rowGap, columnGap) {
  const nodes = [];
  const edges = [];
  let leafIndex = 0;
  let maximumDepth = 0;

  function visit(node, depth, parent = null) {
    maximumDepth = Math.max(maximumDepth, depth);
    const children = childNodes(node);
    const record = { node, depth, x: depth * columnGap, y: 0 };
    nodes.push(record);
    if (!children.length) {
      record.y = leafIndex * rowGap;
      leafIndex += 1;
    } else {
      const childRecords = children.map((child) => visit(child, depth + 1, record));
      record.y = childRecords.reduce((sum, child) => sum + child.y, 0) / childRecords.length;
    }
    if (parent) edges.push({ from: parent, to: record });
    return record;
  }

  visit(root, 0);
  const height = Math.max(0, (leafIndex - 1) * rowGap);
  for (const node of nodes) node.y -= height / 2;
  return { nodes, edges, width: maximumDepth * columnGap, height };
}

export function probabilityTree(tree, options = {}) {
  const root = normalizeTree(tree);
  const rowGap = positiveNumber(options.rowGap, 72);
  const columnGap = positiveNumber(options.columnGap, 150);
  const layout = layoutTree(root, rowGap, columnGap);
  const offsetX = -layout.width / 2;
  const diagrams = [];
  const edgeColor = options.edgeColor ?? "#64748b";
  const nodeColor = options.nodeColor ?? "#2563eb";

  for (const edge of layout.edges) {
    const x1 = edge.from.x + offsetX;
    const y1 = edge.from.y;
    const x2 = edge.to.x + offsetX;
    const y2 = edge.to.y;
    diagrams.push(makeLine([x1, y1], [x2, y2], { color: edgeColor, width: options.strokeWidth ?? 2 }));
    const probability = edge.to.node.probability ?? edge.to.node.p ?? edge.to.node.weight;
    const edgeLabel = edge.to.node.edgeLabel ?? probability;
    if (edgeLabel != null) {
      diagrams.push(makeText(edgeLabel, (x1 + x2) / 2, (y1 + y2) / 2 - 11, {
        fontSize: options.probabilityFontSize ?? 12,
        color: options.probabilityColor ?? "#475569",
      }));
    }
  }
  for (const record of layout.nodes) {
    const x = record.x + offsetX;
    const y = record.y;
    if (options.nodes !== false) diagrams.push(makeCircle(options.nodeRadius ?? 5, x, y, { fill: record.node.color ?? nodeColor, stroke: "none", strokeWidth: 0 }));
    const label = record.node.label ?? record.node.name ?? record.node.outcome;
    if (label != null && String(label)) diagrams.push(makeText(label, x, y - (options.labelOffset ?? 18), { fontSize: options.fontSize ?? 14, color: options.labelColor ?? "#0f172a" }));
  }
  return group(diagrams);
}

function rightTriangleArguments(a, b, options) {
  if (a && typeof a === "object") {
    return {
      a: positiveNumber(a.a ?? a.base, 3),
      b: positiveNumber(a.b ?? a.height, 4),
      options: a,
    };
  }
  return { a: positiveNumber(a, 3), b: positiveNumber(b, 4), options: options ?? {} };
}

export function rightTriangle(a = 3, b = 4, options = {}) {
  ({ a, b, options } = rightTriangleArguments(a, b, options));
  const scale = positiveNumber(options.scale, 42);
  const width = a * scale;
  const height = b * scale;
  const A = point(-width / 2, height / 2);
  const B = point(width / 2, height / 2);
  const C = point(-width / 2, -height / 2);
  const diagrams = [makePolygon([A, B, C], {
    fill: options.fill ?? "#dbeafe",
    stroke: options.stroke ?? "#1e40af",
    strokeWidth: options.strokeWidth ?? 3,
    opacity: options.opacity ?? 1,
  })];
  const marker = Math.min(24, width * 0.16, height * 0.16);
  diagrams.push(makeLine([A.x + marker, A.y], [A.x + marker, A.y - marker], { color: options.stroke ?? "#1e40af", width: 2 }));
  diagrams.push(makeLine([A.x + marker, A.y - marker], [A.x, A.y - marker], { color: options.stroke ?? "#1e40af", width: 2 }));
  if (options.labels !== false) {
    const c = Math.hypot(a, b);
    diagrams.push(
      makeText(options.aLabel ?? String(a), 0, A.y + 20, { fontSize: options.fontSize ?? 16 }),
      makeText(options.bLabel ?? String(b), A.x - 20, 0, { fontSize: options.fontSize ?? 16 }),
      makeText(options.cLabel ?? Number(c.toFixed(4)).toString(), 8, -8, { fontSize: options.fontSize ?? 16, rotate: Math.atan2(height, width) }),
    );
  }
  return group(diagrams);
}

function outsideSquare(p, q, opposite) {
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const candidates = [point(-dy, dx), point(dy, -dx)];
  const midpoint = point((p.x + q.x) / 2, (p.y + q.y) / 2);
  const vector = candidates.reduce((best, candidate) => {
    const bestDistance = Math.hypot(midpoint.x + best.x - opposite.x, midpoint.y + best.y - opposite.y);
    const distance = Math.hypot(midpoint.x + candidate.x - opposite.x, midpoint.y + candidate.y - opposite.y);
    return distance > bestDistance ? candidate : best;
  });
  return [p, q, point(q.x + vector.x, q.y + vector.y), point(p.x + vector.x, p.y + vector.y)];
}

export function pythagoras(a = 3, b = 4, options = {}) {
  ({ a, b, options } = rightTriangleArguments(a, b, options));
  const scale = positiveNumber(options.scale, 36);
  const width = a * scale;
  const height = b * scale;
  const A = point(-width / 2, height / 2);
  const B = point(width / 2, height / 2);
  const C = point(-width / 2, -height / 2);
  const palette = options.palette ?? ["#60a5fa", "#34d399", "#fbbf24"];
  const squares = [
    { points: outsideSquare(A, B, C), label: options.aSquareLabel ?? "a²", color: palette[0] },
    { points: outsideSquare(C, A, B), label: options.bSquareLabel ?? "b²", color: palette[1] },
    { points: outsideSquare(B, C, A), label: options.cSquareLabel ?? "c²", color: palette[2] },
  ];
  const diagrams = squares.flatMap((square) => {
    const center = square.points.reduce((sum, p) => point(sum.x + p.x / 4, sum.y + p.y / 4), point(0, 0));
    return [
      makePolygon(square.points, { fill: square.color, stroke: options.stroke ?? "#334155", strokeWidth: 2, opacity: options.squareOpacity ?? 0.55 }),
      options.labels === false ? null : makeText(square.label, center.x, center.y, { fontSize: options.fontSize ?? 20, color: "#0f172a" }),
    ];
  });
  diagrams.push(makePolygon([A, B, C], { fill: options.triangleFill ?? "#ffffff", stroke: options.stroke ?? "#334155", strokeWidth: options.strokeWidth ?? 3 }));
  return group(diagrams);
}

export const pythagoreanDiagram = pythagoras;
export const pythagorasDiagram = pythagoras;
export const pythagoreanTheorem = pythagoras;

export function spiral(turns = 4, options = {}) {
  if (turns && typeof turns === "object") {
    options = turns;
    turns = options.turns ?? 4;
  }
  turns = positiveNumber(turns, 4);
  const samples = integer(options.samples, Math.ceil(turns * 100), 8);
  const startRadius = finiteNumber(options.startRadius, 0);
  const endRadius = positiveNumber(options.endRadius ?? options.radius, 120);
  const startAngle = finiteNumber(options.startAngle, 0);
  const direction = options.clockwise === false ? -1 : 1;
  const growth = options.growth ?? "linear";
  const points = [];
  for (let index = 0; index <= samples; index += 1) {
    const t = index / samples;
    const angle = startAngle + direction * turns * Math.PI * 2 * t;
    const radius = typeof growth === "function"
      ? finiteNumber(growth(t, angle), startRadius)
      : growth === "exponential"
        ? startRadius + (endRadius - startRadius) * ((Math.exp(t) - 1) / (Math.E - 1))
        : startRadius + (endRadius - startRadius) * t;
    points.push(point(Math.cos(angle) * radius, Math.sin(angle) * radius));
  }
  return makePolyline(points, {
    color: options.color ?? "#7c3aed",
    width: options.strokeWidth ?? 3,
  });
}

export function sierpinski(depth = 4, options = {}) {
  if (depth && typeof depth === "object") {
    options = depth;
    depth = options.depth ?? 4;
  }
  depth = integer(depth, 4, 0);
  const size = positiveNumber(options.size, 320);
  const height = size * Math.sqrt(3) / 2;
  const top = point(0, -height * 2 / 3);
  const left = point(-size / 2, height / 3);
  const right = point(size / 2, height / 3);
  const triangles = [];
  const palette = options.palette ?? [options.fill ?? "#2563eb"];

  function recurse(a, b, c, level, branch = 0) {
    if (level === 0) {
      triangles.push(makePolygon([a, b, c], {
        fill: palette[branch % palette.length],
        stroke: options.stroke ?? "none",
        strokeWidth: options.strokeWidth ?? 0,
      }));
      return;
    }
    const ab = point((a.x + b.x) / 2, (a.y + b.y) / 2);
    const bc = point((b.x + c.x) / 2, (b.y + c.y) / 2);
    const ca = point((c.x + a.x) / 2, (c.y + a.y) / 2);
    recurse(a, ab, ca, level - 1, branch * 3);
    recurse(ab, b, bc, level - 1, branch * 3 + 1);
    recurse(ca, bc, c, level - 1, branch * 3 + 2);
  }
  recurse(top, left, right, depth);
  return group(triangles);
}
