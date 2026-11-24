# Charts and plots

Math helpers return ordinary static `Diagram` values. You can place, style,
scale, or compose them exactly like primitives.

## Number lines and coordinate planes

```js
const axis = numberLine({
  min: -4,
  max: 4,
  step: 1,
  width: 500,
  arrowheads: true,
  color: "#334155",
  tickColor: "#64748b"
});

draw(column(22, [
  text("Integers from -4 to 4", 24).fontWeight(600),
  axis
]));
```

<DiagramExample id="number-line-interval" :show-code="false" />

The accepted canonical form is also `numberLine(-4, 4, options)`.

```js
draw(coordinatePlane({
  xDomain: [-5, 5],
  yDomain: [-4, 4],
  xStep: 1,
  yStep: 1,
  width: 520,
  height: 380,
  gridColor: "#e2e8f0",
  axisColor: "#334155"
}));
```

Use `axes(options)` for the same coordinate system without grid lines.

## Function and parametric plots

```js
draw(functionPlot(
  x => x * x - 2,
  {
    xDomain: [-3, 3],
    yDomain: [-3, 8],
    width: 520,
    height: 380,
    color: "#7567ef",
    strokeWidth: 4,
    plane: { gridColor: "#e2e8f0" }
  }
));
```

```js
draw(parametricPlot(
  t => [3 * Math.cos(t), 2 * Math.sin(t)],
  {
    tDomain: [0, Math.PI * 2],
    xDomain: [-4, 4],
    yDomain: [-3, 3],
    color: "#0891b2",
    strokeWidth: 4
  }
));
```

Choose explicit domains so lesson diagrams stay predictable. Increase `samples`
for unusually detailed curves.

## Statistical charts

```js
const scores = [
  11, 13, 15, 16, 16, 18, 18, 19, 20, 20,
  22, 23, 24, 25, 27, 29, 31, 33, 36, 40
];

draw(histogram(scores, {
  bins: 6,
  width: 500,
  height: 280,
  color: "#7567ef",
  gridColor: "#e2e8f0",
  values: false
}));
```

```js
const summary = grid(2, { gapX: 48, gapY: 40, items: [
  barChart([
    { label: "Algebra", value: 72 },
    { label: "Geometry", value: 88 },
    { label: "Calculus", value: 64 }
  ], { width: 330, height: 220 }),

  scatterPlot([[1, 1], [2, 1.8], [3, 3.4], [4, 3.7], [5, 5.2]], {
    width: 330,
    height: 220,
    color: "#0891b2"
  }),

  boxPlot([2, 3, 3, 4, 7, 8, 9, 12], { width: 330 }),

  pieChart([
    { label: "A", value: 20 },
    { label: "B", value: 35 },
    { label: "C", value: 45 }
  ], { radius: 100 })
]});

draw(summary);
```

## Ready-made mathematical diagrams

Also explore `fractionBar`, `fractionCircle`, `fractionPie`, `vennDiagram`,
`probabilityTree`, `rightTriangle`, `pythagoras`, `spiral`, and `sierpinski`.
They are starting points, not a closed catalog: compose them with primitives and
your own author helpers when a lesson needs something new.
