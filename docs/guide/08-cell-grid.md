# Semantic cell grids

`cellGrid()` is for diagrams whose meaning is naturally expressed with rows,
columns, cells, corners, and edges. It owns the pixel coordinates so lesson code
can describe mathematical structure.

Rows start at the top. Columns start at the left. Cell addresses are written as
`[column, row]`.

## A hundred grid

```js
draw(column(22, [
  text("37 out of 100", 26).fill("#26344d").fontWeight(600),
  cellGrid({
    rows: 10,
    columns: 10,
    cellSize: 30,
    shadedCells: 37,
    highlightFill: "#4fc4d0",
    stroke: "#34425a",
    strokeWidth: 1.3,
    borderWidth: 2.8,
    borderRadius: 5
  })
]));
```

A numeric `shadedCells` value fills cells in row-major order. You can also pass
addresses or a predicate:

```js
draw(cellGrid({
  rows: 5,
  columns: 7,
  cellSize: 48,
  shadedCells: cell =>
    (cell.column + cell.row) % 2 === 0
      ? { fill: "#ddd6fe", opacity: 0.9 }
      : false,
  stroke: "#64748b",
  borderRadius: 6
}));
```

## Cell diagonals and triangular regions

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
  cellSize: 76,
  highlightFill: "#a97aee",
  stroke: "#171717",
  strokeWidth: 2,
  borderWidth: 3,
  borderRadius: 4
}));
```

Diagonal values are `"\\"`, `"/"`, `"falling"`, `"rising"`, or `null`.
Triangle corners are `"nw"`, `"ne"`, `"se"`, and `"sw"`.

## Custom semantic content

The `content(grid)` callback exposes geometry without leaking layout arithmetic:

```js
draw(cellGrid({
  rows: 3,
  columns: 5,
  cellSize: 70,
  shadedCells: [[1, 1, "#e0f2fe"], [2, 1, "#e0f2fe"]],
  content: grid => [
    grid.cell(0, 0).place(text("A", 22).fill("#5647ca")),
    grid.place(4, 2, circle(11).fill("#ef7187").stroke("none", 0)),
    line(
      grid.cell(1, 0).corner("nw"),
      grid.cell(3, 2).corner("se")
    ).stroke("#0891b2", 4)
  ],
  stroke: "#526079",
  borderRadius: 5
}));
```

Available geometry:

- `grid.vertex(column, row)` and `grid.center(column, row)`
- `grid.cell(column, row)` and `grid.corners(column, row)`
- `cell.corner(name)`, `cell.edge(side)`, `cell.diagonal(direction)`
- `cell.triangle(corner)`
- `cell.place(diagram)` and `grid.place(column, row, diagram)`

Rounded grids clip built-in content. Set `clipContent: false` to let custom
annotations extend outside, or `clipContent: true` to explicitly clip a square
grid. Set `border: false` or `gridLines: false` when the lesson needs only the
semantic positioning system.
