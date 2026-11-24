# Plots and axes

These helpers turn numbers and functions into visual coordinate systems. Every helper returns a normal `Diagram`, so you can style, transform, frame, or combine the result with any other DSL shape.

::: tip Read the picture first
The **Preview** shows the result. Choose **Code** to copy the exact program. Start by changing one number or color, render again, and observe what moved.
:::

## `numberLine()`

A number line places numbers at equal distances along one straight axis. Use it for counting, integers, inequalities, intervals, and showing where a value lives.

```js
numberLine(minimum = -5, maximum = 5, options = {})
numberLine({ min, max, ...options })
```

- `minimum` is the number at the left end.
- `maximum` is the number at the right end.
- The object form accepts `min`/`max` or `minimum`/`maximum`.
- If the two ends are reversed, the helper puts them in the correct order.
- Inputs are converted with `Number()`; invalid endpoints fall back to `-5` and `5`.

<DiagramExample id="math-number-line" />

### Main controls

| Option | Default | What it changes |
| --- | --- | --- |
| `width` | `480` | Length of the line in diagram units. |
| `step` | automatic | Numeric distance from one tick to the next. Use `1` for every integer. |
| `tickCount` | `10` | Approximate number of ticks when `step` is omitted. |
| `tickSize` | `12` | Length of each small crossing mark. |
| `labels` | `true` | Shows or hides the numbers. |
| `labelOffset` | `24` | Distance between the axis and its labels. |
| `fontSize` | `14` | Size of number labels. |
| `color` | `"#1f2937"` | Main line color. |
| `strokeWidth` | `2` | Thickness of the line and ticks. |
| `tickColor` | `color` | Tick color. |
| `labelColor` | `color` | Number-label color. |
| `includeEndTicks` | `true` | Ensures both end values get ticks. |
| `arrowheads` | `false` | Adds arrowheads at both ends. |
| `formatter(value)` | compact numbers | Converts each numeric label to text. |

```js
// Show only even labels.
numberLine(-6, 6, {
  step: 2,
  formatter: value => `${value}`
})
```

`formatter` is called once for every rendered label and should return text. `width` must resolve to a positive number or falls back to `480`; other numeric controls are normalized by their helper functions rather than producing strict validation errors.

## `coordinatePlane()`

A coordinate plane is a map for points. The horizontal direction is the **x-axis**, the vertical direction is the **y-axis**, and their crossing is the origin `(0, 0)`.

```js
coordinatePlane(options = {})
```

<DiagramExample id="math-coordinate-plane" />

### Domains and size

| Option | Default | What it changes |
| --- | --- | --- |
| `xDomain` | `[-5, 5]` | Smallest and largest x-values. `xMin` and `xMax` are aliases. |
| `yDomain` | `[-5, 5]` | Smallest and largest y-values. `yMin` and `yMax` are aliases. |
| `width` | `480` | Rendered horizontal size. |
| `height` | `360` | Rendered vertical size. |
| `xStep` | automatic | Distance between vertical grid lines and x-ticks. |
| `yStep` | automatic | Distance between horizontal grid lines and y-ticks. |
| `tickCount` | `10` | Approximate tick count when explicit steps are absent. |

### Appearance

| Option | Default | What it changes |
| --- | --- | --- |
| `grid` | `true` | Shows or hides background grid lines. |
| `ticks` | `true` | Shows or hides axis tick marks. |
| `labels` | `true` | Shows or hides numeric labels. |
| `border` | `false` | Draws a rectangle around the plotting area. |
| `gridColor` | `"#dbe4f0"` | Grid-line color. Keep this quieter than the axes. |
| `gridWidth` | `1` | Grid-line thickness. |
| `axisColor` | `"#334155"` | x- and y-axis color. |
| `axisWidth` | `2` | x- and y-axis thickness. |
| `tickSize` | `8` | Length of ticks crossing the axes. |
| `fontSize` | `13` | Numeric-label size. |
| `labelColor` | `"#334155"` | Numeric-label color. |
| `formatter(value)` | compact numbers | Converts tick values into label text. |

If zero is outside a domain, the current implementation keeps the axis visible at a fixed boundary: the x-axis is placed at the **bottom**, and the y-axis at the **left**. This is the nearest boundary for positive-only domains, but not for entirely negative domains.

