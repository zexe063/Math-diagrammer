import {
  align,
  annularSector,
  angleMark,
  arc,
  arrow,
  arrowBetween,
  beside,
  circle,
  column,
  connect,
  connectWith,
  distribute,
  dimensionLine,
  dot,
  ellipse,
  extendLine,
  frame,
  grid,
  label,
  layer,
  line,
  math,
  midpoint,
  pad,
  parallelMarks,
  path,
  pen,
  place,
  placeLabels,
  point,
  polar,
  polygon,
  polyline,
  rectangle,
  regularPolygon,
  ring,
  roundedRect,
  rightAngleMark,
  row,
  scaleToFit,
  sector,
  stack,
  strut,
  sideTicks,
  text,
  tick,
  triangle,
  vector,
  boundaryPoint,
} from "../../../src/index.js";

const colors = Object.freeze({
  ink: "#172033",
  blue: "#2563eb",
  blueSoft: "#bfdbfe",
  cyan: "#0891b2",
  cyanSoft: "#cffafe",
  green: "#15803d",
  greenSoft: "#bbf7d0",
  orange: "#c2410c",
  orangeSoft: "#fed7aa",
  pink: "#be185d",
  pinkSoft: "#fbcfe8",
  purple: "#6d28d9",
  purpleSoft: "#ddd6fe",
  red: "#dc2626",
  redSoft: "#fecaca",
  yellow: "#a16207",
  yellowSoft: "#fef08a",
  gray: "#64748b",
  graySoft: "#e2e8f0",
});

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

