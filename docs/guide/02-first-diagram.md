# Your first diagram

Paste this complete program into Studio:

```js
const title = text("Three useful shapes", 28)
  .fill("#26344d")
  .fontWeight(600);

const shapes = row(28, [
  circle(38)
    .fill("#7567ef")
    .stroke("#4438a8", 3),

  roundedRect(82, 72, 12)
    .fill("#4fc4d0")
    .stroke("#176b75", 3),

  triangle(84)
    .fill("#f4b860")
    .stroke("#885b19", 3)
]);

draw(column(32, [title, shapes]));
```

<DiagramExample id="primitive-composition" :show-code="false" />

## Read it from the inside out

- `circle`, `roundedRect`, and `triangle` create diagrams.
- `.fill()` and `.stroke()` style them.
- `row(28, [...])` puts the shapes beside one another with a 28-unit gap.
- `column(32, [...])` places the title above the row.
- `draw(...)` sends the final result to the preview.

## Make your first changes

Change one thing at a time:

```js
const badge = stack([
  circle(54).fill("#ede9fe").stroke("#7567ef", 3),
  math(String.raw`x^2`, 28).fill("#352c82")
]);

draw(badge);
```

<DiagramExample id="stack-and-label" :show-code="false" />

Try changing the radius, colors, stroke width, or formula. Because `stack()`
layers later items above earlier items, the formula appears over the circle.

## The one-`draw()` rule

Studio expects one final diagram. Compose alternatives first, then draw once:

```js
const answerA = text("A. 12", 20);
const answerB = text("B. 16", 20).fill("#7567ef").fontWeight(700);

draw(column(14, [answerA, answerB]));
```

Calling `draw()` repeatedly makes the program harder to reason about. Treat it
as the final line of the program.
