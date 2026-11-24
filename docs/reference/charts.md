# Fractions and charts

Fraction helpers explain parts of equal wholes. Chart helpers explain data. They handle the repetitive geometry while leaving size, color, labels, and composition under your control.

## Fraction models

All three fraction helpers accept positional arguments or one configuration object:

```js
fractionBar(5, 8, { fill: "#f97316" })

fractionBar({
  numerator: 5,
  denominator: 8,
  fill: "#f97316"
})
```

The **numerator** says how many equal parts are selected. The **denominator** says how many equal parts make one whole. Numerators become non-negative integers; denominators become integers of at least `1`.

Values are converted with `Number()`, floored, and clamped to those minimums. Invalid values fall back to `1/2` rather than throwing. Size options that use the shared positive-number helper also fall back to their documented defaults when they are non-finite or not positive.

Improper fractions are supported. For example, `7/5` makes one complete whole and two fifths of another.

## `fractionBar()`

A fraction bar splits a rectangle into equal-width cells. It is often the clearest first model because every part has the same shape and size.

```js
fractionBar(numerator = 1, denominator = 2, options = {})
```

<DiagramExample id="math-fraction-bar" />

| Option | Default | What it changes |
| --- | --- | --- |
| `width` | `320` | Width of each whole bar. |
| `height` | `56` | Height of each whole bar. |
| `gap` | `14` | Space between multiple wholes. |
| `fill` | `"#3b82f6"` | Selected-part color. |
| `emptyFill` | `"#f8fafc"` | Unselected-part color. |
| `stroke` | `"#1f2937"` | Cell outline color. |
| `strokeWidth` | `2` | Cell outline thickness. |
| `columns` | number of wholes | Maximum whole bars on one row before wrapping. |

Use `columns` when an improper fraction creates many wholes:

```js
fractionBar(17, 4, { columns: 3 })
```

## `fractionCircle()`

A fraction circle divides each whole into equal-angle sectors. It is useful for teaching turn, angle, sharing, pizza-style models, and the connection between fractions and a complete revolution.

```js
fractionCircle(numerator = 1, denominator = 2, options = {})
```

<DiagramExample id="math-fraction-circle" />

| Option | Default | What it changes |
| --- | --- | --- |
| `radius` | `72` | Radius of every whole circle. |
| `gap` | `24` | Space between multiple wholes. |
| `fill` | `"#3b82f6"` | Selected-slice color. |
| `emptyFill` | `"#f8fafc"` | Unselected-slice color. |
| `stroke` | `"#1f2937"` | Slice outline color. |
| `strokeWidth` | `2` | Slice outline thickness. |
| `palette` | `null` | Optional list of colors for selected slices. |
| `startAngle` | `-Math.PI / 2` | Direction where the first slice begins; the default starts at the top. |

`startAngle` is measured in radians because the JavaScript trigonometry API also uses radians. `0` points right, `Math.PI / 2` points down in SVG screen coordinates, and `-Math.PI / 2` points up.

## `fractionPie()`

`fractionPie()` uses the same geometry as `fractionCircle()`, but selected slices automatically cycle through a categorical color palette. Use it when distinguishing individual selected parts matters.

```js
fractionPie(numerator = 1, denominator = 2, options = {})
```

<DiagramExample id="math-fraction-pie" />

It accepts every `fractionCircle()` option. Supply your own `palette` to control the exact sequence:

```js
fractionPie(4, 6, {
  palette: ["#dc2626", "#2563eb", "#059669"]
})
```

::: warning Object-form palette caveat
The current implementation loses the automatically injected palette when the whole configuration is passed as the first argument. Therefore `fractionPie({ numerator: 4, denominator: 6 })` currently uses the ordinary single `fill` color unless that object includes its own `palette`. The positional form `fractionPie(4, 6)` receives the automatic categorical palette.
:::

## Chart data

`barChart()` and `pieChart()` accept several convenient shapes:

```js
[12, 18, 9]

[["North", 12], ["South", 18]]

[
  { label: "North", value: 12, color: "#2563eb" },
  { name: "South", count: 18, color: "#dc2626" }
]
```

