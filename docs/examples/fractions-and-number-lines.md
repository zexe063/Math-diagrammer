# Fractions and a number line

This recipe connects a fraction model to its position on a number line.

<DiagramExample id="recipe-fractions-and-number-lines" :show-code="false" :show-caption="false" />

```js
const accent = "#7567ef";
const ink = "#334155";

const fractionModel = fractionBar(3, 4, {
  width: 300,
  height: 58,
  fill: accent,
  emptyFill: "#f1f5f9",
  stroke: ink,
  strokeWidth: 2
});

const axisWidth = 520;
const axis = numberLine(0, 1, {
  step: 0.25,
  width: axisWidth,
  tickSize: 14,
  labelOffset: 28,
  fontSize: 15,
  color: ink
});

const threeQuartersX = -axisWidth / 2 + axisWidth * 0.75;
const marker = stack([
  circle(9).fill(accent).stroke("#ffffff", 3),
  math(String.raw`\frac{3}{4}`, 24)
    .fill(accent)
    .translate(0, -34)
]).translate(threeQuartersX, 0);

draw(column(36, [
  text("Three quarters", 29).fill("#26344d").fontWeight(700),
  fractionModel,
  stack([axis, marker])
]));
```

The helper creates the fraction bar, while a small amount of explicit geometry
maps `3/4` to the known axis width. For several markers, extract that mapping
into a helper.