Reversed domains are sorted. Equal endpoints are expanded into a small usable interval. The helper returns a grouped Diagram even when grid lines, ticks, labels, and border are all disabled.

## `axes()`

`axes()` is the same coordinate system without grid lines. It is useful for clean textbook sketches or when a dense grid would distract from the curve.

```js
axes(options = {})
```

<DiagramExample id="math-axes" />

It accepts every `coordinatePlane()` option. Passing `{ grid: true }` deliberately restores the grid.

## `plot()`

`plot()` is the author-facing graph grammar. Give it the mathematical series and the words that belong on the graph; it calculates the axes, projections, title position, unit captions, clipping, and surrounding space.

```js
plot(series, options = {})
plot({ series, ...options })
```

`series` may be a function such as `x => x * x`, a value returned by `spikeSeries()`, or an array containing several of them. Every series shares one inferred or explicit coordinate system.

<DiagramExample id="math-plot-spike-series" />

### Complete graph controls

| Option | Default | What it changes |
| --- | --- | --- |
| `title` | none | Heading placed above the plotting area. |
| `x`, `y` | `{}` | Semantic axis objects with `domain`, `step`, `label`, and `unit`. |
| `xDomain`, `yDomain` | inferred | Flat aliases for `x.domain` and `y.domain`. |
| `xLabel`, `yLabel` | none | Flat aliases for `x.label` and `y.label`. |
| `xUnit`, `yUnit` | none | Flat aliases for `x.unit` and `y.unit`. |
| `units` | `{}` | Alternative `{ x, y }` unit strings. Explicit axis objects win. |
| `width`, `height` | `520`, `340` | Size of the plotting rectangle, excluding title and axis captions. |
| `axes` | `{}` | Coordinate-plane appearance controls. Use `false` to hide the axes. |
| `showAxes` | `true` | Existing flat switch for showing or hiding the plane. |
| `plane` | `{}` | Alias for coordinate-plane appearance controls; `axes` wins when both set the same property. |
| `domainPadding` | `0.06` | Fractional breathing room added around inferred domains. |
| `includeZero` | automatic | Forces zero into an inferred y-domain. This defaults to `true` for spike series. |
| `palette` | built-in colors | Colors assigned to multiple series. |
| `color`, `strokeWidth` | palette, `3` | Defaults for a series that does not provide its own style. |
| `samples` | `360` | Samples used for ordinary function series. |
| `domainSamples` | `480` | Samples used only while inferring the y-domain. |
| `jumpThreshold` | automatic | Breaks suspiciously large projected jumps. |
| `padding` | `0` | Extra invisible bounds around the completed graph. Accepts a number or `{ x, y }`. |
| `titleSize`, `titleColor`, `titleWeight` | `22`, dark ink, `700` | Title typography. |
| `axisLabelSize`, `axisLabelColor` | `15`, dark ink | Axis-caption typography. |
| `titleGap`, `xLabelGap`, `yLabelGap` | automatic | Extra distance between the plot and its semantic labels. |

An axis caption combines its label and unit automatically. For example, `y: { label: "Distance", unit: "km" }` renders **Distance (km)**. Authors do not translate that text or calculate room for it.

```js
draw(plot(x => x * x, {
  title: "Square function",
  x: { domain: [-3, 3], label: "x", step: 1 },
  y: { domain: [0, 9], label: "y", step: 1 }
}));
```

When a domain is omitted, `plot()` samples the series and finds a usable range. Set explicit domains when several lesson diagrams must use exactly the same scale. Curves are clipped to the plotting rectangle, so a finite value outside the visible y-domain cannot spill into the title or captions.

The usual coordinate-plane appearance options can be placed inside `axes`, including `grid`, `ticks`, `labels`, `border`, colors, widths, and font sizes. `x.step` and `y.step` are forwarded as tick steps.

## `spikeSeries()`

`spikeSeries()` describes repeated smooth peaks without asking the author to write a Gaussian formula or a reducer. It returns a series descriptor for `plot()`; it is not a Diagram by itself.

```js
spikeSeries(peaks, options = {})
```

Each peak may use one of these forms:

```js
5                              // height 5 at x = array index
[2, 5]                         // x, height
[2, 5, 0.18]                   // x, height, spread
{ x: 2, height: 5, spread: 0.18 }
```