For objects, value aliases are `value`, `count`, and `y`. Label aliases are `label` and `name`. Explicit labels and colors make lesson code easier to understand later.

Chart data must be an array. Passing another top-level type throws a `TypeError`. Numeric object values are converted with `Number()`; invalid values become `0` in bar and pie series normalization.

## `barChart()`

A bar chart compares separate categories. Bar length represents value, so all bars share one numeric scale and baseline.

```js
barChart(data, options = {})
```

<DiagramExample id="math-bar-chart" />

### Size and bars

| Option | Default | What it changes |
| --- | --- | --- |
| `width` | `480` | Total chart width. |
| `height` | `300` | Numeric plotting height. |
| `yDomain` | data range including zero | Shared numeric scale. Set it to compare multiple charts fairly. |
| `gap` | `12` | Space between neighboring bars. |
| `palette` | built-in colors | Colors used in series order. |
| `color` | `null` | One fallback color for every bar. Entry colors still take priority. |
| `stroke` | `"none"` | Bar outline color. |
| `strokeWidth` | `0` | Bar outline thickness. |

### Labels and axes

| Option | Default | What it changes |
| --- | --- | --- |
| `labels` | `true` | Shows category labels and y-axis labels. |
| `values` | `true` | Prints each value near its bar. |
| `fontSize` | `12` | Label size. |
| `labelOffset` | `18` | Category-label distance below the chart. |
| `tickCount` | `5` | Approximate y-axis tick count. |
| `grid` | `true` | Shows horizontal comparison lines. |
| `axisColor` | `"#334155"` | Axis and y-label color. |
| `gridColor` | `"#dbe4f0"` | Horizontal grid color. |
| `formatter(value)` | compact numbers | Formats y-axis tick labels only. |

Negative values work: their bars extend below the zero line.

Category labels and printed bar values currently use the fixed color `#334155`. Printed values always use the engine's compact number formatter; the `formatter` option does not change them.

An empty data array returns a Diagram containing only the axes. `yDomain` is normalized, and equal or reversed endpoints are repaired by the shared domain helper rather than throwing.

Keep `palette` nonempty unless `color` or every entry's `color` supplies a fallback. With an empty palette and no other color, bar fills are undefined.

## `histogram()`

A histogram groups numeric measurements into intervals called **bins**. Unlike a bar chart, neighboring bars represent connected ranges on one number scale. It answers questions such as “Where are most scores?” and “Is the data spread out?”

```js
histogram(data, options = {})
```

<DiagramExample id="math-histogram" />

| Option | Default | What it changes |
| --- | --- | --- |
| `bins` | `10` | Number of equal intervals, or an ordered array of boundaries. |
| `domain` / `xDomain` | data extent | Lowest and highest values included in binning. |
| `formatter(bin)` | `"min–max"` | Label for a bin object containing `min`, `max`, and `count`. |
| `gap` | `1` | Small visual gap between bins. |
| `values` | `false` | Shows bin counts above the bars. |
| `color` | `"#3b82f6"` | Bar color. |

All remaining options pass to `barChart()`.

```js
histogram(measurements, {
  bins: [0, 10, 20, 30, 50],
  formatter: bin => `${bin.min} to ${bin.max}`
})
```

Non-numeric values are ignored. Boundary values are converted to numbers, non-finite values are removed, and the remaining values are sorted, so the input does not technically need to arrive in order.

The top-level `data` value must still be an array; otherwise `histogram()` throws a `TypeError`.

::: warning Nonuniform-boundary limitation
The current bin-selection algorithm chooses a candidate bin as though the complete domain were divided into equal widths, then checks that bin's actual `min` and `max`. Nonuniform boundaries such as the example above can therefore drop valid measurements—for example, `35` can miss the final `30–50` bin. Until this is corrected, use evenly spaced boundaries or an integer bin count for dependable results.
:::

