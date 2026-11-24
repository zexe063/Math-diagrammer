# Venn diagram

Use a standard Venn component, then add a lesson-specific caption.

<DiagramExample id="recipe-venn-diagram" :show-code="false" :show-caption="false" />

```js
const sets = vennDiagram([
  { label: "Multiples of 2", color: "#60a5fa" },
  { label: "Multiples of 3", color: "#f4b860" }
], {
  radius: 110,
  separation: 115,
  opacity: 0.48,
  fontSize: 17,
  centerLabel: "6, 12, 18, ..."
});

const universe = stack([
  roundedRect(470, 300, 18)
    .fill("#ffffff")
    .stroke("#334155", 2.5),
  sets
]);

draw(column(24, [
  text("Common multiples", 30).fill("#26344d").fontWeight(700),
  universe,
  math(String.raw`2\mathbb{Z} \cap 3\mathbb{Z} = 6\mathbb{Z}`, 27)
]));
```

The outer rounded rectangle is presentation built from the core grammar. The
set layout remains the responsibility of `vennDiagram()`.
