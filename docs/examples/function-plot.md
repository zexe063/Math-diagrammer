# Annotated function plot

This diagram shows a parabola and marks its vertex without rebuilding the plot
from low-level paths.

<DiagramExample id="recipe-function-plot" :show-code="false" :show-caption="false" />

```js
const xDomain = [-4, 4];
const yDomain = [-2, 7];
const width = 560;
const height = 400;

const project = (x, y) => point(
  -width / 2 + (x - xDomain[0]) / (xDomain[1] - xDomain[0]) * width,
  height / 2 - (y - yDomain[0]) / (yDomain[1] - yDomain[0]) * height
);

const graph = functionPlot(
  x => (x - 1) ** 2 - 1,
  {
    xDomain,
    yDomain,
    width,
    height,
    samples: 360,
    color: "#7567ef",
    strokeWidth: 4,
    plane: {
      xStep: 1,
      yStep: 1,
      gridColor: "#e2e8f0",
      axisColor: "#334155"
    }
  }
);

const vertex = project(1, -1);

draw(column(22, [
  text("Vertex form", 28).fill("#26344d").fontWeight(700),
  math(String.raw`y = (x - 1)^2 - 1`, 30).fill("#7567ef"),
  stack([
    graph,
    dot(7).fill("#ef7187").stroke("#ffffff", 3).translate(vertex),
    label("(1, -1)", vertex, {
      offset: [48, -18],
      size: 17,
      color: "#b42345"
    })
  ])
]));
```

Keep the projection function beside the domains and dimensions. If the plot
configuration changes, annotations will continue to use the same coordinate
mapping.
