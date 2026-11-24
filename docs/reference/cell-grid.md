# `cellGrid()`

`cellGrid()` builds an addressable rectangular grid and returns a normal `Diagram`. Use it for hundred grids, multiplication arrays, mosaics, shaded fractions, board diagrams, cell puzzles, coordinate tasks, and lesson-specific geometric patterns.

```js
cellGrid(options = {})
```

The most important idea is the **cell address**:

```text
[column, row]
```

Columns count from left to right. Rows count from top to bottom. Both begin at `0`, because that is how JavaScript arrays are indexed.

```text
             column
          0     1     2
row 0   [0,0] [1,0] [2,0]
row 1   [0,1] [1,1] [2,1]
```

## 1. Build a basic grid

Give the grid a row count, a column count, and a cell size.

<DiagramExample id="math-cell-grid-basic" />

### Dimensions

| Option | Default | What it changes |
| --- | --- | --- |
| `rows` | inferred if possible | Positive **integer** number of horizontal cell rows. |
| `columns` / `cols` | inferred if possible | Positive **integer** number of vertical cell columns. `cols` is an alias. |
| `cellSize` | `56` | Shared cell width and height. |
| `cellWidth` | `cellSize` or `56` | Cell width; overrides the shared size. |
| `cellHeight` | `cellSize` or `56` | Cell height; overrides the shared size. |

When `diagonals` is a matrix, rows and columns can be inferred from that matrix. Otherwise both dimensions are required.

### Paint and lines

| Option | Default | What it changes |
| --- | --- | --- |
| `background` / `fill` | `"#ffffff"` | Interior background. |
| `highlightFill` / `accent` | `"#a97aee"` | Default shading color. |
| `stroke` | `"#171717"` | Shared fallback line color. |
| `strokeWidth` | `2` | Shared fallback line thickness. |
| `gridStroke` | `stroke` | Interior grid-line color. |
| `gridWidth` | `strokeWidth` | Interior grid-line thickness. |
| `diagonalStroke` | `stroke` | Cell-diagonal color. |
| `diagonalWidth` | `strokeWidth` | Cell-diagonal thickness. |
| `borderStroke` | `stroke` | Outer-border color. |
| `borderWidth` | at least `3` | Outer-border thickness. |
| `borderRadius` | `0` | Corner roundness. |
| `gridLines` | `true` | Set `false` to hide interior grid lines. |
| `border` | `true` | Set `false` to hide the final outer border. |

A width of `0` disables that line family. Widths and radius cannot be negative.

## 2. Add diagonals

A **falling** diagonal goes from northwest to southeast and looks like `\`. A **rising** diagonal goes from northeast to southwest and looks like `/`.

<DiagramExample id="math-cell-grid-diagonals" />

The `diagonals` option accepts either a rectangular matrix or a callback rule.

### Matrix form

```js
cellGrid({
  diagonals: [
    ["\\", "\\", "/"],
    ["/", null, "\\"]
  ]
})
```

Here the matrix itself defines `2` rows and `3` columns.

### Callback form

```js
cellGrid({
  rows: 6,
  columns: 6,
  diagonals: cell =>
    (cell.column + cell.row) % 2 === 0 ? "\\" : "/"
})
```

Accepted callback or matrix values:

| Value | Meaning |
| --- | --- |
| `"\\"` or `"falling"` | Northwest to southeast. |
| `"/"` or `"rising"` | Northeast to southwest. |
| `null`, `false`, or `""` | No diagonal in this cell. |

## 3. Shade the first N cells

A numeric `shadedCells` value fills cells in **row-major order**: left to right across the first row, then left to right across the next row.

<DiagramExample id="math-cell-grid-count" />

This is perfect for hundred-grid percentages:

```js
// 37 of 100 cells means 37%.
cellGrid({
  rows: 10,
  columns: 10,
  shadedCells: 37
})
```

The count must be from `0` through `rows * columns`.

## 4. Shade exact addresses

Use an array when you already know the exact cells. Each address can also carry a custom paint.

<DiagramExample id="math-cell-grid-addresses" />

```js
shadedCells: [
  [0, 0],
  [1, 0, "#2563eb"],
  { column: 2, row: 1, fill: "#059669", opacity: 0.7 }
]
```

- `[column, row]` uses `highlightFill`.
- `[column, row, color]` supplies a color.
- `[column, row, { fill, color, opacity }]` supplies a style object; `color` is an alias of `fill`.
- The object form supplies `fill`/`color` and `opacity`.
- `opacity` is from `0` (invisible) to `1` (solid).

## 5. Shade with a rule

A callback can test every cell. This is much shorter than listing addresses for a repeating pattern.

<DiagramExample id="math-cell-grid-predicate" />

```js
shadedCells: cell => {
  if (cell.column === cell.row) return "#dc2626";
  if (cell.column + cell.row < 4) {
    return { fill: "#2563eb", opacity: 0.65 };
  }
  return false;
}
```

Callback results mean:

| Return value | Result |
| --- | --- |
| `false`, `null`, `undefined`, `0`, `""` | Leave the cell empty. |
| `true` | Use `highlightFill`. |
| A color string | Fill with that color. |
| `{ fill, color, opacity }` | Use detailed paint controls; `color` aliases `fill`. |

## 6. Shade triangular half-cells

`shadedTriangles` colors the half-cell that contains a chosen corner.

<DiagramExample id="math-cell-grid-triangles" />

```js
shadedTriangles: [
  [0, 0, "nw"],
  [1, 0, "ne", "#2563eb"],
  [2, 0, "se", { fill: "#f97316", opacity: 0.7 }],
  { column: 2, row: 1, corner: "se", fill: "#059669" }
]
```

Tuple entries may use a color string or a style object in the fourth position: `[column, row, corner, { fill, color, opacity }]`. Direct object entries also accept `color` as an alias of `fill` and `opacity` from `0` to `1`.

### Corner names

| Short name | Meaning | Common aliases |
| --- | --- | --- |
| `nw` | northwest / top-left | `northwest`, `north-west`, `topleft`, `top-left` |
| `ne` | northeast / top-right | `northeast`, `north-east`, `topright`, `top-right` |
| `se` | southeast / bottom-right | `southeast`, `south-east`, `bottomright`, `bottom-right` |
| `sw` | southwest / bottom-left | `southwest`, `south-west`, `bottomleft`, `bottom-left` |

The parser also accepts the same names with spaces or underscores, such as `"top left"` and `"top_left"`.

For example, the `nw` half uses the northwest, northeast, and southwest corners. Its boundary contains a rising `/` diagonal.

## 7. Place diagrams inside the grid

`content` adds semantic DSL diagrams above the background, shading, grid lines, and diagonals. The final border stays on top so the outer edge remains crisp.

<DiagramExample id="math-cell-grid-content" />

`content` may be:

- one `Diagram`;
- nested arrays of diagrams; or
- a callback that receives grid geometry.

Falsy items are ignored. Any truthy item that is not a `Diagram` produces an intentional authoring error.

### Grid geometry

```text
grid.rows
grid.columns
grid.width
grid.height
grid.cellWidth
grid.cellHeight

