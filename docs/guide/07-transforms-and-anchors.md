# Transforms and anchors

Transforms change a diagram's geometry while preserving its composability.

## Translation, rotation, and scale

```js
const arrowTile = roundedRect(110, 54, 12)
  .fill("#ddd6fe")
  .stroke("#7567ef", 3);

draw(stack([
  arrowTile.translate(-120, 0),
  arrowTile.rotateDeg(25),
  arrowTile.scale(0.75).translate(120, 0),
  text("move").translate(-120, 0),
  text("rotate"),
  text("scale").translate(120, 0)
]));
```

- `.translate(x, y)` moves by an offset.
- `.moveTo(x, y)` moves the current center to a target.
- `.scale(x)` scales uniformly; `.scale(x, y)` scales each axis.
- `.rotate(angle)` takes radians.
- `.rotateDeg(degrees)` takes degrees.
- `.reflectX()` and `.reflectY()` mirror a diagram.
- `.skew(xAngle, yAngle)` takes radians.

Transform order matters. `shape.rotateDeg(30).translate(100, 0)` is different
from `shape.translate(100, 0).rotateDeg(30)`.

## Built-in anchors

Every diagram has anchors derived from its bounds: `center`, `left`, `right`,
`top`, `bottom`, `topLeft`, `topRight`, `bottomLeft`, and `bottomRight`.

```js
const card = roundedRect(260, 150, 18)
  .fill("#f8fafc")
  .stroke("#cbd5e1", 2);

const anchorNames = ["topLeft", "topRight", "bottomLeft", "bottomRight"];

draw(stack([
  card,
  ...anchorNames.map(name =>
    dot(6).fill("#ef7187").translate(card.anchor(name))
  ),
  text("center", 18).fill("#334155")
]));
```

## Place one anchor at a point

```js
const target = point(100, -45);
const note = stack([
  roundedRect(120, 54, 10)
    .fill("#fef3c7")
    .stroke("#d97706", 2),
  text("target", 17).fill("#92400e")
]);

draw(stack([
  line(point(-130, 70), target).stroke("#94a3b8", 2),
  dot(7).fill("#ef7187").translate(target),
  place(note, target, "bottomLeft")
]));
```

`place(diagram, target, sourceAnchor)` is more expressive than guessing a
translation offset.

## Custom anchors and connectors

```js
const first = circle(42)
  .fill("#ddd6fe")
  .stroke("#7567ef", 3)
  .translate(-110, 0);

const second = roundedRect(100, 76, 14)
  .fill("#cffafe")
  .stroke("#0891b2", 3)
  .translate(110, 0);

draw(stack([
  connect(first, second, { color: "#475569", width: 3 }),
  first,
  second,
  text("A", 22).translate(first.center),
  text("B", 22).translate(second.center)
]));
```

`connect()` and `arrowBetween()` calculate where the line meets each boundary.
For special layout points, add an anchor with
`.withAnchor("name", point(x, y))`, then retrieve it with `.anchor("name")`.

Use `.named(name)` to attach an author-facing identity when building your own
higher-level conventions.
