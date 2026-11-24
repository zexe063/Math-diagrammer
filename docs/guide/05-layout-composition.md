# Layout and composition

Most authoring should use relationships rather than coordinates. The core
layout vocabulary is `row`, `column`, `stack`, and `grid`.

## Rows and columns

```js
const makeCard = (value, color) => stack([
  roundedRect(92, 74, 12).fill("#ffffff").stroke(color, 3),
  text(value, 24).fill(color).fontWeight(700)
]);

const top = row(18, [
  makeCard("1", "#7567ef"),
  makeCard("2", "#0891b2"),
  makeCard("3", "#d97706")
]);

draw(column(26, [
  text("A row inside a column", 26).fontWeight(600),
  top,
  text("Layouts center themselves", 17).fill("#64748b")
]));
```

The first argument is the visual gap. Text-heavy rows can use baseline
alignment:

```js
draw(row(14, [
  text("Area:", 20).fontWeight(600),
  math(String.raw`\pi r^2`, 34)
], { align: "baseline" }));
```

## Stacking layers

`stack([back, ..., front])` preserves the same coordinate system and paints
later items above earlier items.

```js
draw(stack([
  circle(90).fill("#ede9fe").stroke("#7567ef", 3),
  line(point(-65, 0), point(65, 0)).stroke("#4438a8", 3),
  dot(7).fill("#ef7187"),
  text("diameter", 17).fill("#4438a8").translate(0, -18)
]));
```

`overlay()` is an old compatibility alias. New code should use `stack()`.

## Repeated layouts

```js
const numbers = Array.from({ length: 12 }, (_, index) =>
  stack([
    roundedRect(58, 48, 8).fill("#f8fafc").stroke("#cbd5e1", 2),
    text(String(index + 1), 18).fill("#334155")
  ])
);

draw(grid(4, { gapX: 12, gapY: 12, items: numbers }));
```

## Size and alignment tools

- `pad(amount, diagram)` or `diagram.pad(amount)` adds invisible breathing room.
- `frame(width, height, diagram, options)` gives a diagram fixed layout bounds.
- `scaleToFit(width, height, diagram)` scales without distortion.
- `strut(width, height)` reserves empty layout space.
- `align(diagram, "topLeft")` moves an anchor to the origin.
- `place(diagram, point, sourceAnchor)` moves an anchor to a target point.

```js
const short = frame(180, 90, text("Short", 22), { alignX: "left" });
const long = frame(180, 90, text("A longer label", 22), { alignX: "left" });

draw(column(12, [
  stack([roundedRect(200, 100, 10).fill("#f8fafc"), short]),
  stack([roundedRect(200, 100, 10).fill("#f8fafc"), long])
]));
```

Use a semantic component such as `cellGrid()` when a layout represents a known
mathematical structure rather than a generic visual grid.
