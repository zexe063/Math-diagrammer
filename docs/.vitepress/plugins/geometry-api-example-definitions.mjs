import {
  arrow,
  column,
  dot,
  label,
  line,
  place,
  polygon,
  polyline,
  rectangle,
  stack,
} from "../../../src/index.js";
import {
  ArcSegment,
  Bounds as GeometryBounds,
  CubicSegment,
  LineSegment,
  Matrix as GeometryMatrix,
  Point as GeometryPoint,
  QuadraticSegment,
  Vector as GeometryVector,
  clamp,
  lerp,
  normalizeAngle,
  pathBounds,
  svgArcToCenter,
} from "../../../src/geometry/index.js";

const blue = "#075dcc";
const cyan = "#0891b2";
const green = "#15803d";
const orange = "#c2410c";
const pink = "#be185d";
const purple = "#6d28d9";
const red = "#dc2626";
const gray = "#64748b";

function define(id, title, description, source, build, ariaLabel = title) {
  return Object.freeze({
    id,
    title,
    description,
    source: source.trim(),
    build,
    render: Object.freeze({ padding: 30, ariaLabel }),
  });
}

function sample(segment, count = 40) {
  return Array.from({ length: count + 1 }, (_, index) => segment.pointAt(index / count));
}

function boundsOutline(bounds, color = gray) {
  return rectangle(bounds.width, bounds.height)
    .fill("none")
    .stroke(color, 2)
    .dash([8, 6])
    .moveTo(bounds.center.x, bounds.center.y);
}

