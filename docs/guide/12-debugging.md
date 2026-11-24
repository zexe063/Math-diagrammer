# Debugging diagrams

Debug from the outside in: syntax, data, geometry, then presentation.

## 1. Read the first error

Studio reports the source line. The first error often causes every later one.
Common JavaScript errors include missing commas, brackets, or parentheses.

```js
const diagram = circle(50)
  .fill("#7567ef")
  .stroke("#352c82", 3);

draw(diagram);
```

Keep a chain vertically aligned while diagnosing it.

## 2. Avoid duplicate declarations

`Identifier 'frame' has already been declared` means the same program contains
two `const`, `let`, class, or function declarations with that name. This often
happens after a second example is pasted below the first one. Replace the old
program or rename one declaration. Studio allows a local name to shadow a DSL
helper, but doing that makes author code harder to read.

Use descriptive author names:

```js
const cardFrame = roundedRect(260, 140, 16)
  .fill("#ffffff")
  .stroke("#cbd5e1", 2);

const cardContent = text("No name collision", 22);

draw(stack([cardFrame, cardContent]));
```

Avoid vague names such as `frame`, `line`, `text`, `point`, or `circle` for
variables because those are also DSL functions.

## 3. Reduce to the smallest diagram

Temporarily draw one intermediate value:

```js
const base = coordinatePlane({
  xDomain: [-3, 3],
  yDomain: [-3, 3]
});

const curve = functionPlot(x => x * x, {
  xDomain: [-3, 3],
  yDomain: [-3, 6],
  showAxes: false,
  color: "#7567ef"
});

// Change this to draw(base) or draw(curve) while debugging.
draw(stack([base, curve]));
```

## 4. Inspect bounds and anchors

```js
const shape = triangle(180).rotateDeg(18);
console.log("width", shape.width);
console.log("height", shape.height);
console.log("center", shape.center);
console.log("top", shape.anchor("top"));

draw(stack([
  shape.fill("#ddd6fe").stroke("#7567ef", 3),
  dot(6).fill("#ef7187").translate(shape.center),
  dot(6).fill("#0891b2").translate(shape.anchor("top"))
]));
```

Invisible dots at anchors make layout errors visible.

## 5. Check input contracts

- Coordinates must be finite numbers.
- Chart datasets must contain valid values.
- `cellGrid` addresses use integer `[column, row]` values inside the grid.
- A diagonal matrix must be rectangular.
- `functionPlot` and `parametricPlot` require functions.
- `pieChart` requires at least one positive value.

## 6. Watch common visual mistakes

- In SVG coordinates, positive `y` moves downward.
- `.rotate()` takes radians; use `.rotateDeg()` for degrees.
- Later `stack()` items paint above earlier items.
- `fill("none")` and `stroke("none", 0)` remove different paint layers.
- Rounded `cellGrid` content clips by default.
- Very thick strokes expand bounds and therefore affect layout gaps.
- Transform order changes the result.

## 7. Preserve the last successful export

Studio exports the most recent successful render. A new syntax error should not
replace good output. Fix the preview before assuming the downloaded SVG reflects
the latest source.