export const coreApiExampleDefinitions = Object.freeze([
  define(
    "core-circle",
    "Circle",
    "The number passed to circle is the radius: the distance from its center to its edge.",
    `draw(
  circle(64)
    .fill("#bfdbfe")
    .stroke("#2563eb", 4)
);`,
    () => circle(64).fill(colors.blueSoft).stroke(colors.blue, 4),
  ),
  define(
    "core-ellipse",
    "Ellipse",
    "An ellipse has separate horizontal and vertical radii.",
    `draw(
  ellipse(92, 48)
    .fill("#cffafe")
    .stroke("#0891b2", 4)
);`,
    () => ellipse(92, 48).fill(colors.cyanSoft).stroke(colors.cyan, 4),
  ),
  define(
    "core-rectangle",
    "Rectangle and square",
    "A rectangle is centered at the origin. Leaving out height makes a square.",
    `draw(row(28, [
  rectangle(130, 76)
    .fill("#fed7aa")
    .stroke("#c2410c", 4),
  rectangle(76)
    .fill("#fef08a")
    .stroke("#a16207", 4)
]));`,
    () => row(28, [
      rectangle(130, 76).fill(colors.orangeSoft).stroke(colors.orange, 4),
      rectangle(76).fill(colors.yellowSoft).stroke(colors.yellow, 4),
    ]),
  ),
  define(
    "core-rounded-rect",
    "Rounded rectangle",
    "The third number controls how round the corners are.",
    `draw(
  roundedRect(190, 96, 22)
    .fill("#bbf7d0")
    .stroke("#15803d", 4)
);`,
    () => roundedRect(190, 96, 22).fill(colors.greenSoft).stroke(colors.green, 4),
  ),
  define(
    "core-regular-polygon",
    "Regular polygons",
    "Every side and angle is equal. Change the first number to change the number of sides.",
    `draw(row(26, [
  regularPolygon(5, 52).fill("#fbcfe8").stroke("#be185d", 4),
  regularPolygon(6, 52).fill("#cffafe").stroke("#0891b2", 4),
  regularPolygon(8, 52).fill("#fef08a").stroke("#a16207", 4)
]));`,
    () => row(26, [
      regularPolygon(5, 52).fill(colors.pinkSoft).stroke(colors.pink, 4),
      regularPolygon(6, 52).fill(colors.cyanSoft).stroke(colors.cyan, 4),
      regularPolygon(8, 52).fill(colors.yellowSoft).stroke(colors.yellow, 4),
    ]),
  ),
  define(
    "core-triangle",
    "Triangle",
    "Give triangle a size for an equilateral triangle, or give it three points for a custom one.",
    `draw(row(34, [
  triangle(105).fill("#ddd6fe").stroke("#6d28d9", 4),
  triangle([[0, -55], [72, 48], [-38, 48]])
    .fill("#fed7aa")
    .stroke("#c2410c", 4)
]));`,
    () => row(34, [
      triangle(105).fill(colors.purpleSoft).stroke(colors.purple, 4),
      triangle([[0, -55], [72, 48], [-38, 48]]).fill(colors.orangeSoft).stroke(colors.orange, 4),
    ]),
  ),
  define(
    "core-line",
    "Straight line",
    "A line joins two points. A single number creates a centered horizontal line of that length.",
    `draw(column(34, [
  line([-100, 0], [100, 0]).stroke("#2563eb", 5),
  line(200).stroke("#dc2626", 5).dash([14, 8])
]));`,
    () => column(34, [
      line([-100, 0], [100, 0]).stroke(colors.blue, 5),
      line(200).stroke(colors.red, 5).dash([14, 8]),
    ]),
  ),
  define(
    "core-polyline",
    "Polyline",
    "A polyline visits each point in order but leaves the final end open.",
    `draw(
  polyline([[-110, 40], [-55, -42], [0, 22], [55, -58], [110, 10]])
    .fill("none")
    .stroke("#0891b2", 6)
);`,
    () => polyline([[-110, 40], [-55, -42], [0, 22], [55, -58], [110, 10]])
      .fill("none").stroke(colors.cyan, 6),
  ),
  define(
    "core-polygon",
    "Polygon from points",
    "Polygon closes the last point back to the first, so it can hold a fill color.",
    `draw(
  polygon([[-90, 48], [-55, -48], [20, -70], [100, 0], [46, 70]])
    .fill("#fbcfe8")
    .stroke("#be185d", 4)
);`,
    () => polygon([[-90, 48], [-55, -48], [20, -70], [100, 0], [46, 70]])
      .fill(colors.pinkSoft).stroke(colors.pink, 4),
  ),
  define(
    "core-arc",
    "Circular arc",
    "An arc draws only part of a circle. Its start and end angles are measured in radians.",
    `draw(stack([
  circle(76).fill("none").stroke("#e2e8f0", 3),
  arc(76, Math.PI, Math.PI * 1.85)
    .fill("none")
    .stroke("#dc2626", 8)
]));`,
    () => stack([
      circle(76).fill("none").stroke(colors.graySoft, 3),
      arc(76, Math.PI, Math.PI * 1.85).fill("none").stroke(colors.red, 8),
    ]),
  ),
  define(
    "core-sector",
    "Sector or wedge",
    "A sector is a slice that runs from the center to the curved edge, like a piece of pie.",
    `draw(
  sector(88, -Math.PI / 2, Math.PI / 3)
    .fill("#fef08a")
    .stroke("#a16207", 4)
);`,
    () => sector(88, -Math.PI / 2, Math.PI / 3).fill(colors.yellowSoft).stroke(colors.yellow, 4),
  ),
  define(
    "core-annular-sector",
    "Annular sector",
    "An annular sector is a slice cut from a ring. It needs an inner and outer radius.",
    `draw(
  annularSector(44, 92, -Math.PI * 0.85, Math.PI * 0.45)
    .fill("#bbf7d0")
    .stroke("#15803d", 4)
);`,
    () => annularSector(44, 92, -Math.PI * 0.85, Math.PI * 0.45)
      .fill(colors.greenSoft).stroke(colors.green, 4),
  ),
  define(
    "core-ring",
    "Ring",
    "A ring is the area between two complete circles.",
    `draw(
  ring(48, 86)
    .fill("#ddd6fe")
    .stroke("#6d28d9", 4)
);`,
    () => ring(48, 86).fill(colors.purpleSoft).stroke(colors.purple, 4),
  ),
  define(
    "core-text",
    "Ordinary text",
    "Use text for words, numbers, and short labels that do not need mathematical typesetting.",
    `draw(column(16, [
  text("Area of a circle", 28).color("#172033").fontWeight(700),
  text("radius = 5 cm", 20).color("#2563eb")
]));`,
    () => column(16, [
      text("Area of a circle", 28).color(colors.ink).fontWeight(700),
      text("radius = 5 cm", 20).color(colors.blue),
    ]),
  ),
  define(
    "core-math",
    "Typeset mathematics",
    "Math turns LaTeX into sharp vector mathematics that remains part of the exported SVG.",
    `draw(column(24, [
  math(String.raw\`A = \\pi r^2\`, 34).color("#172033"),
  math(String.raw\`x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}\`, 28)
    .color("#6d28d9")
]));`,
    () => column(24, [
      math(String.raw`A = \pi r^2`, 34).color(colors.ink),
      math(String.raw`x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}`, 28).color(colors.purple),
    ]),
  ),
  define(
    "core-dot",
    "Point marker",
    "Dot is a tiny filled circle. It is useful for vertices, data points, and coordinate markers.",
    `draw(stack([
  line([-100, 0], [100, 0]).stroke("#94a3b8", 3),
  dot(9).fill("#dc2626"),
  label("P", [0, -24], { color: "#dc2626", size: 20 })
]));`,
    () => stack([
      line([-100, 0], [100, 0]).stroke("#94a3b8", 3),
      dot(9).fill(colors.red),
      label("P", [0, -24], { color: colors.red, size: 20 }),
    ]),
  ),
  define(
    "core-pen-path",
    "Custom path with pen and path",
    "Pen records drawing commands; path turns those commands into a styleable diagram.",
    `const wave = pen()
  .moveTo(-120, 20)
  .cubicTo(-75, -95, -25, 95, 20, -20)
  .quadTo([72, -82], [120, 15]);

draw(path(wave).fill("none").stroke("#be185d", 6));`,
    () => path(pen()
      .moveTo(-120, 20)
      .cubicTo(-75, -95, -25, 95, 20, -20)
      .quadTo([72, -82], [120, 15]))
      .fill("none").stroke(colors.pink, 6),
  ),

  define(
    "core-stack",
    "Stack layers",
    "Stack places every child in the same coordinate space. Later children appear on top.",
    `draw(stack([
  circle(82).fill("#bfdbfe").stroke("#2563eb", 4),
  circle(52).fill("#fef08a").stroke("#a16207", 4),
  math(String.raw\`\\frac{1}{2}\`, 30).color("#172033")
]));`,
    () => stack([
      circle(82).fill(colors.blueSoft).stroke(colors.blue, 4),
      circle(52).fill(colors.yellowSoft).stroke(colors.yellow, 4),
      math(String.raw`\frac{1}{2}`, 30).color(colors.ink),
    ]),
  ),
  define(
    "core-layer",
    "Layer a base and children",
    "Layer is a readable form of stack when one diagram is clearly the background.",
    `const card = roundedRect(250, 130, 20)
  .fill("#cffafe")
  .stroke("#0891b2", 4);

draw(layer(card, [
  text("MEAN", 18).color("#0891b2").translateY(-28),
  math(String.raw\`\\bar{x}=\\frac{\\sum x}{n}\`, 28).color("#172033").translateY(18)
]));`,
    () => layer(
      roundedRect(250, 130, 20).fill(colors.cyanSoft).stroke(colors.cyan, 4),
      [
        text("MEAN", 18).color(colors.cyan).translateY(-28),
        math(String.raw`\bar{x}=\frac{\sum x}{n}`, 28).color(colors.ink).translateY(18),
      ],
    ),
  ),
  define(
    "core-row",
    "Row layout",
    "Row places children from left to right. Gap is the empty space between neighboring bounds.",
    `draw(row(24, [
  circle(34).fill("#fecaca").stroke("#dc2626", 3),
  rectangle(68, 68).fill("#bfdbfe").stroke("#2563eb", 3),
  triangle(74).fill("#fef08a").stroke("#a16207", 3)
], { align: "bottom" }));`,
    () => row(24, [
      circle(34).fill(colors.redSoft).stroke(colors.red, 3),
      rectangle(68, 68).fill(colors.blueSoft).stroke(colors.blue, 3),
      triangle(74).fill(colors.yellowSoft).stroke(colors.yellow, 3),
    ], { align: "bottom" }),
  ),
  define(
    "core-column",
    "Column layout",
    "Column places children from top to bottom and can align their left, center, or right edges.",
    `draw(column(18, [
  roundedRect(210, 48, 12).fill("#ddd6fe").stroke("#6d28d9", 3),
  roundedRect(150, 48, 12).fill("#bbf7d0").stroke("#15803d", 3),
  roundedRect(90, 48, 12).fill("#fed7aa").stroke("#c2410c", 3)
], { align: "left" }));`,
    () => column(18, [
      roundedRect(210, 48, 12).fill(colors.purpleSoft).stroke(colors.purple, 3),
      roundedRect(150, 48, 12).fill(colors.greenSoft).stroke(colors.green, 3),
      roundedRect(90, 48, 12).fill(colors.orangeSoft).stroke(colors.orange, 3),
    ], { align: "left" }),
  ),
  define(
    "core-grid",
    "Grid layout",
    "Grid divides one list into rows with a fixed number of columns.",
    `const colors = ["#fecaca", "#fed7aa", "#fef08a", "#bbf7d0", "#bfdbfe", "#ddd6fe"];

draw(grid(3, { gapX: 18, gapY: 18, items:
  colors.map((color, index) =>
    stack([
      roundedRect(72, 58, 12).fill(color).stroke("#172033", 2),
      text(index + 1, 20).color("#172033")
    ])
  )
}));`,
    () => grid(3, {
      gapX: 18,
      gapY: 18,
      items: [colors.redSoft, colors.orangeSoft, colors.yellowSoft, colors.greenSoft, colors.blueSoft, colors.purpleSoft]
        .map((color, index) => stack([
          roundedRect(72, 58, 12).fill(color).stroke(colors.ink, 2),
          text(index + 1, 20).color(colors.ink),
        ])),
    }),
  ),
  define(
    "core-distribute",
    "Distribute in a direction",
    "Distribute chooses a horizontal or vertical arrangement from the strongest part of a direction vector.",
    `draw(distribute([0, 1], [
  circle(24).fill("#fecaca").stroke("#dc2626", 3),
  circle(32).fill("#fef08a").stroke("#a16207", 3),
  circle(40).fill("#bbf7d0").stroke("#15803d", 3)
], 18, { align: "left" }));`,
    () => distribute([0, 1], [
      circle(24).fill(colors.redSoft).stroke(colors.red, 3),
      circle(32).fill(colors.yellowSoft).stroke(colors.yellow, 3),
      circle(40).fill(colors.greenSoft).stroke(colors.green, 3),
    ], 18, { align: "left" }),
  ),
  define(
    "core-frame",
    "Fixed layout frame",
    "Frame gives content exact layout bounds without drawing or cutting anything.",
    `const content = circle(34)
  .fill("#fbcfe8")
  .stroke("#be185d", 4);
const framed = frame(240, 120, content, { alignX: "left" });

draw(stack([
  rectangle(240, 120).fill("none").stroke("#64748b", 2).dash([8, 6]),
  framed
]));`,
    () => {
      const content = circle(34).fill(colors.pinkSoft).stroke(colors.pink, 4);
      const framed = frame(240, 120, content, { alignX: "left" });
      return stack([
        rectangle(240, 120).fill("none").stroke(colors.gray, 2).dash([8, 6]),
        framed,
      ]);
    },
  ),
  define(
    "core-scale-to-fit",
    "Scale to fit",
    "ScaleToFit changes size uniformly, so the drawing keeps its original proportions.",
    `const original = polygon([[-90, 45], [0, -70], [90, 45]])
  .fill("#fed7aa")
  .stroke("#c2410c", 4);

draw(stack([
  rectangle(160, 100).fill("none").stroke("#64748b", 2).dash([8, 6]),
  scaleToFit(160, 100, original)
]));`,
    () => {
      const original = polygon([[-90, 45], [0, -70], [90, 45]])
        .fill(colors.orangeSoft).stroke(colors.orange, 4);
      return stack([
        rectangle(160, 100).fill("none").stroke(colors.gray, 2).dash([8, 6]),
        scaleToFit(160, 100, original),
      ]);
    },
  ),
  define(
    "core-beside",
    "Place one diagram beside another",
    "Beside reads the sign of a direction. Here the second shape is placed to the left of the first.",
    `const first = circle(42).fill("#bfdbfe").stroke("#2563eb", 4);
const second = triangle(86).fill("#fef08a").stroke("#a16207", 4);

draw(beside(vector(-1, 0), first, second, 30));`,
    () => beside(
      vector(-1, 0),
      circle(42).fill(colors.blueSoft).stroke(colors.blue, 4),
      triangle(86).fill(colors.yellowSoft).stroke(colors.yellow, 4),
      30,
    ),
  ),
  define(
    "core-align",
    "Align an anchor to the origin",
    "Align moves a named anchor to coordinate zero. The red dot shows that origin.",
    `const card = roundedRect(180, 100, 16)
  .fill("#cffafe")
  .stroke("#0891b2", 4);

draw(stack([
  align(card, "topLeft"),
  line([-30, 0], [210, 0]).stroke("#94a3b8", 2),
  line([0, -30], [0, 130]).stroke("#94a3b8", 2),
  dot(7).fill("#dc2626")
]));`,
    () => stack([
      align(roundedRect(180, 100, 16).fill(colors.cyanSoft).stroke(colors.cyan, 4), "topLeft"),
      line([-30, 0], [210, 0]).stroke("#94a3b8", 2),
      line([0, -30], [0, 130]).stroke("#94a3b8", 2),
      dot(7).fill(colors.red),
    ]),
  ),
  define(
    "core-pad",
    "Invisible padding",
    "Pad expands layout bounds but draws no background. The dashed box reveals the added space.",
    `const padded = pad(28,
  circle(40).fill("#bbf7d0").stroke("#15803d", 4)
);

draw(stack([
  rectangle(padded.width, padded.height)
    .fill("none")
    .stroke("#64748b", 2)
    .dash([8, 6]),
  padded
]));`,
    () => {
      const padded = pad(28, circle(40).fill(colors.greenSoft).stroke(colors.green, 4));
      return stack([
        rectangle(padded.width, padded.height).fill("none").stroke(colors.gray, 2).dash([8, 6]),
        padded,
      ]);
    },
  ),
  define(
    "core-strut",
    "Invisible spacer",
    "A strut occupies exact width and height. Use it when a layout needs deliberate empty space.",
    `draw(row(0, [
  stack([circle(34).fill("#fecaca").stroke("#dc2626", 3), text("A", 22)]),
  strut(110, 68),
  stack([circle(34).fill("#bfdbfe").stroke("#2563eb", 3), text("B", 22)])
]));`,
    () => row(0, [
      stack([circle(34).fill(colors.redSoft).stroke(colors.red, 3), text("A", 22)]),
      strut(110, 68),
      stack([circle(34).fill(colors.blueSoft).stroke(colors.blue, 3), text("B", 22)]),
    ]),
  ),
  define(
    "core-place",
    "Place an anchor on a point",
    "Place moves a diagram until its chosen source anchor lands exactly on the target coordinate.",
    `const card = roundedRect(150, 82, 14)
  .fill("#ddd6fe")
  .stroke("#6d28d9", 4);

draw(stack([
  line([-120, 0], [120, 0]).stroke("#94a3b8", 2),
  line([0, -90], [0, 90]).stroke("#94a3b8", 2),
  place(card, [0, 0], "bottomRight"),
  dot(7).fill("#dc2626")
]));`,
    () => stack([
      line([-120, 0], [120, 0]).stroke("#94a3b8", 2),
      line([0, -90], [0, 90]).stroke("#94a3b8", 2),
      place(roundedRect(150, 82, 14).fill(colors.purpleSoft).stroke(colors.purple, 4), [0, 0], "bottomRight"),
      dot(7).fill(colors.red),
    ]),
  ),
  define(
    "core-place-labels",
    "Place several labels without collisions",
    "Preferred directions keep labels meaningful while nearby candidates prevent text from crossing the triangle sides.",
    `const a = point(-130, 80);
const b = point(130, 80);
const c = point(20, -95);
const sides = [[a, b], [b, c], [c, a]];

const labels = placeLabels([
  { value: "A", at: a, direction: [-1, 1], name: "A" },
  { value: "B", at: b, direction: [1, 1], name: "B" },
  { value: "C", at: c, direction: [0, -1], name: "C" },
  { value: "c", at: midpoint(a, b), direction: [0, 1] },
  { value: "x", at: c, direction: [0, 1], offset: 48 }
], {
  obstacles: sides,
  clearance: 5
});

draw(stack([
  polygon([a, b, c]).fill("#dbeafe").stroke("#1d4ed8", 4),
  labels
]));`,
    () => {
      const a = point(-130, 80);
      const b = point(130, 80);
      const c = point(20, -95);
      const sides = [[a, b], [b, c], [c, a]];
      return stack([
        polygon([a, b, c]).fill(colors.blueSoft).stroke("#1d4ed8", 4),
        placeLabels([
          { value: "A", at: a, direction: [-1, 1], name: "A" },
          { value: "B", at: b, direction: [1, 1], name: "B" },
          { value: "C", at: c, direction: [0, -1], name: "C" },
          { value: "c", at: midpoint(a, b), direction: [0, 1] },
          { value: "x", at: c, direction: [0, 1], offset: 48 },
        ], { obstacles: sides, clearance: 5 }),
      ]);
    },
  ),
  define(
    "core-boundary-point",
    "Find a rectangular boundary point",
    "BoundaryPoint follows a ray from a center until it reaches the edge of rectangular bounds.",
    `const panel = roundedRect(220, 120, 16)
  .fill("#ffffff")
  .stroke("#172033", 4);
const target = point(150, -90);
const edge = boundaryPoint(panel.bounds, panel.center, target);

draw(stack([
  panel,
  line(panel.center, target).stroke("#94a3b8", 2).dash([7, 5]),
  place(dot(10).fill("#dc2626"), edge),
  place(dot(8).fill("#2563eb"), target)
]));`,
    () => {
      const panel = roundedRect(220, 120, 16).fill("#ffffff").stroke(colors.ink, 4);
      const target = point(150, -90);
      const edge = boundaryPoint(panel.bounds, panel.center, target);
      return stack([
        panel,
        line(panel.center, target).stroke("#94a3b8", 2).dash([7, 5]),
        place(dot(10).fill(colors.red), edge),
        place(dot(8).fill(colors.blue), target),
      ]);
    },
  ),

  define(
    "core-styles",
    "Fluent styling",
    "Style methods return a new diagram and can control fill, stroke, opacity, dashes, and line endings.",
    `draw(row(28, [
  circle(46).fill("#bfdbfe").stroke("#2563eb", 5),
  circle(46).fill("#fbcfe8").stroke("#be185d", 5).dash([9, 5]),
  circle(46).fill("#fef08a").stroke("#a16207", 5).opacity(0.65)
]));`,
    () => row(28, [
      circle(46).fill(colors.blueSoft).stroke(colors.blue, 5),
      circle(46).fill(colors.pinkSoft).stroke(colors.pink, 5).dash([9, 5]),
      circle(46).fill(colors.yellowSoft).stroke(colors.yellow, 5).opacity(0.65),
    ]),
  ),
  define(
    "core-transforms",
    "Transform a diagram",
    "Translate, rotate, scale, skew, and reflect create transformed copies of the original diagram.",
    `const arrowShape = polygon([[-52, -22], [12, -22], [12, -46], [64, 0], [12, 46], [12, 22], [-52, 22]])
  .fill("#fed7aa")
  .stroke("#c2410c", 4);

draw(row(42, [
  arrowShape,
  arrowShape.rotateDeg(45).scale(0.85),
  arrowShape.reflectY().fill("#cffafe").stroke("#0891b2", 4)
]));`,
    () => {
      const arrowShape = polygon([[-52, -22], [12, -22], [12, -46], [64, 0], [12, 46], [12, 22], [-52, 22]])
        .fill(colors.orangeSoft).stroke(colors.orange, 4);
      return row(42, [
        arrowShape,
        arrowShape.rotateDeg(45).scale(0.85),
        arrowShape.reflectY().fill(colors.cyanSoft).stroke(colors.cyan, 4),
      ]);
    },
  ),
  define(
    "core-anchors",
    "Named anchors",
    "An anchor is a meaningful point attached to a diagram. Custom anchors move with every transform.",
    `const node = roundedRect(210, 100, 18)
  .fill("#bbf7d0")
  .stroke("#15803d", 4)
  .withAnchor("input", [-105, 0])
  .withAnchor("output", [105, 0]);

draw(stack([
  node,
  place(dot(8).fill("#dc2626"), node.anchor("input")),
  place(dot(8).fill("#2563eb"), node.anchor("output")),
  text("input", 17).color("#dc2626").moveTo(-105, -28),
  text("output", 17).color("#2563eb").moveTo(105, -28)
]));`,
    () => {
      const node = roundedRect(210, 100, 18)
        .fill(colors.greenSoft).stroke(colors.green, 4)
        .withAnchor("input", [-105, 0])
        .withAnchor("output", [105, 0]);
      return stack([
        node,
        place(dot(8).fill(colors.red), node.anchor("input")),
        place(dot(8).fill(colors.blue), node.anchor("output")),
        text("input", 17).color(colors.red).moveTo(-105, -28),
        text("output", 17).color(colors.blue).moveTo(105, -28),
      ]);
    },
  ),
  define(
    "core-clipping",
    "Clip one drawing with another",
    "Clip keeps only the part of a diagram that lies inside the mask shape.",
    `const stripes = row(0, [
  rectangle(34, 180).fill("#dc2626").stroke("none", 0),
  rectangle(34, 180).fill("#f59e0b").stroke("none", 0),
  rectangle(34, 180).fill("#eab308").stroke("none", 0),
  rectangle(34, 180).fill("#22c55e").stroke("none", 0),
  rectangle(34, 180).fill("#3b82f6").stroke("none", 0),
  rectangle(34, 180).fill("#8b5cf6").stroke("none", 0)
]);

draw(stack([
  stripes.clip(circle(86)),
  circle(86).fill("none").stroke("#172033", 4)
]));`,
    () => {
      const stripes = row(0, [
        rectangle(34, 180).fill("#dc2626").stroke("none", 0),
        rectangle(34, 180).fill("#f59e0b").stroke("none", 0),
        rectangle(34, 180).fill("#eab308").stroke("none", 0),
        rectangle(34, 180).fill("#22c55e").stroke("none", 0),
        rectangle(34, 180).fill("#3b82f6").stroke("none", 0),
        rectangle(34, 180).fill("#8b5cf6").stroke("none", 0),
      ]);
      return stack([
        stripes.clip(circle(86)),
        circle(86).fill("none").stroke(colors.ink, 4),
      ]);
    },
  ),

  define(
    "core-arrow",
    "Arrow",
    "Arrow joins two points with a shaft and a filled triangular head.",
    `draw(arrow([-110, 42], [110, -42], {
  color: "#2563eb",
  width: 5,
  headLength: 20,
  headWidth: 18
}));`,
    () => arrow([-110, 42], [110, -42], {
      color: colors.blue,
      width: 5,
      headLength: 20,
      headWidth: 18,
    }),
  ),
  define(
    "core-connect",
    "Connect two shapes",
    "Connect finds the visible boundaries automatically, so the line does not run through either shape.",
    `const left = circle(44).fill("#fecaca").stroke("#dc2626", 4).moveTo(-100, 0);
const right = roundedRect(100, 76, 14).fill("#bfdbfe").stroke("#2563eb", 4).moveTo(100, 0);

draw(stack([
  connect(left, right, { color: "#172033", width: 4 }),
  left,
  right
]));`,
    () => {
      const left = circle(44).fill(colors.redSoft).stroke(colors.red, 4).moveTo(-100, 0);
      const right = roundedRect(100, 76, 14).fill(colors.blueSoft).stroke(colors.blue, 4).moveTo(100, 0);
      return stack([connect(left, right, { color: colors.ink, width: 4 }), left, right]);
    },
  ),
  define(
    "core-connect-with",
    "Connect with a custom line factory",
    "ConnectWith calculates rectangular-bound endpoints, then gives both points to your lineFactory.",
    `const left = roundedRect(96, 74, 14)
  .fill("#fef08a")
  .stroke("#a16207", 4)
  .moveTo(-110, 0);
const right = roundedRect(96, 74, 14)
  .fill("#cffafe")
  .stroke("#0891b2", 4)
  .moveTo(110, 0);

const connector = connectWith(left, right, {
  lineFactory: (start, end) =>
    arrow(start, end, { color: "#6d28d9", width: 4, headLength: 17 })
});

draw(stack([connector, left, right]));`,
    () => {
      const left = roundedRect(96, 74, 14).fill(colors.yellowSoft).stroke(colors.yellow, 4).moveTo(-110, 0);
      const right = roundedRect(96, 74, 14).fill(colors.cyanSoft).stroke(colors.cyan, 4).moveTo(110, 0);
      const connector = connectWith(left, right, {
        lineFactory: (start, end) => arrow(start, end, { color: colors.purple, width: 4, headLength: 17 }),
      });
      return stack([connector, left, right]);
    },
  ),
  define(
    "core-arrow-between",
    "Arrow between shapes",
    "ArrowBetween combines boundary-aware connection with a directional arrowhead.",
    `const start = stack([
  circle(44).fill("#bbf7d0").stroke("#15803d", 4),
  text("1", 22)
]).moveTo(-105, 0);
const end = stack([
  circle(44).fill("#fef08a").stroke("#a16207", 4),
  text("2", 22)
]).moveTo(105, 0);

draw(stack([
  arrowBetween(start, end, { color: "#6d28d9", width: 4, headLength: 17 }),
  start,
  end
]));`,
    () => {
      const start = stack([circle(44).fill(colors.greenSoft).stroke(colors.green, 4), text("1", 22)]).moveTo(-105, 0);
      const end = stack([circle(44).fill(colors.yellowSoft).stroke(colors.yellow, 4), text("2", 22)]).moveTo(105, 0);
      return stack([
        arrowBetween(start, end, { color: colors.purple, width: 4, headLength: 17 }),
        start,
        end,
      ]);
    },
  ),
  define(
    "core-label",
    "Point label",
    "Label creates bold ordinary text at a point and can add a small offset to avoid covering the mark.",
    `draw(stack([
  line([-110, 35], [100, -48]).stroke("#64748b", 3),
  dot(8).fill("#dc2626").moveTo(32, -19),
  label("Point P", [32, -19], {
    offset: [18, -24],
    size: 20,
    color: "#dc2626",
    weight: 700
  })
]));`,
    () => stack([
      line([-110, 35], [100, -48]).stroke(colors.gray, 3),
      dot(8).fill(colors.red).moveTo(32, -19),
      label("Point P", [32, -19], { offset: [18, -24], size: 20, color: colors.red, weight: 700 }),
    ]),
  ),
  define(
    "core-tick",
    "Tick mark",
    "Tick draws a short line centered on a point. Its angle controls the direction of the mark.",
    `draw(stack([
  line([-120, 0], [120, 0]).stroke("#172033", 4),
  ...[-80, -40, 0, 40, 80].map(x =>
    tick([x, 0], { size: 18, color: "#c2410c", width: 4 })
  )
]));`,
    () => stack([
      line([-120, 0], [120, 0]).stroke(colors.ink, 4),
      ...[-80, -40, 0, 40, 80].map(x => tick([x, 0], { size: 18, color: colors.orange, width: 4 })),
    ]),
  ),
  define(
    "core-angle-mark",
    "Automatic interior and exterior angles",
    "AngleMark measures the rays, chooses the requested sweep, and places each label automatically.",
    `const a = point(-145, -90);
const b = point(145, 0);
const c = point(-20, 55);
const extendedSide = extendLine(a, c, { after: 105, color: "#172033", width: 3 });

draw(stack([
  line(a, b).stroke("#172033", 3),
  line(c, b).stroke("#172033", 3),
  extendedSide,
  angleMark(a, b, c, { label: "x", fill: "#fbbf24" }),
  angleMark(b, c, a, { label: "x", fill: "#fbbf24" }),
  angleMark(c, b, extendedSide.anchor("extendedEnd"), {
    label: "y",
    fill: "#3b82f6",
    radius: 42
  })
]));`,
    () => {
      const a = point(-145, -90);
      const b = point(145, 0);
      const c = point(-20, 55);
      const extendedSide = extendLine(a, c, { after: 105, color: colors.ink, width: 3 });
      return stack([
        line(a, b).stroke(colors.ink, 3),
        line(c, b).stroke(colors.ink, 3),
        extendedSide,
        angleMark(a, b, c, { label: "x", fill: "#fbbf24" }),
        angleMark(b, c, a, { label: "x", fill: "#fbbf24" }),
        angleMark(c, b, extendedSide.anchor("extendedEnd"), {
          label: "y",
          fill: colors.blue,
          radius: 42,
        }),
      ]);
    },
  ),
  define(
    "core-extend-line",
    "Extend a line semantically",
    "ExtendLine continues a segment by distances measured along its own direction.",
    `const start = point(-90, 35);
const end = point(85, -30);

draw(stack([
  extendLine(start, end, {
    before: 45,
    after: 60,
    color: "#6d28d9",
    width: 4
  }),
  place(dot(8).fill("#dc2626"), start),
  place(dot(8).fill("#2563eb"), end)
]));`,
    () => {
      const start = point(-90, 35);
      const end = point(85, -30);
      return stack([
        extendLine(start, end, { before: 45, after: 60, color: colors.purple, width: 4 }),
        place(dot(8).fill(colors.red), start),
        place(dot(8).fill(colors.blue), end),
      ]);
    },
  ),
  define(
    "core-right-angle-mark",
    "Right-angle corner",
    "RightAngleMark derives a square corner directly from two rays.",
    `const vertex = point(-55, 45);
const horizontal = point(105, 45);
const vertical = point(-55, -95);

draw(stack([
  line(vertex, horizontal).stroke("#172033", 4),
  line(vertex, vertical).stroke("#172033", 4),
  rightAngleMark(vertex, horizontal, vertical, {
    size: 24,
    fill: "#bfdbfe",
    color: "#2563eb",
    width: 3
  })
]));`,
    () => {
      const vertex = point(-55, 45);
      const horizontal = point(105, 45);
      const vertical = point(-55, -95);
      return stack([
        line(vertex, horizontal).stroke(colors.ink, 4),
        line(vertex, vertical).stroke(colors.ink, 4),
        rightAngleMark(vertex, horizontal, vertical, {
          size: 24,
          fill: colors.blueSoft,
          color: colors.blue,
          width: 3,
        }),
      ]);
    },
  ),
  define(
    "core-side-ticks",
    "Equal-side ticks",
    "SideTicks places a centered family of perpendicular equality marks on any segment.",
    `const left = point(-125, 55);
const top = point(0, -80);
const right = point(125, 55);

draw(stack([
  polyline([left, top, right]).fill("none").stroke("#172033", 4),
  sideTicks(left, top, { count: 2, color: "#dc2626", width: 3 }),
  sideTicks(top, right, { count: 2, color: "#dc2626", width: 3 })
]));`,
    () => {
      const left = point(-125, 55);
      const top = point(0, -80);
      const right = point(125, 55);
      return stack([
        polyline([left, top, right]).fill("none").stroke(colors.ink, 4),
        sideTicks(left, top, { count: 2, color: colors.red, width: 3 }),
        sideTicks(top, right, { count: 2, color: colors.red, width: 3 }),
      ]);
    },
  ),
  define(
    "core-parallel-marks",
    "Parallel-line chevrons",
    "ParallelMarks adds matching chevrons without calculating their rotation or placement.",
    `const firstStart = point(-125, -45);
const firstEnd = point(125, -45);
const secondStart = point(-125, 55);
const secondEnd = point(125, 55);

draw(stack([
  line(firstStart, firstEnd).stroke("#172033", 4),
  line(secondStart, secondEnd).stroke("#172033", 4),
  parallelMarks(firstStart, firstEnd, { count: 2, color: "#2563eb", width: 3 }),
  parallelMarks(secondStart, secondEnd, { count: 2, color: "#2563eb", width: 3 })
]));`,
    () => {
      const firstStart = point(-125, -45);
      const firstEnd = point(125, -45);
      const secondStart = point(-125, 55);
      const secondEnd = point(125, 55);
      return stack([
        line(firstStart, firstEnd).stroke(colors.ink, 4),
        line(secondStart, secondEnd).stroke(colors.ink, 4),
        parallelMarks(firstStart, firstEnd, { count: 2, color: colors.blue, width: 3 }),
        parallelMarks(secondStart, secondEnd, { count: 2, color: colors.blue, width: 3 }),
      ]);
    },
  ),
  define(
    "core-dimension-line",
    "Automatic dimension line",
    "DimensionLine offsets the measurement, extends both endpoints, adds arrowheads, and labels the length.",
    `const start = point(-110, 0);
const end = point(110, 0);

draw(stack([
  line(start, end).stroke("#172033", 5),
  dimensionLine(start, end, {
    offset: 42,
    label: "12 cm",
    color: "#15803d",
    width: 2.5
  })
]));`,
    () => {
      const start = point(-110, 0);
      const end = point(110, 0);
      return stack([
        line(start, end).stroke(colors.ink, 5),
        dimensionLine(start, end, {
          offset: 42,
          label: "12 cm",
          color: colors.green,
          width: 2.5,
        }),
      ]);
    },
  ),

  define(
    "core-point",
    "Point coordinates",
    "A Point stores one exact position. Points are accepted anywhere the DSL asks for a location.",
    `const a = point(-90, 45);
const b = point(90, -45);

draw(stack([
  line(a, b).stroke("#2563eb", 4),
  place(dot(9).fill("#dc2626"), a),
  place(dot(9).fill("#15803d"), b),
  label("A", a, { offset: [-18, -20], color: "#dc2626" }),
  label("B", b, { offset: [18, -20], color: "#15803d" })
]));`,
    () => {
      const a = point(-90, 45);
      const b = point(90, -45);
      return stack([
        line(a, b).stroke(colors.blue, 4),
        place(dot(9).fill(colors.red), a),
        place(dot(9).fill(colors.green), b),
        label("A", a, { offset: [-18, -20], color: colors.red }),
        label("B", b, { offset: [18, -20], color: colors.green }),
      ]);
    },
  ),
  define(
    "core-vector",
    "Vector movement",
    "A Vector describes a direction and distance. Add it to a point to find a new point.",
    `const start = point(-85, 48);
const movement = vector(170, -96);
const end = start.add(movement);

draw(stack([
  arrow(start, end, { color: "#6d28d9", width: 5, headLength: 20 }),
  place(dot(8).fill("#dc2626"), start),
  place(dot(8).fill("#2563eb"), end)
]));`,
    () => {
      const start = point(-85, 48);
      const movement = vector(170, -96);
      const end = start.add(movement);
      return stack([
        arrow(start, end, { color: colors.purple, width: 5, headLength: 20 }),
        place(dot(8).fill(colors.red), start),
        place(dot(8).fill(colors.blue), end),
      ]);
    },
  ),
  define(
    "core-polar",
    "Vector from angle and length",
    "Polar converts an angle and magnitude into an x-y vector.",
    `const directions = [0, Math.PI / 3, Math.PI * 2 / 3, Math.PI].map(angle =>
  arrow([0, 0], point(0, 0).add(polar(angle, 92)), {
    color: "#0891b2",
    width: 4,
    headLength: 16
  })
);

draw(stack([...directions, dot(7).fill("#dc2626")]));`,
    () => {
      const directions = [0, Math.PI / 3, Math.PI * 2 / 3, Math.PI].map(angle =>
        arrow([0, 0], point(0, 0).add(polar(angle, 92)), {
          color: colors.cyan,
          width: 4,
          headLength: 16,
        }));
      return stack([...directions, dot(7).fill(colors.red)]);
    },
  ),
  define(
    "core-midpoint",
    "Midpoint",
    "Midpoint returns the point exactly halfway between two Point values.",
    `const a = point(-105, 45);
const b = point(105, -45);
const middle = midpoint(a, b);

draw(stack([
  line(a, b).stroke("#64748b", 4),
  place(dot(9).fill("#2563eb"), a),
  place(dot(9).fill("#2563eb"), b),
  place(dot(11).fill("#dc2626"), middle),
  label("midpoint", middle, { offset: [0, -28], color: "#dc2626" })
]));`,
    () => {
      const a = point(-105, 45);
      const b = point(105, -45);
      const middle = midpoint(a, b);
      return stack([
        line(a, b).stroke(colors.gray, 4),
        place(dot(9).fill(colors.blue), a),
        place(dot(9).fill(colors.blue), b),
        place(dot(11).fill(colors.red), middle),
        label("midpoint", middle, { offset: [0, -28], color: colors.red }),
      ]);
    },
  ),
  define(
    "core-path-commands",
    "Path drawing commands",
    "Move starts a path; line, quadratic, cubic, and arc commands add different kinds of segments.",
    `const data = pen()
  .moveTo(-130, 45)
  .lineTo(-85, -25)
  .quadTo([-45, -90], [0, -20])
  .cubicTo([35, 50], [70, -90], [105, -18])
  .arcTo(34, 34, 0, false, true, [130, 45]);

draw(path(data).fill("none").stroke("#be185d", 6));`,
    () => path(pen()
      .moveTo(-130, 45)
      .lineTo(-85, -25)
      .quadTo([-45, -90], [0, -20])
      .cubicTo([35, 50], [70, -90], [105, -18])
      .arcTo(34, 34, 0, false, true, [130, 45]))
      .fill("none").stroke(colors.pink, 6),
  ),
]);

export default coreApiExampleDefinitions;