`spread` controls how wide the smooth peak is. It is measured in x-axis units, not pixels.

| Option | Default | What it changes |
| --- | --- | --- |
| `baseline` | `0` | Value between peaks. |
| `spread` | `0.2` | Default spread for peaks that omit it. |
| `domain` | automatic | Region where the series exists. Outside it, the curve stops. |
| `start`, `end` | automatic | Convenient endpoints when only one side or a simple interval is needed. |
| `tail` | `3.5` | How many spreads each side contributes to automatic x-domain inference. |
| `color` | plot palette | Curve color. |
| `strokeWidth` | `3` | Curve thickness. |
| `opacity` | `1` | Curve opacity from `0` to `1`. |
| `dash` | none | Dash pattern such as `[8, 5]`. |
| `samples` | based on peak count | Curve sampling density. |
| `jumpThreshold` | plot default | Optional projected-distance threshold for breaking discontinuities. |

The height is added above `baseline`. Nearby peaks can overlap and add together, which matches a sum of smooth signals. Use a negative height to make a downward dip.

The returned descriptor is frozen. Its useful readable members are `type`, `peaks`, `baseline`, `domain`, `xExtent`, and `valueAt(x)`, followed by its stored style controls. Most lesson code should pass it directly to `plot()` rather than reading those members.

```js
const signal = spikeSeries([
  [0, 3],
  [1, 6, 0.12],
  { x: 2, height: 4, spread: 0.3 }
], {
  baseline: 0.5,
  color: "#168c82"
});

draw(plot(signal, {
  title: "Repeated signal",
  x: { label: "Time", unit: "s" },
  y: { label: "Amplitude", unit: "V" }
}));
```

## `functionPlot()`

A function plot draws `y = f(x)`. For each x-value, your JavaScript function returns its y-value. The helper samples many x-values and connects the results into a smooth path.

```js
functionPlot(fn, options = {})
```

- `fn(x)` must be a function such as `x => x * x` or `x => Math.sin(x)`.
- The returned number is interpreted as y.
- The domain controls which mathematical region you see; width and height only control its rendered size.

Passing a non-function throws a `TypeError`.

<DiagramExample id="math-function-plot" />

### Plot controls

| Option | Default | What it changes |
| --- | --- | --- |
| `xDomain` | `[-5, 5]` | x-values sent to your function. |
| `yDomain` | `[-5, 5]` | Visible y-range. |
| `width`, `height` | `480`, `360` | Plotting-area size. |
| `samples` | `320` | Number of curve samples. Increase for complicated curves. |
| `color` | `"#2563eb"` | Curve color. |
| `strokeWidth` | `3` | Curve thickness. |
| `showAxes` | `true` | Includes or removes the coordinate plane. |
| `plane` | `{}` | Extra `coordinatePlane()` options. |
| `jumpThreshold` | half the larger dimension | Breaks suspiciously large jumps instead of drawing across an asymptote. |

### Inherited coordinate-plane controls

`functionPlot()` also accepts the coordinate-plane options `xMin`, `xMax`, `yMin`, `yMax`, `xStep`, `yStep`, `tickCount`, `grid`, `ticks`, `labels`, `border`, `fontSize`, `tickSize`, `gridColor`, `gridWidth`, `axisColor`, `axisWidth`, `labelColor`, and `formatter` at the top level.

The nested `plane` object is applied **after** the top-level configuration. It can therefore override any plane option, including `xDomain`, `yDomain`, `width`, and `height`. Be careful: the curve is projected using the top-level domain and size before `plane` is merged, so overriding those four values only inside `plane` can make the axes disagree with the curve.

```js
functionPlot(x => 1 / x, {
  xDomain: [-5, 5],
  yDomain: [-5, 5],
  color: "#be123c",
  plane: { xStep: 1, yStep: 1 }
})
```

Thrown errors, `NaN`, and infinite results break the curve into separate pieces. This is useful for discontinuous functions, but always inspect a plot before publishing it.

The domains define the projection scale, not a clipping mask. Finite values outside `yDomain` can render beyond the plane. Use a clipping Diagram when the curve must remain inside a strict frame.

## `parametricPlot()`