Although remaining options are forwarded to `barChart()`, histogram supplies `color: "#3b82f6"` unless you set `color`. Since `barChart()` chooses `color` before `palette`, an inherited `palette` alone normally has no visible effect.

## `boxPlot()`

A box plot compresses a distribution into five important positions: lower whisker, first quartile, median, third quartile, and upper whisker. Separate dots mark unusual values called outliers.

```js
boxPlot(data, options = {})
```

<DiagramExample id="math-box-plot" />

### Accepted data

```js
// One series
boxPlot([1, 2, 3, 4, 10])

// Several unnamed series
boxPlot([[1, 2, 3], [4, 5, 9]])

// Several named and colored series
boxPlot([
  { label: "A", values: [1, 2, 3], color: "#2563eb" },
  { name: "B", data: [4, 5, 9], color: "#dc2626" }
])
```

| Option | Default | What it changes |
| --- | --- | --- |
| `domain` | data extent plus 5% | Shared horizontal number scale. |
| `width` | `480` | Numeric-axis width. |
| `rowHeight` | `72` | Vertical space assigned to each series. |
| `boxHeight` | `34` | Thickness of each colored box. |
| `palette` | built-in colors | Series color sequence. |
| `color` | `"#2563eb"` | Fallback series color. |
| `tickCount` | `6` | Approximate axis tick count. |

Quartiles are linearly interpolated. Whiskers use the common `1.5 × IQR` rule, and values beyond those fences render as outlier circles.

::: warning `color` precedence
The current fill choice is `entry.color`, then `palette[index]`, then `color`. Because the default palette is nonempty, the `color` option normally has no visible effect. Use per-series `color` values or provide a palette to control the boxes.
:::

Several details are currently fixed rather than exposed as options: box opacity is `0.55`; whiskers, box outlines, and axes use slate colors and fixed widths; outliers have radius `4`; series labels use size `13`; and axis labels use size `12`.

`data` must be an array or `boxPlot()` throws a `TypeError`. Non-finite measurements are removed, and series left with no finite values are omitted. An empty result still returns an axis Diagram using the fallback domain `[0, 1]`.

## `pieChart()`

A pie chart shows how positive values divide one total. Each sector’s angle is proportional to its value. Use it for a small number of meaningful parts, not for precise comparisons between many similar values.

```js
pieChart(data, options = {})
```

<DiagramExample id="math-pie-chart" />

| Option | Default | What it changes |
| --- | --- | --- |
| `radius` | `100` | Outer radius. |
| `palette` | built-in colors | Sector color sequence. |
| `startAngle` | `-Math.PI / 2` | Starting direction; the default starts at the top. |
| `stroke` | `"#ffffff"` | Separator color. |
| `strokeWidth` | `2` | Separator thickness. |
| `labels` | `true` | Shows or hides sector labels. |
| `labelRadius` | `radius * 0.64` | Distance of labels from the center. |
| `fontSize` | `12` | Label size. |
| `formatter(entry, proportion)` | entry label | Produces each sector label. `proportion` is between `0` and `1`. |
| `labelColor` | `"#ffffff"` | Label color. Ensure it contrasts with every sector. |
| `innerRadius` | `0` | Positive values create a doughnut hole. |
| `holeColor` | `"#ffffff"` | Doughnut-hole color. |

Only positive values are included. The function throws an error if no positive value remains.

`radius` falls back to `100` when it is not positive. `innerRadius` is converted to a positive number but is not clamped below `radius`; an oversized hole can cover the entire pie. Keep `palette` nonempty, and remember that errors thrown by a custom `formatter` propagate to the caller.

```js
pieChart(data, {
  innerRadius: 52,
  formatter: (entry, part) =>
    `${entry.label} ${Math.round(part * 100)}%`
})
```

## Choosing a data picture

| Question | Best helper |
| --- | --- |
| How much of an equal whole is selected? | `fractionBar()` or `fractionCircle()` |
| Which category is larger? | `barChart()` |
| Where do measurements cluster? | `histogram()` |
| How do center, spread, and outliers compare? | `boxPlot()` |
| How is one total divided into a few parts? | `pieChart()` |
