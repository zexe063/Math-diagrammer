# Styling diagrams

Styling is fluent: each method returns a new diagram. Later style calls override
earlier ones.

```js
const base = roundedRect(120, 82, 16)
  .fill("#e2e8f0")
  .stroke("#64748b", 3);

draw(row(24, [
  base,
  base.fill("#ddd6fe").stroke("#7567ef", 4),
  base.fill("#cffafe").stroke("#0891b2", 4).opacity(0.65)
]));
```

## Fill and stroke

```js
const samples = row(28, [
  circle(34).fill("#7567ef").stroke("none", 0),
  circle(34).fill("none").stroke("#7567ef", 5),
  circle(34)
    .fill("#c4b5fd")
    .fillOpacity(0.5)
    .stroke("#4438a8", 5)
    .strokeOpacity(0.8),
  circle(34)
    .fill("none")
    .stroke("#ef7187", 4)
    .dash([9, 6])
]);

draw(samples);
```

Other line controls include `.strokeWidth()`, `.lineCap()`, `.lineJoin()`, and
`.dash(values, offset)`.

## Text styles

```js
draw(column(18, [
  text("Normal label", 22).fill("#334155"),
  text("Strong label", 22).fill("#7567ef").fontWeight(700),
  text("Italic note", 18).fill("#64748b").fontStyle("italic")
]));
```

Plain `text()` uses the product font. Use `.font()`, `.fontSize()`,
`.fontWeight()`, and `.fontStyle()` when a lesson needs an exception.

## Styling a composition

Calling a style method on a `row`, `column`, or `stack` propagates the style to
its primitive children:

```js
const marks = row(18, [circle(20), square(40), triangle(44)])
  .fill("#fef3c7")
  .stroke("#d97706", 3);

draw(marks);
```

For precise control, style each child before composition.

## Small reusable palette

```js
const theme = {
  ink: "#26344d",
  primary: "#7567ef",
  secondary: "#4fc4d0",
  highlight: "#f4b860",
  paper: "#f8fafc"
};

const card = stack([
  roundedRect(280, 130, 18)
    .fill(theme.paper)
    .stroke(theme.primary, 3),
  column(12, [
    text("Visual consistency", 22).fill(theme.ink).fontWeight(700),
    text("Name colors by purpose", 17).fill(theme.secondary)
  ])
]);

draw(card);
```
