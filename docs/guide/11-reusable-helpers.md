# Reusable author helpers

The engine cannot contain one component for every possible math diagram. The
scalable approach is to combine a small visual grammar with short helpers that
encode the repeated language of your lessons.

## A helper should return a Diagram

```js
function answerChoice(letter, content, selected = false) {
  const border = selected ? "#7567ef" : "#cbd5e1";
  const fill = selected ? "#f3f0ff" : "#ffffff";

  return stack([
    roundedRect(330, 76, 14).fill(fill).stroke(border, selected ? 3 : 2),
    row(18, [
      stack([
        circle(22).fill(border).stroke("none", 0),
        text(letter, 18).fill("#ffffff").fontWeight(700)
      ]),
      frame(238, 46, content, { alignX: "left" })
    ])
  ]);
}

draw(column(14, [
  answerChoice("A", math(String.raw`x = 3`, 24)),
  answerChoice("B", math(String.raw`x = 4`, 24), true),
  answerChoice("C", math(String.raw`x = 5`, 24))
]));
```

The helper owns visual policy. The lesson author supplies meaning.

## Separate data, geometry, and presentation

```js
const values = [2, 5, 3, 7];
const palette = ["#7567ef", "#4fc4d0", "#f4b860", "#ef7187"];

function tower(value, index) {
  const blocks = Array.from({ length: value }, () =>
    square(34).fill(palette[index]).stroke("#ffffff", 2)
  );

  return column(0, [
    column(0, blocks),
    text(String.fromCharCode(65 + index), 18).fill("#334155")
  ]);
}

draw(row(18, values.map(tower), { align: "bottom" }));
```

The array is lesson data, `tower()` is the visual rule, and the palette is
presentation. This separation makes revisions cheap.

## Generate repeated geometry

```js
function radialTicks(count, radius, length) {
  return stack(Array.from({ length: count }, (_, index) => {
    const angle = index * tau / count;
    const direction = polar(angle, 1);
    return line(
      point(direction.x * (radius - length), direction.y * (radius - length)),
      point(direction.x * radius, direction.y * radius)
    ).stroke("#475569", 2);
  }));
}

draw(stack([
  circle(110).fill("#ffffff").stroke("#334155", 3),
  radialTicks(24, 110, 12),
  math(String.raw`\theta`, 34).fill("#7567ef")
]));
```

## When to create a reusable helper

Create one when:

- the same visual rule appears in several lessons;
- authors repeatedly calculate the same coordinates;
- a meaningful concept can replace many low-level instructions;
- consistent spacing, colors, or labeling matter.

Keep using primitives directly for one-off shapes. Promote a pattern only after
its vocabulary is clear. That is how the library can cover millions of diagrams
without accumulating millions of rigid components.