export const geometryApiExampleDefinitions = Object.freeze([
  define(
    "geometry-numeric-helpers",
    "Numbers become geometry",
    "Clamp keeps a parameter in range, lerp finds an in-between value, and normalizeAngle wraps an angle to one turn.",
    `import { draw, arrow, dot, label, line, place, stack } from "./src/index.js";
import { clamp, lerp, normalizeAngle } from "math-diagrammer/geometry";

const t = clamp(0.62);
const x = lerp(-110, 110, t);
const angle = normalizeAngle(-Math.PI / 3);

draw(stack([
  line([-110, 28], [110, 28]).stroke("#64748b", 4),
  place(dot(10).fill("#dc2626"), [x, 28]),
  label("t = 0.62", [x, 28], { offset: [0, -28], color: "#dc2626" }),
  arrow([0, 28], [Math.cos(angle) * 82, 28 + Math.sin(angle) * 82], {
    color: "#075dcc",
    width: 4,
    headLength: 17
  })
]));`,
    () => {
      const t = clamp(0.62);
      const x = lerp(-110, 110, t);
      const angle = normalizeAngle(-Math.PI / 3);
      return stack([
        line([-110, 28], [110, 28]).stroke(gray, 4),
        place(dot(10).fill(red), [x, 28]),
        label("t = 0.62", [x, 28], { offset: [0, -28], color: red }),
        arrow([0, 28], [Math.cos(angle) * 82, 28 + Math.sin(angle) * 82], {
          color: blue,
          width: 4,
          headLength: 17,
        }),
      ]);
    },
  ),
  define(
    "geometry-point-vector",
    "Move a point with a vector",
    "Point stores a position; Vector stores the movement applied to that position.",
    `import { arrow, dot, label, place, stack, draw } from "./src/index.js";
import { Point, Vector } from "math-diagrammer/geometry";

const start = new Point(-95, 48);
const movement = new Vector(190, -96);
const end = start.add(movement);

draw(stack([
  arrow(start, end, { color: "#6d28d9", width: 5, headLength: 20 }),
  place(dot(9).fill("#dc2626"), start),
  place(dot(9).fill("#075dcc"), end),
  label("start", start, { offset: [-8, 26], color: "#dc2626" }),
  label("end", end, { offset: [0, -25], color: "#075dcc" })
]));`,
    () => {
      const start = new GeometryPoint(-95, 48);
      const movement = new GeometryVector(190, -96);
      const end = start.add(movement);
      return stack([
        arrow(start, end, { color: purple, width: 5, headLength: 20 }),
        place(dot(9).fill(red), start),
        place(dot(9).fill(blue), end),
        label("start", start, { offset: [-8, 26], color: red }),
        label("end", end, { offset: [0, -25], color: blue }),
      ]);
    },
  ),
  define(
    "geometry-matrix-transform",
    "Transform points with a matrix",
    "A matrix can rotate, scale, skew, and translate every point using one immutable value.",
    `import { draw, polygon, stack } from "./src/index.js";
import { Matrix, Point } from "math-diagrammer/geometry";

const source = [
  new Point(-48, -38), new Point(48, -38),
  new Point(48, 38), new Point(-48, 38)
];
const matrix = Matrix.translation(72, 12)
  .multiply(Matrix.rotation(Math.PI / 5));
const transformed = source.map(point => matrix.applyToPoint(point));

draw(stack([
  polygon(source).fill("#dbeafe").stroke("#075dcc", 3),
  polygon(transformed).fill("#fed7aa").stroke("#c2410c", 4)
]));`,
    () => {
      const source = [
        new GeometryPoint(-48, -38), new GeometryPoint(48, -38),
        new GeometryPoint(48, 38), new GeometryPoint(-48, 38),
      ];
      const matrix = GeometryMatrix.translation(72, 12)
        .multiply(GeometryMatrix.rotation(Math.PI / 5));
      const transformed = source.map(point => matrix.applyToPoint(point));
      return stack([
        polygon(source).fill("#dbeafe").stroke(blue, 3),
        polygon(transformed).fill("#fed7aa").stroke(orange, 4),
      ]);
    },
  ),
  define(
    "geometry-bounds",
    "Bounds around a point cloud",
    "Bounds.fromPoints finds the smallest axis-aligned rectangle containing every point.",
    `import { draw, dot, label, place, rectangle, stack } from "./src/index.js";
import { Bounds, Point } from "math-diagrammer/geometry";

const points = [
  new Point(-92, 34), new Point(-38, -58),
  new Point(24, -22), new Point(88, 52), new Point(52, 76)
];
const bounds = Bounds.fromPoints(points).expand(14);

draw(stack([
  rectangle(bounds.width, bounds.height)
    .fill("none").stroke("#0891b2", 3).dash([9, 6])
    .moveTo(bounds.center),
  ...points.map(point => place(dot(8).fill("#dc2626"), point)),
  label("bounds", bounds.anchor("topLeft"), {
    offset: [28, -18], color: "#0891b2"
  })
]));`,
    () => {
      const points = [
        new GeometryPoint(-92, 34), new GeometryPoint(-38, -58),
        new GeometryPoint(24, -22), new GeometryPoint(88, 52), new GeometryPoint(52, 76),
      ];
      const bounds = GeometryBounds.fromPoints(points).expand(14);
      return stack([
        rectangle(bounds.width, bounds.height).fill("none").stroke(cyan, 3).dash([9, 6]).moveTo(bounds.center),
        ...points.map(point => place(dot(8).fill(red), point)),
        label("bounds", bounds.anchor("topLeft"), { offset: [28, -18], color: cyan }),
      ]);
    },
  ),
  define(
    "geometry-line-segment",
    "Sample a line segment",
    "LineSegment can return positions and a unit tangent for any parameter t.",
    `import { arrow, dot, draw, place, stack } from "./src/index.js";
import { LineSegment, Point } from "math-diagrammer/geometry";

const segment = new LineSegment(new Point(-110, 48), new Point(110, -48));
const middle = segment.pointAt(0.5);
const tangent = segment.tangentAt(0.5);

draw(stack([
  arrow(segment.start, segment.end, { color: "#64748b", width: 4 }),
  place(dot(10).fill("#dc2626"), middle),
  arrow(middle, middle.add(tangent.scale(58)), {
    color: "#15803d", width: 4, headLength: 16
  })
]));`,
    () => {
      const segment = new LineSegment(new GeometryPoint(-110, 48), new GeometryPoint(110, -48));
      const middle = segment.pointAt(0.5);
      const tangent = segment.tangentAt(0.5);
      return stack([
        arrow(segment.start, segment.end, { color: gray, width: 4 }),
        place(dot(10).fill(red), middle),
        arrow(middle, middle.add(tangent.scale(58)), { color: green, width: 4, headLength: 16 }),
      ]);
    },
  ),
  define(
    "geometry-bezier-segments",
    "Quadratic and cubic Bézier segments",
    "Control points bend a segment while pointAt samples exact positions on the curve.",
    `import { column, dot, draw, place, polyline, stack } from "./src/index.js";
import { CubicSegment, Point, QuadraticSegment } from "math-diagrammer/geometry";

const sample = segment =>
  Array.from({ length: 41 }, (_, i) => segment.pointAt(i / 40));

const quadratic = new QuadraticSegment(
  new Point(-110, 25), new Point(0, -95), new Point(110, 25)
);
const cubic = new CubicSegment(
  new Point(-110, 20), new Point(-55, -90),
  new Point(55, 90), new Point(110, -20)
);

draw(column(34, [
  stack([
    polyline(sample(quadratic)).fill("none").stroke("#075dcc", 5),
    place(dot(8).fill("#dc2626"), quadratic.control)
  ]),
  stack([
    polyline(sample(cubic)).fill("none").stroke("#be185d", 5),
    place(dot(7).fill("#c2410c"), cubic.control1),
    place(dot(7).fill("#c2410c"), cubic.control2)
  ])
]));`,
    () => {
      const quadratic = new QuadraticSegment(
        new GeometryPoint(-110, 25), new GeometryPoint(0, -95), new GeometryPoint(110, 25),
      );
      const cubic = new CubicSegment(
        new GeometryPoint(-110, 20), new GeometryPoint(-55, -90),
        new GeometryPoint(55, 90), new GeometryPoint(110, -20),
      );
      return column(34, [
        stack([
          polyline(sample(quadratic)).fill("none").stroke(blue, 5),
          place(dot(8).fill(red), quadratic.control),
        ]),
        stack([
          polyline(sample(cubic)).fill("none").stroke(pink, 5),
          place(dot(7).fill(orange), cubic.control1),
          place(dot(7).fill(orange), cubic.control2),
        ]),
      ]);
    },
  ),
  define(
    "geometry-arc-segment",
    "Arc from center parameters",
    "ArcSegment.fromCenter stores an elliptical arc with its center, radii, rotation, and sweep.",
    `import { dot, draw, line, place, polyline, stack } from "./src/index.js";
import { ArcSegment, Point } from "math-diagrammer/geometry";

const arc = ArcSegment.fromCenter(
  new Point(0, 0), 105, 58,
  -Math.PI * 0.8, Math.PI * 1.35, Math.PI / 7
);
const points = Array.from({ length: 61 }, (_, i) => arc.pointAt(i / 60));

draw(stack([
  line(arc.center, arc.start).stroke("#94a3b8", 2).dash([7, 5]),
  line(arc.center, arc.end).stroke("#94a3b8", 2).dash([7, 5]),
  polyline(points).fill("none").stroke("#6d28d9", 7),
  place(dot(8).fill("#dc2626"), arc.center),
  place(dot(7).fill("#075dcc"), arc.start),
  place(dot(7).fill("#15803d"), arc.end)
]));`,
    () => {
      const arc = ArcSegment.fromCenter(
        new GeometryPoint(0, 0), 105, 58,
        -Math.PI * 0.8, Math.PI * 1.35, Math.PI / 7,
      );
      const points = Array.from({ length: 61 }, (_, index) => arc.pointAt(index / 60));
      return stack([
        line(arc.center, arc.start).stroke("#94a3b8", 2).dash([7, 5]),
        line(arc.center, arc.end).stroke("#94a3b8", 2).dash([7, 5]),
        polyline(points).fill("none").stroke(purple, 7),
        place(dot(8).fill(red), arc.center),
        place(dot(7).fill(blue), arc.start),
        place(dot(7).fill(green), arc.end),
      ]);
    },
  ),
  define(
    "geometry-svg-arc-center",
    "Convert an SVG endpoint arc",
    "svgArcToCenter turns SVG endpoint flags into the center and sweep representation used for analysis.",
    `import { dot, draw, line, place, polyline, stack } from "./src/index.js";
import { ArcSegment, Point, svgArcToCenter } from "math-diagrammer/geometry";

const start = new Point(-105, 40);
const end = new Point(105, -24);
const values = svgArcToCenter(start, end, 125, 70, 18, false, true);
const arc = ArcSegment.fromSvg(start, end, 125, 70, 18, false, true);

draw(stack([
  line(start, end).stroke("#94a3b8", 2).dash([7, 5]),
  polyline(Array.from({ length: 61 }, (_, i) => arc.pointAt(i / 60)))
    .fill("none").stroke("#0891b2", 6),
  place(dot(9).fill("#dc2626"), values.center),
  place(dot(7).fill("#075dcc"), start),
  place(dot(7).fill("#15803d"), end)
]));`,
    () => {
      const start = new GeometryPoint(-105, 40);
      const end = new GeometryPoint(105, -24);
      const values = svgArcToCenter(start, end, 125, 70, 18, false, true);
      const arc = ArcSegment.fromSvg(start, end, 125, 70, 18, false, true);
      return stack([
        line(start, end).stroke("#94a3b8", 2).dash([7, 5]),
        polyline(sample(arc, 60)).fill("none").stroke(cyan, 6),
        place(dot(9).fill(red), values.center),
        place(dot(7).fill(blue), start),
        place(dot(7).fill(green), end),
      ]);
    },
  ),
  define(
    "geometry-path-bounds",
    "Union the bounds of several segments",
    "pathBounds combines the exact bounds of line and Bézier segments into one rectangle.",
    `import { draw, polyline, rectangle, stack } from "./src/index.js";
import {
  CubicSegment, LineSegment, Point, QuadraticSegment, pathBounds
} from "math-diagrammer/geometry";

const segments = [
  new LineSegment(new Point(-125, 42), new Point(-72, -24)),
  new QuadraticSegment(new Point(-72, -24), new Point(-18, -105), new Point(32, -16)),
  new CubicSegment(
    new Point(32, -16), new Point(68, 58),
    new Point(94, -78), new Point(128, 44)
  )
];
const bounds = pathBounds(segments);

draw(stack([
  rectangle(bounds.width, bounds.height)
    .fill("none").stroke("#c2410c", 2).dash([9, 6])
    .moveTo(bounds.center),
  ...segments.map(segment =>
    polyline(Array.from({ length: 41 }, (_, i) => segment.pointAt(i / 40)))
      .fill("none").stroke("#075dcc", 5)
  )
]));`,
    () => {
      const segments = [
        new LineSegment(new GeometryPoint(-125, 42), new GeometryPoint(-72, -24)),
        new QuadraticSegment(new GeometryPoint(-72, -24), new GeometryPoint(-18, -105), new GeometryPoint(32, -16)),
        new CubicSegment(
          new GeometryPoint(32, -16), new GeometryPoint(68, 58),
          new GeometryPoint(94, -78), new GeometryPoint(128, 44),
        ),
      ];
      const bounds = pathBounds(segments);
      return stack([
        boundsOutline(bounds, orange),
        ...segments.map(segment => polyline(sample(segment)).fill("none").stroke(blue, 5)),
      ]);
    },
  ),
]);

export default geometryApiExampleDefinitions;