A parametric curve lets one variable, usually called `t`, control both coordinates. Instead of calculating only y from x, you calculate the complete point `[x, y]`. This makes circles, loops, spirals, and motion paths easy.

```js
parametricPlot(curve, options = {})
parametricPlot(xFunction, yFunction, options = {})
```

<DiagramExample id="math-parametric-plot" />

Both forms below describe a circle:

```js
parametricPlot(t => [Math.cos(t), Math.sin(t)])

parametricPlot(
  t => Math.cos(t),
  t => Math.sin(t)
)
```

The curve callback must be a function or the helper throws a `TypeError`. `samples` is floored to an integer with a minimum of `2`.

### Controls

| Option | Default | What it changes |
| --- | --- | --- |
| `tDomain` | `[0, 2 * Math.PI]` | Beginning and end of the parameter. `tMin` and `tMax` are aliases. |
| `xDomain`, `yDomain` | `[-5, 5]` | Visible mathematical region. |
| `width`, `height` | `480`, `360` | Plotting-area size. |
| `samples` | `400` | Number of parameter values evaluated. |
| `color` | `"#7c3aed"` | Curve color. |
| `strokeWidth` | `3` | Curve thickness. |
| `showAxes` | `true` | Includes or removes the coordinate plane. |
| `plane` | `{}` | Extra coordinate-plane appearance options. |
| `jumpThreshold` | half the larger dimension | Splits unexpectedly large jumps. |

The curve may return `[x, y]` or `{ x, y }`.

It also accepts the same inherited top-level plane controls listed for `functionPlot()`, including the `xMin`/`xMax`/`yMin`/`yMax` aliases. Nested `plane` has the same last-write precedence and the same risk of axes/curve disagreement when it overrides domains or dimensions. The domains scale points but do not clip points outside the visible rectangle.

## `scatterPlot()`

A scatter plot shows separate observations rather than joining them into a curve. Each dot stores two measurements: x determines left/right position and y determines up/down position.

```js
scatterPlot(data, options = {})
```

Data points may be arrays or objects:

```js
scatterPlot([[1, 2], [2, 3], [4, 3.5]])

scatterPlot([
  { x: 1, y: 2, color: "#dc2626" },
  { x: 2, y: 3, color: "#2563eb" }
])
```

The top-level data value must be an array or `scatterPlot()` throws a `TypeError`.

<DiagramExample id="math-scatter-plot" />

### Controls

| Option | Default | What it changes |
| --- | --- | --- |
| `xDomain`, `yDomain` | inferred with 8% padding | Visible region. Set these when several plots must share one scale. |
| `width`, `height` | `480`, `360` | Plotting-area size. |
| `radius` | `5` | Default dot radius. |
| `color` | `"#2563eb"` | Default dot color. |
| `opacity` | `0.85` | Dot transparency. Overlaps become easier to see below `1`. |
| `showAxes` | `true` | Includes or removes the coordinate plane. |
| `plane` | `{}` | Extra coordinate-plane options. |
| `colorAccessor(raw, index)` | none | Returns a color for each original data entry. |
| `radiusAccessor(raw, index)` | none | Returns a radius for each original data entry. |

Invalid points are ignored. If a point object has its own `color`, that color is used unless `colorAccessor` returns another one.

`scatterPlot()` accepts the remaining top-level coordinate-plane controls too: `xStep`, `yStep`, `tickCount`, `grid`, `ticks`, `labels`, `border`, font/tick controls, colors, widths, and `formatter`. Its inferred domains use 8% padding; explicit domains are normalized but not used as a clipping mask, so out-of-domain dots can appear beyond the plane. Nested `plane` overrides the rendered plane after dot positions have already been projected and can therefore create a mismatch if it changes domains or size.

## Choosing the right helper

| You want to show… | Use |
| --- | --- |
| Ordered values on one dimension | `numberLine()` |
| An empty x-y workspace | `coordinatePlane()` |
| A quiet workspace without a grid | `axes()` |
| A complete graph with titles, units, and automatic spacing | `plot()` |
| Repeated smooth peaks without writing the formula | `spikeSeries()` inside `plot()` |
| A rule such as `y = x²` | `functionPlot()` |
| A curve controlled by time or angle | `parametricPlot()` |
| Independent measurements | `scatterPlot()` |
