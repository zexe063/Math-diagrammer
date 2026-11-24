# Labels and mathematical notation

Use `text()` for ordinary language and `math()` for TeX notation. MathJax turns
formulas into standalone SVG geometry, so exported equations stay sharp and do
not depend on a CDN.

## Plain text

```js
draw(column(16, [
  text("Pythagorean theorem", 27).fill("#26344d").fontWeight(700),
  text("For every right triangle", 18).fill("#64748b")
]));
```

## TeX math

Use `String.raw` so TeX backslashes remain readable:

```js
draw(column(26, [
  math(String.raw`a^2 + b^2 = c^2`, 34),
  math(String.raw`x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}`, 30),
  math(String.raw`\int_0^\pi \sin(x)\,dx = 2`, 28)
]));
```

<DiagramExample id="latex-formula" :show-code="false" />

`mathText()` and `latex()` are aliases of `math()`. A string entirely wrapped
in dollar signs is also promoted to math, but explicit `math()` is clearer:

```js
draw(row(22, [
  text("Explicit:", 18),
  math(String.raw`\frac{3}{4}`, 30)
]));
```

## Labeling a geometric point

`label()` places styled text at a point, with an optional offset:

```js
const A = point(-100, 65);
const B = point(100, 65);
const C = point(0, -90);

draw(stack([
  polygon([A, B, C]).fill("#e0f2fe").stroke("#0369a1", 3),
  ...[A, B, C].map(p => dot(5).fill("#0369a1").translate(p)),
  label("A", A, { offset: [-18, 14], color: "#0c4a6e" }),
  label("B", B, { offset: [18, 14], color: "#0c4a6e" }),
  label("C", C, { offset: [0, -18], color: "#0c4a6e" })
]));
```

## Combining prose and formulas

```js
const statement = row(14, [
  text("The area is", 20).fill("#334155"),
  math(String.raw`A = \pi r^2`, 30).fill("#7567ef")
], { align: "baseline" });

draw(stack([
  roundedRect(340, 110, 16).fill("#fafafa").stroke("#d4d4d8", 2),
  statement
]));
```

Keep paragraph-like prose in `text()`. Use `\text{...}` inside `math()` only
when the words are part of a mathematical expression.
