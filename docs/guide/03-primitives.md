# Primitives and paths

Primitives are the smallest visible diagrams. They all return normal `Diagram`
values, so the same styling, transform, and composition methods work on each.

## Shape families

```js
const filledShapes = row(22, [
  circle(28),
  ellipse(42, 26),
  rectangle(66, 52),
  roundedRect(66, 52, 12),
  regularPolygon(6, 34),
  triangle(68)
]).fill("#c4b5fd").stroke("#5b4bc4", 2.5);

const curvedShapes = row(32, [
  arc(32, 0, Math.PI * 1.5).stroke("#0891b2", 5),
  sector(34, -Math.PI / 2, Math.PI / 3)
    .fill("#67e8f9")
    .stroke("#0891b2", 2),
  ring(18, 34).fill("#fbbf24").stroke("#b45309", 2)
]);

draw(column(34, [filledShapes, curvedShapes]));
```

Useful aliases include `rect()` for `rectangle()`, `square(size)`, and
`wedge()` for `sector()`.

## Points, lines, and polygons

Points may be made with `point(x, y)` or written as `[x, y]` in most APIs.

```js
const vertices = [
  point(0, -90),
  point(100, 65),
  point(-100, 65)
];

draw(stack([
  polygon(vertices)
    .fill("#e0f2fe")
    .stroke("#0369a1", 3),
  polyline([...vertices, vertices[0]])
    .fill("none")
    .stroke("#0c4a6e", 2)
    .dash([8, 6]),
  ...vertices.map(vertex =>
    dot(6).fill("#ef7187").translate(vertex)
  )
]));
```

`line(a, b)` makes one segment. `line(length)` is a centered horizontal line.
`polyline(points)` stays open, while `polygon(points)` closes and fills.

## Custom paths

Use `pen()` only when primitives and polylines cannot express the curve. Path
data is immutable, so keep assigning each returned value.

```js
const curveData = pen()
  .moveTo(-150, 50)
  .cubicTo(-70, -120, 70, 120, 150, -50);

const curve = path(curveData)
  .fill("none")
  .stroke("#7567ef", 5);

const endpoints = stack([
  dot(7).fill("#ef7187").translate(-150, 50),
  dot(7).fill("#ef7187").translate(150, -50)
]);

draw(stack([curve, endpoints]));
```

Path commands are `moveTo`, `lineTo`, `quadTo`, `cubicTo`, `arcTo`, and
`close`. Prefer the semantic math helpers for plots and charts rather than
manually constructing their paths.
