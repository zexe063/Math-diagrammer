# Custom semantic cell grid

This recipe shows a path on a board without manually calculating grid pixels.

<DiagramExample id="recipe-custom-cell-grid" :show-code="false" :show-caption="false" />

```js
const route = [
  [0, 3],
  [1, 3],
  [1, 2],
  [2, 2],
  [3, 2],
  [3, 1],
  [4, 1],
  [5, 1],
  [5, 0]
];

const board = cellGrid({
  rows: 4,
  columns: 6,
  cellSize: 64,
  shadedCells: [
    [2, 0, { fill: "#fef3c7", opacity: 0.9 }],
    [4, 3, { fill: "#fee2e2", opacity: 0.9 }]
  ],
  content: grid => {
    const routePoints = route.map(([column, row]) =>
      grid.center(column, row)
    );

    return [
      polyline(routePoints)
        .fill("none")
        .stroke("#7567ef", 7),
      ...routePoints.map(position =>
        dot(5).fill("#ffffff").stroke("#7567ef", 3).translate(position)
      ),
      grid.place(0, 3, text("S", 20).fill("#352c82").fontWeight(700)),
      grid.place(5, 0, text("F", 20).fill("#352c82").fontWeight(700))
    ];
  },
  stroke: "#64748b",
  strokeWidth: 1.5,
  borderWidth: 3,
  borderRadius: 8
});

draw(column(22, [
  text("Follow the route", 28).fill("#26344d").fontWeight(700),
  board
]));
```

The route is lesson data written as cell addresses. `content(grid)` translates
that semantic data into exact points and placements.
