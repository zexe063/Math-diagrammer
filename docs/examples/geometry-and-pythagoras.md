# Geometry and Pythagoras

Place a labeled right triangle beside the theorem's square construction.

<DiagramExample id="recipe-geometry-and-pythagoras" :show-code="false" :show-caption="false" />

```js
const triangleView = column(18, [
  text("3-4-5 triangle", 23).fill("#26344d").fontWeight(700),
  rightTriangle(3, 4, {
    scale: 42,
    fill: "#e0f2fe",
    stroke: "#0369a1",
    strokeWidth: 3,
    aLabel: "3",
    bLabel: "4",
    cLabel: "5",
    fontSize: 17
  })
]);

const squareView = column(18, [
  math(String.raw`a^2 + b^2 = c^2`, 29).fill("#7567ef"),
  pythagoras(3, 4, {
    scale: 30,
    palette: ["#60a5fa", "#34d399", "#fbbf24"],
    stroke: "#334155",
    squareOpacity: 0.58,
    triangleFill: "#ffffff",
    aSquareLabel: "3²",
    bSquareLabel: "4²",
    cSquareLabel: "5²"
  })
]);

draw(column(30, [
  text("Why 3² + 4² = 5²", 31).fill("#26344d").fontWeight(700),
  row(72, [triangleView, squareView], { align: "top" })
]));
```

The two components share the same values but communicate different aspects of
the concept. Composition turns them into a coherent explanation.
