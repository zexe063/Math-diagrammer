# Math Diagrammer

Math Diagrammer is a compositional JavaScript DSL for producing deterministic,
standalone SVG mathematics diagrams.

```js
import { circle, column, draw, row, text } from "./src/index.js";

const lenses = row(24, [
  circle(60).fill("#60a5fa").opacity(0.75),
  circle(60).fill("#34d399").opacity(0.75),
]);

draw(column(28, [text("Set intersection", 24), lenses]));
```

## Commands

```text
npm install
npm test
npm run dev
npm run build
```

Open the studio with `npm run dev`, then visit the local URL printed by Vite.
Choose an example, edit the JavaScript DSL, and use **Export SVG** to download
the current standalone diagram.

## Documentation

The full learning site lives in `docs/` and is powered by VitePress. It includes
a twelve-chapter guided course, complete diagram recipes, local search, rendered
SVG examples, and reference coverage for every public export.

```text
npm run docs:dev      # documentation development server on port 5175
npm run docs:build    # production documentation build
npm run docs:preview  # preview the production build on port 4175
```

Documentation examples are rendered by the real engine during the build. No
JavaScript evaluator or diagram compiler is shipped to documentation readers.

The authoring application is in `app/`. The public engine API is exported from
`src/index.js`, while higher-level mathematical components are exported from
`src/math/index.js`.

## Primitive API

The public JavaScript DSL includes:

- geometry: `point`, `vector`, `polar`, `pen`, `path`, `line`, `polyline`;
- shapes: `circle`, `ellipse`, `rectangle`, `roundedRect`, `polygon`,
  `regularPolygon`, `triangle`, `arc`, `sector`, `ring`;
- composition: `stack`, `row`, `column`, `grid`, `beside`, `align`, `pad`,
  `frame`, `strut`, `place`;
- annotations: `text`, `math`, `label`, `tick`, `arrow`, `connect`,
  `arrowBetween`, `angleMark`, `extendLine`, `rightAngleMark`, `sideTicks`,
  `parallelMarks`, `dimensionLine`;
- fluent styling and transforms: `.fill()`, `.stroke()`, `.opacity()`,
  `.dash()`, `.translate()`, `.rotate()`, `.scale()`, `.clip()`, `.named()`,
  `.withAnchor()`;
- output: `renderSVG`, `draw`, `downloadSvg`.

`overlay` is retained as a deprecated alias of `stack` so existing diagrams
continue to run.

`math(tex, size)` uses MathJax during compilation to embed real TeX glyph
geometry directly into the exported SVG. It does not require a CDN or
`foreignObject` at lesson runtime.

## Authoring toolkits

`cellGrid(options)` is a semantic authoring toolkit. It returns a normal
`Diagram`, but owns grid coordinates so lesson code describes cell
addresses and regions instead of pixel endpoints:

```js
draw(cellGrid({
  diagonals: [
    ["\\", "\\", "/", "/"],
    ["\\", "\\", "/", "/"],
    ["/", "/", "\\", "\\"],
    ["/", "/", "\\", "\\"]
  ],
  shadedTriangles: [
    [2, 0, "nw"],
    [0, 1, "ne"],
    [3, 2, "ne"],
    [1, 3, "nw"]
  ],
  cellSize: 88,
  highlightFill: "#a97aee"
}));
```

Rows start at the top and columns start at the left. Whole-cell shading accepts
an address array, a predicate, or a row-major count:

```js
draw(cellGrid({
  rows: 10,
  columns: 10,
  cellSize: 28,
  shadedCells: 37
}));
```

Unusual marks can use the semantic geometry passed to `content(grid)`:

```js
draw(cellGrid({
  rows: 3,
  columns: 5,
  content: grid => [
    grid.cell(0, 0).place(text("A", 20)),
    line(
      grid.cell(1, 0).corner("nw"),
      grid.cell(4, 2).corner("se")
    )
  ]
}));
```

The semantic callback API is:

- grid geometry: `grid.vertex(column, row)`, `grid.center(column, row)`,
  `grid.corners(column, row)`, and `grid.cell(column, row)`;
- cell geometry: `cell.corner(name)`, `cell.edge(side)`,
  `cell.diagonal(direction)`, and `cell.triangle(corner)`;
- placement: `cell.place(diagram)` or
  `grid.place(column, row, diagram)`.

Custom `content` renders above grid lines and diagonals. Rounded grids clip
content by default; set `clipContent: false` to allow annotations outside
the board, or `clipContent: true` to clip content on a square grid.

## Mathematics components

`src/math/index.js` provides number lines, coordinate planes, function and
parametric plots, fraction bars/circles, histograms, bar/scatter/box/pie charts,
Venn diagrams, probability trees, Pythagorean diagrams, spirals, and Sierpiński
triangles.
