# Generative patterns

Built-in helpers make advanced mathematical structures concise.

<DiagramExample id="recipe-generative-patterns" :show-code="false" :show-caption="false" />

```js
function panel(title, diagram) {
  return stack([
    roundedRect(410, 390, 18)
      .fill("#ffffff")
      .stroke("#dbe3ee", 2),
    column(20, [
      text(title, 23).fill("#26344d").fontWeight(700),
      diagram
    ])
  ]);
}

const spiralView = spiral({
  turns: 5.5,
  startRadius: 4,
  endRadius: 145,
  samples: 620,
  color: "#7567ef",
  strokeWidth: 4
});

const fractalView = sierpinski(5, {
  size: 310,
  palette: ["#7567ef", "#4fc4d0", "#f4b860"],
  stroke: "#ffffff",
  strokeWidth: 0.4
});

draw(column(30, [
  text("Patterns from simple rules", 31).fill("#26344d").fontWeight(700),
  row(24, [
    panel("Archimedean spiral", spiralView),
    panel("Sierpiński triangle", fractalView)
  ])
]));
```

For a custom generative idea, write a helper that returns primitives or a
`stack()` of recursive children. Promote the helper into the shared engine only
after several lessons prove that the same vocabulary repeats.
