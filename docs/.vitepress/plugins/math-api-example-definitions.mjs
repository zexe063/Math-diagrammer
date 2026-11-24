import {
  axes,
  barChart,
  boxPlot,
  cellGrid,
  circle,
  coordinatePlane,
  fractionBar,
  fractionCircle,
  fractionPie,
  functionPlot,
  histogram,
  line,
  numberLine,
  parametricPlot,
  pieChart,
  plot,
  polygonDiagram,
  probabilityTree,
  pythagoras,
  radialPolygon,
  rightTriangle,
  scatterPlot,
  sierpinski,
  spikeSeries,
  spiral,
  text,
  triangleDiagram,
  vennDiagram,
} from "../../../src/index.js";

const render = (ariaLabel, padding = 32) => ({ ariaLabel, padding });

/** Trusted, build-time examples for the high-level mathematics API reference. */
export const mathApiExampleDefinitions = Object.freeze([
  {
    id: "math-number-line",
    title: "A number line with arrows",
    description: "Ticks mark equal steps, while labels tell the value at each position.",
    source: `draw(numberLine({
  min: -4,
  max: 6,
  step: 1,
  width: 520,
  arrowheads: true,
  color: "#172554",
  tickColor: "#dc2626",
  labelColor: "#172554"
}));`,
    build: () => numberLine({
      min: -4,
      max: 6,
      step: 1,
      width: 520,
      arrowheads: true,
      color: "#172554",
      tickColor: "#dc2626",
      labelColor: "#172554",
    }),
    render: render("A number line from negative four to six with red ticks and arrowheads", 36),
  },
  {
    id: "math-coordinate-plane",
    title: "A complete coordinate plane",
    description: "A pale grid supports strong x- and y-axes without competing with them.",
    source: `draw(coordinatePlane({
  xDomain: [-4, 4],
  yDomain: [-3, 3],
  xStep: 1,
  yStep: 1,
  width: 500,
  height: 340,
  gridColor: "#bfdbfe",
  axisColor: "#172554",
  labelColor: "#172554",
  border: true
}));`,
    build: () => coordinatePlane({
      xDomain: [-4, 4], yDomain: [-3, 3], xStep: 1, yStep: 1,
      width: 500, height: 340, gridColor: "#bfdbfe", axisColor: "#172554",
      labelColor: "#172554", border: true,
    }),
    render: render("A blue coordinate grid from negative four to four on x and negative three to three on y"),
  },
  {
    id: "math-axes",
    title: "Axes without a grid",
    description: "Use this quieter frame when the data should be the strongest visual element.",
    source: `draw(axes({
  xDomain: [-5, 5],
  yDomain: [-4, 4],
  width: 500,
  height: 320,
  axisColor: "#111827",
  labelColor: "#111827",
  tickSize: 10
}));`,
    build: () => axes({
      xDomain: [-5, 5], yDomain: [-4, 4], width: 500, height: 320,
      axisColor: "#111827", labelColor: "#111827", tickSize: 10,
    }),
    render: render("Horizontal and vertical coordinate axes with ticks and labels but no grid"),
  },
  {
    id: "math-function-plot",
    title: "Plot y = x squared",
    description: "Give the helper a JavaScript function and it samples a smooth mathematical curve.",
    source: `draw(functionPlot(x => x * x, {
  xDomain: [-3, 3],
  yDomain: [-1, 9],
  width: 500,
  height: 340,
  color: "#d7263d",
  strokeWidth: 4,
  plane: {
    gridColor: "#dbeafe",
    axisColor: "#172554"
  }
}));`,
    build: () => functionPlot(x => x * x, {
      xDomain: [-3, 3], yDomain: [-1, 9], width: 500, height: 340,
      color: "#d7263d", strokeWidth: 4,
      plane: { gridColor: "#dbeafe", axisColor: "#172554" },
    }),
    render: render("A high contrast red parabola on a blue coordinate plane"),
  },
  {
    id: "math-plot-spike-series",
    title: "A complete graph without pixel calculations",
    description: "The series describes the data shape; plot owns the axes, labels, units, title, clipping, and spacing.",
    source: `const searches = spikeSeries([
  [0, 2.5, 0.24],
  [1, 3.5, 0.18],
  [2, 8.5, 0.17],
  [3, 1.5, 0.20],
  [4, 2.5, 0.18],
  [5, 3.5, 0.19],
  [6, 8.5, 0.17]
], {
  baseline: 0.5,
  start: 0,
  end: 6.55,
  color: "#168c82",
  strokeWidth: 4
});

draw(plot(searches, {
  title: '"leap year" searches',
  x: { domain: [0, 10.9], step: 1 },
  y: {
    domain: [0, 10],
    step: 1,
    label: "Searches",
    unit: "millions"
  },
  width: 520,
  height: 360,
  axes: {
    gridColor: "#d9d9d9",
    axisColor: "#171717"
  }
}));`,
    build: () => plot(spikeSeries([
      [0, 2.5, 0.24], [1, 3.5, 0.18], [2, 8.5, 0.17], [3, 1.5, 0.20],
      [4, 2.5, 0.18], [5, 3.5, 0.19], [6, 8.5, 0.17],
    ], {
      baseline: 0.5, start: 0, end: 6.55, color: "#168c82", strokeWidth: 4,
    }), {
      title: '"leap year" searches',
      x: { domain: [0, 10.9], step: 1 },
      y: { domain: [0, 10], step: 1, label: "Searches", unit: "millions" },
      width: 520,
      height: 360,
      axes: { gridColor: "#d9d9d9", axisColor: "#171717" },
    }),
    render: render("A teal graph of recurring leap year search spikes with automatic axes title and units", 38),
  },
  {
    id: "math-radial-polygon",
    title: "A regular polygon divided from its center",
    description: "One radial grammar owns the boundary, sectors, spokes, colors, and optional spiked radius profile.",
    source: `draw(radialPolygon(12, {
  radius: 120,
  palette: ["#1598d5", "#ffad2f"],
  stroke: "#172033",
  strokeWidth: 3
}));`,
    build: () => radialPolygon(12, {
      radius: 120,
      palette: ["#1598d5", "#ffad2f"],
      stroke: "#172033",
      strokeWidth: 3,
    }),
    render: render("A twelve-sided polygon divided into alternating blue and orange triangles from its center", 40),
  },
  {
    id: "math-parametric-plot",
    title: "A curve controlled by t",
    description: "Both x and y change with the same parameter, which can draw loops and paths.",
    source: `draw(parametricPlot(
  t => [2 * Math.cos(t), Math.sin(2 * t)],
  {
    tDomain: [0, Math.PI * 2],
    xDomain: [-2.4, 2.4],
    yDomain: [-1.4, 1.4],
    width: 500,
    height: 300,
    color: "#7c2d12",
    strokeWidth: 4,
    plane: { gridColor: "#fed7aa" }
  }
));`,
    build: () => parametricPlot(t => [2 * Math.cos(t), Math.sin(2 * t)], {
      tDomain: [0, Math.PI * 2], xDomain: [-2.4, 2.4], yDomain: [-1.4, 1.4],
      width: 500, height: 300, color: "#7c2d12", strokeWidth: 4,
      plane: { gridColor: "#fed7aa" },
    }),
    render: render("A brown figure-eight parametric curve on a pale orange coordinate plane"),
  },
  {
    id: "math-scatter-plot",
    title: "A scatter plot with meaningful colors",
    description: "Each dot represents one observation; position shows its two measured values.",
    source: `const observations = [
  { x: 1, y: 2, group: "A" },
  { x: 2, y: 3.2, group: "A" },
  { x: 3, y: 2.7, group: "A" },
  { x: 3.4, y: 4.5, group: "B" },
  { x: 4.2, y: 5.1, group: "B" },
  { x: 5, y: 4.7, group: "B" }
];

draw(scatterPlot(observations, {
  radius: 7,
  colorAccessor: point =>
    point.group === "A" ? "#006d77" : "#c1121f",
  plane: { gridColor: "#dbeafe" }
}));`,
    build: () => {
      const observations = [
        { x: 1, y: 2, group: "A" }, { x: 2, y: 3.2, group: "A" },
        { x: 3, y: 2.7, group: "A" }, { x: 3.4, y: 4.5, group: "B" },
        { x: 4.2, y: 5.1, group: "B" }, { x: 5, y: 4.7, group: "B" },
      ];
      return scatterPlot(observations, {
        radius: 7,
        colorAccessor: item => item.group === "A" ? "#006d77" : "#c1121f",
        plane: { gridColor: "#dbeafe" },
      });
    },
    render: render("Six scatter plot points in teal and red showing two groups"),
  },
  {
    id: "math-fraction-bar",
    title: "Five eighths as equal strips",
    description: "The whole bar is split into eight equal cells and five are filled.",
    source: `draw(fractionBar(5, 8, {
  width: 480,
  height: 72,
  fill: "#f97316",
  emptyFill: "#fff7ed",
  stroke: "#7c2d12",
  strokeWidth: 3
}));`,
    build: () => fractionBar(5, 8, {
      width: 480, height: 72, fill: "#f97316", emptyFill: "#fff7ed",
      stroke: "#7c2d12", strokeWidth: 3,
    }),
    render: render("A bar split into eight equal parts with five orange parts filled"),
  },
  {
    id: "math-fraction-circle",
    title: "Three quarters of a circle",
    description: "Every slice has the same angle, so the colored area shows the fraction fairly.",
    source: `draw(fractionCircle(3, 4, {
  radius: 110,
  fill: "#0284c7",
  emptyFill: "#e0f2fe",
  stroke: "#0c4a6e",
  strokeWidth: 3
}));`,
    build: () => fractionCircle(3, 4, {
      radius: 110, fill: "#0284c7", emptyFill: "#e0f2fe",
      stroke: "#0c4a6e", strokeWidth: 3,
    }),
    render: render("A circle divided into four equal slices with three blue slices filled"),
  },
  {
    id: "math-fraction-pie",
    title: "Seven fifths as colored slices",
    description: "Improper fractions automatically continue into another whole circle.",
    source: `draw(fractionPie(7, 5, {
  radius: 76,
  gap: 30,
  palette: ["#dc2626", "#2563eb", "#059669", "#ca8a04", "#7c3aed"],
  emptyFill: "#f1f5f9",
  stroke: "#111827",
  strokeWidth: 2
}));`,
    build: () => fractionPie(7, 5, {
      radius: 76, gap: 30,
      palette: ["#dc2626", "#2563eb", "#059669", "#ca8a04", "#7c3aed"],
      emptyFill: "#f1f5f9", stroke: "#111827", strokeWidth: 2,
    }),
    render: render("Two circles divided into fifths representing seven fifths with distinct selected colors"),
  },
  {
    id: "math-bar-chart",
    title: "Compare categories with bars",
    description: "A taller bar means a larger value, and the baseline keeps the comparison honest.",
    source: `draw(barChart([
  { label: "Red", value: 8, color: "#dc2626" },
  { label: "Blue", value: 13, color: "#2563eb" },
  { label: "Green", value: 6, color: "#059669" },
  { label: "Gold", value: 10, color: "#ca8a04" }
], {
  width: 500,
  height: 300,
  gap: 22,
  gridColor: "#dbeafe",
  axisColor: "#172554"
}));`,
    build: () => barChart([
      { label: "Red", value: 8, color: "#dc2626" },
      { label: "Blue", value: 13, color: "#2563eb" },
      { label: "Green", value: 6, color: "#059669" },
      { label: "Gold", value: 10, color: "#ca8a04" },
    ], { width: 500, height: 300, gap: 22, gridColor: "#dbeafe", axisColor: "#172554" }),
    render: render("A four category bar chart with red blue green and gold bars", 44),
  },
  {
    id: "math-histogram",
    title: "See how values are distributed",
    description: "A histogram counts how many measurements fall inside each numeric interval.",
    source: `const scores = [
  42, 48, 51, 55, 57, 61, 62, 64, 67, 68,
  71, 72, 73, 76, 79, 81, 84, 88, 91, 96
];

draw(histogram(scores, {
  bins: [40, 50, 60, 70, 80, 90, 100],
  width: 520,
  height: 300,
  color: "#7c3aed",
  values: true,
  formatter: bin => bin.min + "-" + bin.max,
  gridColor: "#e9d5ff"
}));`,
    build: () => histogram([
      42, 48, 51, 55, 57, 61, 62, 64, 67, 68,
      71, 72, 73, 76, 79, 81, 84, 88, 91, 96,
    ], {
      bins: [40, 50, 60, 70, 80, 90, 100], width: 520, height: 300,
      color: "#7c3aed", values: true,
      formatter: bin => bin.min + "-" + bin.max,
      gridColor: "#e9d5ff",
    }),
    render: render("A purple histogram of twenty scores grouped in ten point intervals", 44),
  },
  {
    id: "math-box-plot",
    title: "Compare two data spreads",
    description: "The box shows the middle half, the center line is the median, and dots are outliers.",
    source: `draw(boxPlot([
  {
    label: "Class A",
    values: [42, 55, 58, 61, 63, 65, 69, 72, 98],
    color: "#0891b2"
  },
  {
    label: "Class B",
    values: [48, 52, 57, 60, 66, 71, 75, 79, 83],
    color: "#ea580c"
  }
], {
  domain: [35, 105],
  width: 500
}));`,
    build: () => boxPlot([
      { label: "Class A", values: [42, 55, 58, 61, 63, 65, 69, 72, 98], color: "#0891b2" },
      { label: "Class B", values: [48, 52, 57, 60, 66, 71, 75, 79, 83], color: "#ea580c" },
    ], { domain: [35, 105], width: 500 }),
    render: render("Two horizontal box plots comparing Class A and Class B including one outlier", 58),
  },
  {
    id: "math-pie-chart",
    title: "Show parts of one total",
    description: "Every sector uses an angle proportional to its value; together they make one whole.",
    source: `draw(pieChart([
  { label: "Study", value: 8, color: "#1d4ed8" },
  { label: "Sleep", value: 9, color: "#7e22ce" },
  { label: "Play", value: 4, color: "#c2410c" },
  { label: "Other", value: 3, color: "#047857" }
], {
  radius: 125,
  fontSize: 14,
  strokeWidth: 3,
  labelRadius: 80
}));`,
    build: () => pieChart([
      { label: "Study", value: 8, color: "#1d4ed8" },
      { label: "Sleep", value: 9, color: "#7e22ce" },
      { label: "Play", value: 4, color: "#c2410c" },
      { label: "Other", value: 3, color: "#047857" },
    ], { radius: 125, fontSize: 14, strokeWidth: 3, labelRadius: 80 }),
    render: render("A high contrast pie chart dividing a day into study sleep play and other"),
  },
  {
    id: "math-venn-diagram",
    title: "Find what two sets share",
    description: "The overlap belongs to both circles; here the number 2 is both even and prime.",
    source: `draw(vennDiagram([
  { label: "Even", color: "#0284c7" },
  { label: "Prime", color: "#f97316" }
], {
  radius: 100,
  separation: 92,
  opacity: 0.5,
  centerLabel: "2",
  fontSize: 18,
  labelColor: "#111827"
}));`,
    build: () => vennDiagram([
      { label: "Even", color: "#0284c7" }, { label: "Prime", color: "#f97316" },
    ], { radius: 100, separation: 92, opacity: 0.5, centerLabel: "2", fontSize: 18, labelColor: "#111827" }),
    render: render("Two overlapping blue and orange circles labelled Even and Prime with 2 in their overlap"),
  },
  {
    id: "math-probability-tree",
    title: "Follow every possible outcome",
    description: "Read from left to right; each branch adds a choice and its probability.",
    source: `draw(probabilityTree({
  label: "Start",
  children: [
    {
      label: "Heads",
      probability: "1/2",
      color: "#0369a1",
      children: [
        { label: "Heads", probability: "1/2" },
        { label: "Tails", probability: "1/2" }
      ]
    },
    {
      label: "Tails",
      probability: "1/2",
      color: "#c2410c",
      children: [
        { label: "Heads", probability: "1/2" },
        { label: "Tails", probability: "1/2" }
      ]
    }
  ]
}, {
  columnGap: 170,
  rowGap: 70,
  edgeColor: "#334155"
}));`,
    build: () => probabilityTree({
      label: "Start",
      children: [
        { label: "Heads", probability: "1/2", color: "#0369a1", children: [
          { label: "Heads", probability: "1/2" }, { label: "Tails", probability: "1/2" },
        ] },
        { label: "Tails", probability: "1/2", color: "#c2410c", children: [
          { label: "Heads", probability: "1/2" }, { label: "Tails", probability: "1/2" },
        ] },
      ],
    }, { columnGap: 170, rowGap: 70, edgeColor: "#334155" }),
    render: render("A two-stage coin toss probability tree with heads and tails branches", 46),
  },
  {
    id: "math-polygon-diagram",
    title: "Describe a polygon by its mathematical meaning",
    description: "The helper owns regular layout, label placement, equality ticks, angle arcs, and the extended side.",
    source: `draw(polygonDiagram(5, {
  radius: 125,
  vertexLabels: ["A", "B", "C", "D", "E"],
  sideLabels: { AB: "a", BC: "b", DE: "d" },
  angleMarks: { A: "x", C: { count: 2, label: "y" } },
  sideMarks: { AB: 1, BC: 1, CD: 2 },
  parallelMarks: { DE: 1 },
  extensions: [
    { side: "EA", after: 55, afterLabel: "F" }
  ],
  fill: "#fef3c7",
  stroke: "#92400e",
  strokeWidth: 3,
  labelColor: "#111827"
}));`,
    build: () => polygonDiagram(5, {
      radius: 125,
      vertexLabels: ["A", "B", "C", "D", "E"],
      sideLabels: { AB: "a", BC: "b", DE: "d" },
      angleMarks: { A: "x", C: { count: 2, label: "y" } },
      sideMarks: { AB: 1, BC: 1, CD: 2 },
      parallelMarks: { DE: 1 },
      extensions: [{ side: "EA", after: 55, afterLabel: "F" }],
      fill: "#fef3c7", stroke: "#92400e", strokeWidth: 3,
      labelColor: "#111827",
    }),
    render: render("A labelled gold pentagon with side ticks, angle arcs, a parallel mark, and one extended side", 46),
  },
  {
    id: "math-triangle-diagram",
    title: "Construct a triangle without calculating coordinates",
    description: "Three side lengths determine the exact shape; equal-side and right-angle marks are inferred automatically.",
    source: `draw(triangleDiagram({
  lengths: [3, 4, 5],
  vertexLabels: ["A", "B", "C"],
  sideLabels: true,
  angleMarks: { A: "x" },
  extensions: [
    { side: "AB", after: 65, afterLabel: "D" }
  ],
  fill: "#dbeafe",
  stroke: "#1e40af",
  strokeWidth: 4,
  labelColor: "#111827"
}));`,
    build: () => triangleDiagram({
      lengths: [3, 4, 5],
      vertexLabels: ["A", "B", "C"],
      sideLabels: true,
      angleMarks: { A: "x" },
      extensions: [{ side: "AB", after: 65, afterLabel: "D" }],
      fill: "#dbeafe", stroke: "#1e40af", strokeWidth: 4,
      labelColor: "#111827",
    }),
    render: render("A constructed three-four-five triangle with labels, an angle arc, a right-angle mark, and an extended base", 50),
  },
  {
    id: "math-right-triangle",
    title: "A labelled right triangle",
    description: "The small square marks a 90 degree corner and the long sloping side is the hypotenuse.",
    source: `draw(rightTriangle(3, 4, {
  scale: 54,
  fill: "#fef3c7",
  stroke: "#92400e",
  strokeWidth: 4,
  aLabel: "3 cm",
  bLabel: "4 cm",
  cLabel: "5 cm",
  fontSize: 17
}));`,
    build: () => rightTriangle(3, 4, {
      scale: 54, fill: "#fef3c7", stroke: "#92400e", strokeWidth: 4,
      aLabel: "3 cm", bLabel: "4 cm", cLabel: "5 cm", fontSize: 17,
    }),
    render: render("A gold three four five right triangle with a right angle marker and side labels", 46),
  },
  {
    id: "math-pythagoras",
    title: "See the Pythagorean theorem",
    description: "The area of the two smaller squares adds to the area of the largest square.",
    source: `draw(pythagoras(3, 4, {
  scale: 42,
  palette: ["#2563eb", "#059669", "#f59e0b"],
  stroke: "#111827",
  strokeWidth: 3,
  squareOpacity: 0.72,
  aSquareLabel: "3 x 3",
  bSquareLabel: "4 x 4",
  cSquareLabel: "5 x 5"
}));`,
    build: () => pythagoras(3, 4, {
      scale: 42, palette: ["#2563eb", "#059669", "#f59e0b"],
      stroke: "#111827", strokeWidth: 3, squareOpacity: 0.72,
      aSquareLabel: "3 x 3", bSquareLabel: "4 x 4", cSquareLabel: "5 x 5",
    }),
    render: render("A three four five right triangle with a blue green and gold square constructed on its sides", 50),
  },
  {
    id: "math-spiral",
    title: "An Archimedean spiral",
    description: "As the angle turns, the radius grows at a steady rate.",
    source: `draw(spiral(4.5, {
  startRadius: 5,
  endRadius: 135,
  samples: 520,
  color: "#be123c",
  strokeWidth: 4,
  clockwise: true,
  growth: "linear"
}));`,
    build: () => spiral(4.5, {
      startRadius: 5, endRadius: 135, samples: 520,
      color: "#be123c", strokeWidth: 4, clockwise: true, growth: "linear",
    }),
    render: render("A high contrast rose colored spiral making four and a half turns"),
  },
  {
    id: "math-sierpinski",
    title: "A recursive Sierpinski triangle",
    description: "The same three-part rule repeats at smaller and smaller scales.",
    source: `draw(sierpinski(4, {
  size: 360,
  palette: ["#1d4ed8", "#dc2626", "#047857"],
  stroke: "#ffffff",
  strokeWidth: 0.8
}));`,
    build: () => sierpinski(4, {
      size: 360, palette: ["#1d4ed8", "#dc2626", "#047857"],
      stroke: "#ffffff", strokeWidth: 0.8,
    }),
    render: render("A recursive Sierpinski triangle made from blue red and green small triangles"),
  },
  {
    id: "math-cell-grid-basic",
    title: "Start with a clean grid",
    description: "Rows run across, columns run down, and every cell receives a zero-based address.",
    source: `draw(cellGrid({
  rows: 3,
  columns: 5,
  cellWidth: 72,
  cellHeight: 58,
  background: "#f8fafc",
  gridStroke: "#2563eb",
  gridWidth: 2,
  borderStroke: "#172554",
  borderWidth: 4
}));`,
    build: () => cellGrid({
      rows: 3, columns: 5, cellWidth: 72, cellHeight: 58,
      background: "#f8fafc", gridStroke: "#2563eb", gridWidth: 2,
      borderStroke: "#172554", borderWidth: 4,
    }),
    render: render("A three row by five column rectangular blue grid"),
  },
  {
    id: "math-cell-grid-diagonals",
    title: "Generate diagonals with a rule",
    description: "The callback visits every cell and chooses a rising or falling diagonal.",
    source: `draw(cellGrid({
  rows: 5,
  columns: 5,
  cellSize: 58,
  diagonals: cell =>
    (cell.column + cell.row) % 2 === 0 ? "\\\\" : "/",
  diagonalStroke: "#c1121f",
  diagonalWidth: 3,
  gridStroke: "#1d4ed8",
  borderStroke: "#111827"
}));`,
    build: () => cellGrid({
      rows: 5, columns: 5, cellSize: 58,
      diagonals: cell => (cell.column + cell.row) % 2 === 0 ? "\\" : "/",
      diagonalStroke: "#c1121f", diagonalWidth: 3,
      gridStroke: "#1d4ed8", borderStroke: "#111827",
    }),
    render: render("A five by five blue grid containing alternating red diagonals"),
  },
  {
    id: "math-cell-grid-count",
    title: "Shade a row-major count",
    description: "The first 37 cells are filled from left to right, then top to bottom.",
    source: `draw(cellGrid({
  rows: 10,
  columns: 10,
  cellSize: 30,
  shadedCells: 37,
  highlightFill: "#f97316",
  gridStroke: "#7c2d12",
  gridWidth: 1,
  borderStroke: "#431407",
  borderWidth: 3
}));`,
    build: () => cellGrid({
      rows: 10, columns: 10, cellSize: 30, shadedCells: 37,
      highlightFill: "#f97316", gridStroke: "#7c2d12", gridWidth: 1,
      borderStroke: "#431407", borderWidth: 3,
    }),
    render: render("A ten by ten hundred grid with the first thirty seven cells shaded orange"),
  },
  {
    id: "math-cell-grid-addresses",
    title: "Shade cells by address",
    description: "Use [column, row] addresses to choose exact cells and give each one a color.",
    source: `draw(cellGrid({
  rows: 4,
  columns: 6,
  cellSize: 52,
  shadedCells: [
    [0, 0, "#dc2626"],
    [2, 1, "#2563eb"],
    [4, 2, "#059669"],
    { column: 5, row: 3, fill: "#f59e0b" }
  ],
  gridStroke: "#475569",
  borderStroke: "#111827"
}));`,
    build: () => cellGrid({
      rows: 4, columns: 6, cellSize: 52,
      shadedCells: [[0, 0, "#dc2626"], [2, 1, "#2563eb"], [4, 2, "#059669"], { column: 5, row: 3, fill: "#f59e0b" }],
      gridStroke: "#475569", borderStroke: "#111827",
    }),
    render: render("A four by six grid with four addressed cells highlighted red blue green and gold"),
  },
  {
    id: "math-cell-grid-predicate",
    title: "Shade cells with a test",
    description: "A predicate is a small rule; true cells are painted and false cells stay empty.",
    source: `draw(cellGrid({
  rows: 7,
  columns: 7,
  cellSize: 42,
  shadedCells: cell => {
    if (cell.column === cell.row) return "#dc2626";
    if (cell.column + cell.row === 6) return "#2563eb";
    return false;
  },
  gridStroke: "#64748b",
  borderStroke: "#111827"
}));`,
    build: () => cellGrid({
      rows: 7, columns: 7, cellSize: 42,
      shadedCells: cell => {
        if (cell.column === cell.row) return "#dc2626";
        if (cell.column + cell.row === 6) return "#2563eb";
        return false;
      },
      gridStroke: "#64748b", borderStroke: "#111827",
    }),
    render: render("A seven by seven grid with intersecting red and blue diagonals made from shaded cells"),
  },
  {
    id: "math-cell-grid-triangles",
    title: "Shade half of selected cells",
    description: "Choose the corner that belongs to the triangular half you want to color.",
    source: `draw(cellGrid({
  rows: 4,
  columns: 4,
  cellSize: 68,
  diagonals: cell =>
    cell.column < 2 ? "\\\\" : "/",
  shadedTriangles: [
    [0, 0, "nw", "#dc2626"],
    [2, 0, "ne", "#2563eb"],
    [1, 2, "se", "#059669"],
    [3, 3, "sw", "#f59e0b"]
  ],
  stroke: "#111827",
  strokeWidth: 2
}));`,
    build: () => cellGrid({
      rows: 4, columns: 4, cellSize: 68,
      diagonals: cell => cell.column < 2 ? "\\" : "/",
      shadedTriangles: [[0, 0, "nw", "#dc2626"], [2, 0, "ne", "#2563eb"], [1, 2, "se", "#059669"], [3, 3, "sw", "#f59e0b"]],
      stroke: "#111827", strokeWidth: 2,
    }),
    render: render("A four by four diagonal grid with four triangular halves highlighted in distinct colors"),
  },
  {
    id: "math-cell-grid-content",
    title: "Place semantic content in cells",
    description: "The geometry callback gives exact centers, corners, edges, and placement helpers.",
    source: `draw(cellGrid({
  rows: 3,
  columns: 5,
  cellSize: 64,
  background: "#f8fafc",
  content: grid => [
    grid.cell(0, 0).place(
      text("A", 24).fill("#172554").fontWeight(700)
    ),
    grid.cell(2, 1).place(
      circle(13).fill("#dc2626").stroke("none", 0)
    ),
    line(
      grid.cell(1, 2).corner("nw"),
      grid.cell(4, 0).corner("se")
    ).stroke("#047857", 5)
  ],
  gridStroke: "#2563eb",
  borderStroke: "#111827"
}));`,
    build: () => cellGrid({
      rows: 3, columns: 5, cellSize: 64, background: "#f8fafc",
      content: grid => [
        grid.cell(0, 0).place(text("A", 24).fill("#172554").fontWeight(700)),
        grid.cell(2, 1).place(circle(13).fill("#dc2626").stroke("none", 0)),
        line(grid.cell(1, 2).corner("nw"), grid.cell(4, 0).corner("se")).stroke("#047857", 5),
      ],
      gridStroke: "#2563eb", borderStroke: "#111827",
    }),
    render: render("A three by five grid containing the letter A a red dot and a green diagonal annotation"),
  },
  {
    id: "math-cell-grid-rounded",
    title: "Round and clip the grid",
    description: "Rounded borders automatically clip built-in paint so no fill leaks outside.",
    source: `draw(cellGrid({
  rows: 4,
  columns: 6,
  cellSize: 52,
  borderRadius: 22,
  shadedCells: cell =>
    (cell.column + cell.row) % 3 === 0
      ? { fill: "#7c3aed", opacity: 0.88 }
      : false,
  background: "#f5f3ff",
  gridStroke: "#6d28d9",
  borderStroke: "#3b0764",
  borderWidth: 4,
  clipContent: true
}));`,
    build: () => cellGrid({
      rows: 4, columns: 6, cellSize: 52, borderRadius: 22,
      shadedCells: cell => (cell.column + cell.row) % 3 === 0 ? { fill: "#7c3aed", opacity: 0.88 } : false,
      background: "#f5f3ff", gridStroke: "#6d28d9", borderStroke: "#3b0764",
      borderWidth: 4, clipContent: true,
    }),
    render: render("A rounded purple four by six grid with a repeating pattern of shaded cells"),
  },
]);

export default mathApiExampleDefinitions;
