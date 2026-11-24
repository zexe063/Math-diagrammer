# Statistics dashboard

Compose several standard charts into one summary sheet.

<DiagramExample id="recipe-statistics-dashboard" :show-code="false" :show-caption="false" />

```js
const scores = [
  42, 48, 51, 53, 55, 57, 58, 61, 62, 63,
  64, 65, 66, 68, 69, 71, 72, 74, 76, 78,
  80, 81, 83, 84, 86, 88, 91, 93, 96
];

function panel(title, diagram) {
  return stack([
    roundedRect(500, 345, 18)
      .fill("#ffffff")
      .stroke("#dbe3ee", 2),
    column(18, [
      text(title, 22).fill("#26344d").fontWeight(700),
      diagram
    ])
  ]);
}

const distribution = histogram(scores, {
  bins: 7,
  width: 420,
  height: 245,
  color: "#7567ef",
  gridColor: "#e2e8f0",
  values: false,
  fontSize: 11
});

const spread = boxPlot(scores, {
  width: 410,
  boxHeight: 42,
  color: "#4fc4d0",
  tickCount: 6
});

const categories = barChart([
  { label: "Pass", value: 23, color: "#4fc4d0" },
  { label: "Review", value: 4, color: "#f4b860" },
  { label: "Support", value: 2, color: "#ef7187" }
], {
  width: 420,
  height: 235,
  gridColor: "#e2e8f0"
});

const outcomeShare = pieChart([
  { label: "Pass", value: 23, color: "#4fc4d0" },
  { label: "Review", value: 4, color: "#f4b860" },
  { label: "Support", value: 2, color: "#ef7187" }
], {
  radius: 112,
  innerRadius: 48,
  fontSize: 13
});

draw(column(34, [
  column(8, [
    text("Class performance", 32).fill("#26344d").fontWeight(700),
    text(`${scores.length} student scores`, 17).fill("#64748b")
  ]),
  grid(2, {
    gapX: 24,
    gapY: 24,
    items: [
      panel("Distribution", distribution),
      panel("Spread", spread),
      panel("Outcome counts", categories),
      panel("Outcome share", outcomeShare)
    ]
  })
]));
```

The reusable `panel()` helper standardizes spacing and presentation without
hiding the chart-specific data.