grid.vertex(column, row) -> Point
grid.point(column, row)  -> Point (alias)
grid.center(column, row) -> Point
grid.corners(column, row) -> { nw, ne, se, sw }
grid.cell(column, row) -> CellGeometry
grid.place(column, row, diagram, sourceAnchor = "center") -> Diagram
```

Vertices are the line intersections. Their valid column range is `0...columns` and row range is `0...rows`, including the outer boundary. Cells stop one earlier because a 3-column grid has cells `0`, `1`, and `2`.

```js
content: grid => [
  // Place a label at one cell center.
  grid.place(1, 0, text("A", 20)),

  // Draw between two grid vertices.
  line(grid.vertex(0, 0), grid.vertex(3, 2))
    .stroke("#dc2626", 3)
]
```

### Cell geometry

Every `grid.cell(column, row)` result contains:

```text
cell.column
cell.row
cell.width
cell.height
cell.center
cell.corners              // { nw, ne, se, sw }

cell.corner(name)         -> Point
cell.triangle(corner)     -> frozen Point[]
cell.diagonal(direction)  -> frozen [Point, Point]
cell.edge(side)           -> frozen [Point, Point]
cell.place(diagram, sourceAnchor = "center") -> Diagram
```

`edge()` accepts `top`, `right`, `bottom`, and `left`, plus compass aliases `n`/`north`, `e`/`east`, `s`/`south`, and `w`/`west`.

All geometry objects and returned corner/edge/triangle arrays are frozen. `grid.place()` and `cell.place()` require a Diagram and throw a `TypeError` otherwise. Vertex addresses include the outer boundary; cell addresses do not.

## 8. Rounded grids and clipping

Rounded borders clip built-in background, shading, lines, and diagonals automatically.

<DiagramExample id="math-cell-grid-rounded" />

Custom `content` is clipped when:

- `clipContent: true` on any grid; or
- `borderRadius > 0` and `clipContent` is not explicitly `false`.

```js
cellGrid({
  rows: 4,
  columns: 6,
  borderRadius: 20,
  clipContent: true
})
```

Set `clipContent: false` when an annotation should intentionally extend beyond a rounded grid. Set `border: false` to remove the border without removing or reordering the interior.

## Layer order

Understanding the fixed layer order makes custom designs predictable:

```text
final border                    top
custom content
diagonals
interior grid lines
triangular and whole-cell fills
background                     bottom
```

## Common patterns

### Checkerboard

```js
cellGrid({
  rows: 8,
  columns: 8,
  shadedCells: cell =>
    (cell.column + cell.row) % 2 === 0 ? "#111827" : false
})
```

### Multiplication array

```js
cellGrid({
  rows: 3,
  columns: 4,
  cellSize: 48,
  shadedCells: 12,
  highlightFill: "#2563eb"
})
```

### Mark one cell

```js
cellGrid({
  rows: 5,
  columns: 5,
  shadedCells: [[3, 2, "#dc2626"]]
})
```

## Validation is teaching feedback

`cellGrid()` rejects invalid option types, missing or non-positive dimensions, negative stroke widths, non-rectangular diagonal matrices, unknown diagonal/corner/side names, out-of-range addresses, and non-diagram content.

More precisely, dimensions and addresses must be integers; dimensions are inferred from a rectangular `diagonals` matrix when provided, and an explicit `rows`/`columns` pair must match that matrix exactly. Fill opacity must be between `0` and `1`. `content` is flattened recursively and every truthy item must be a Diagram.

These messages protect precision. If an address says `[5, 2]` in a 5-column grid, the error reminds you that valid cell columns are `0` through `4`.
