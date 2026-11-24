# Probability tree

Nested data is enough to generate a multi-stage probability tree.

<DiagramExample id="recipe-probability-tree" :show-code="false" :show-caption="false" />

```js
const experiment = {
  label: "Start",
  children: [
    {
      label: "Red",
      probability: "3/5",
      color: "#ef7187",
      children: [
        { label: "Win", probability: "1/2", color: "#7567ef" },
        { label: "Lose", probability: "1/2", color: "#64748b" }
      ]
    },
    {
      label: "Blue",
      probability: "2/5",
      color: "#4fc4d0",
      children: [
        { label: "Win", probability: "1/4", color: "#7567ef" },
        { label: "Lose", probability: "3/4", color: "#64748b" }
      ]
    }
  ]
};

const tree = probabilityTree(experiment, {
  rowGap: 92,
  columnGap: 180,
  edgeColor: "#94a3b8",
  strokeWidth: 2.5,
  nodeRadius: 7,
  fontSize: 15,
  probabilityFontSize: 14,
  labelOffset: 22
});

draw(column(26, [
  text("Two-stage experiment", 29).fill("#26344d").fontWeight(700),
  text("Branch labels show conditional probabilities", 17).fill("#64748b"),
  tree
]));
```

Each child's `probability` labels the incoming branch. Change only the tree data
when the experiment changes; the layout is calculated internally.
