# Lesson explanation card

This recipe combines prose, formula geometry, and a small visual proof in a
single exportable lesson card.

<DiagramExample id="recipe-lesson-card" :show-code="false" :show-caption="false" />

```js
const ink = "#26344d";
const accent = "#7567ef";
const radius = 72;

const circleDiagram = stack([
  circle(radius).fill("#ede9fe").stroke(accent, 3),
  line(point(0, 0), point(radius, 0)).stroke(accent, 4),
  dot(5).fill(accent),
  text("r", 20).fill(accent).translate(radius / 2, -15)
]);

const explanation = column(14, [
  text("Area of a circle", 30).fill(ink).fontWeight(700),
  text("The radius determines the area.", 18).fill("#64748b"),
  row(12, [
    text("Formula", 18).fill(ink).fontWeight(600),
    math(String.raw`A = \pi r^2`, 32).fill(accent)
  ], { align: "baseline" })
], { align: "left" });

const content = row(54, [circleDiagram, explanation]);

draw(stack([
  roundedRect(620, 250, 24)
    .fill("#ffffff")
    .stroke("#dbe3ee", 2),
  content
]));
```

This is the main composition pattern for static instructional artwork:
semantic visual on one side, concise explanation on the other, and one shared
presentation shell.
