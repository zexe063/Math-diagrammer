# Ready-made math diagrams

These high-level helpers package a recurring mathematical visual grammar into one function. They are not locked templates: every result is an ordinary static `Diagram` that can be placed in a `row()`, `column()`, `stack()`, or `frame()`.

## `vennDiagram()`

A Venn diagram uses overlapping regions to show sets. A point inside one circle belongs to that set; a point inside an overlap belongs to every overlapping set.

```js
vennDiagram(sets = ["A", "B"], options = {})
vennDiagram({ sets, ...options })
```

Two or three sets are supported. Each set can be a label string or an object containing `label`/`name` and `color`.

At least two normalized entries are required or the function throws a `RangeError`. The current implementation silently keeps only the first three entries when more are supplied; validate lesson data yourself when silent truncation would hide a mistake.

<DiagramExample id="math-venn-diagram" />

| Option | Default | What it changes |
| --- | --- | --- |
| `sets` | `["A", "B"]` | Two or three set descriptions. |
| `radius` | `82` | Radius of every set circle. |
| `separation` | `radius * 0.9` | Distance between circle centers. Smaller values create more overlap. |
| `palette` | built-in colors | Set color sequence. |
| `opacity` | `0.45` | Fill transparency. Transparency makes overlaps visible. |
| `fontSize` | `16` | Set-label size. |
| `labelColor` | `"#0f172a"` | Set-label color. |
| `centerLabel` | none | Optional text placed in the central overlap. |

`labelColor` controls the set labels. The optional `centerLabel` currently uses the engine's default text color instead of `labelColor`.

`radius` must resolve to a positive number or falls back to `82`; `separation` only needs to be finite and may be negative. Keep `palette` nonempty unless every set supplies its own `color`.

```js
vennDiagram([
  { label: "Multiples of 2", color: "#0284c7" },
  { label: "Multiples of 3", color: "#f97316" },
  { label: "Multiples of 5", color: "#16a34a" }
])
```

## `probabilityTree()`

A probability tree lays out possible outcomes in stages. Start at the left, follow one branch at each split, and multiply probabilities along a complete route when calculating the chance of that route.

```js
probabilityTree(tree, options = {})
```

<DiagramExample id="math-probability-tree" />

### Tree data

```js
const tree = {
  label: "Start",
  children: [
    { label: "Heads", probability: "1/2" },
    { label: "Tails", probability: "1/2" }
  ]
};
```

- The input may be one root object or an array of root branches.
- Child-array names may be `children` or `branches`.
- Node-label names may be `label`, `name`, or `outcome`.
- An edge label uses `edgeLabel` first, then `probability`, `p`, or `weight`.
- A node’s own `color` overrides the shared node color.

Any non-object, non-array root throws a `TypeError`. Empty child lists are valid leaves. Unknown child/label/probability property names are ignored rather than rejected.

### Controls

| Option | Default | What it changes |
| --- | --- | --- |
| `rowGap` | `72` | Vertical space between leaf outcomes. |
| `columnGap` | `150` | Horizontal distance between stages. |
| `edgeColor` | `"#64748b"` | Branch-line color. |
| `strokeWidth` | `2` | Branch-line thickness. |
| `nodes` | `true` | Shows or hides node dots. |
| `nodeColor` | `"#2563eb"` | Default node-dot color. |
| `nodeRadius` | `5` | Node-dot radius. |
| `labelOffset` | `18` | Node-label distance above its dot. |
| `fontSize` | `14` | Node-label size. |
| `labelColor` | `"#0f172a"` | Node-label color. |
| `probabilityFontSize` | `12` | Branch-label size. |
| `probabilityColor` | `"#475569"` | Branch-label color. |

Leaves receive equal rows. Every parent is automatically centered between its children, so adding a new outcome does not require manual coordinates.

`rowGap` and `columnGap` fall back to their defaults when not positive. Other numeric controls such as `nodeRadius`, `strokeWidth`, and font sizes are passed through without strict validation, so use finite non-negative sizes.

## `polygonDiagram()`

`polygonDiagram()` is a visual grammar for labelled lesson geometry. It combines one polygon outline with automatic vertex, side, and angle labels; equality ticks; parallel marks; angle arcs; right-angle squares; and optional side extensions.

```js
polygonDiagram(5, options)
polygonDiagram(points, options)
polygonDiagram({ sides: 5, ...options })
polygonDiagram({ points, ...options })
```

<DiagramExample id="math-polygon-diagram" />

A number creates a regular polygon. A point array preserves the supplied geometry. Regular polygons default to radius `130`, start at the top, and proceed around the center. Custom polygons should be simple and convex when you want automatic interior-angle labels.

### Labels

```js
polygonDiagram(5, {
  vertexLabels: ["A", "B", "C", "D", "E"],
  sideLabels: ["a", "b", "c", "d", "e"],
  angleLabels: { A: "x", C: "y" }
})
```

`vertexLabels` defaults to `true`, which produces `A`, `B`, `C`, and so on. Set it to `false` for an unlabelled outline. `sideLabels` and `angleLabels` default to hidden. A label setting accepts `true`, `false`, an array in polygon order, or an object keyed by vertex name or numeric index.

The engine uses `placeLabels()` internally. Vertex labels prefer the outside of the polygon, side labels prefer the outside of their edge, and angle labels prefer the interior. Nearby candidates are tested automatically when text would cross an edge or overlap another label.

| Option | Default | What it changes |
| --- | --- | --- |
| `vertexLabelOffset` | `25` | Vertex-label distance from its corner. |
| `sideLabelOffset` | `24` | Side-label distance from its midpoint. |
| `angleLabelRadius` | `46` | Angle-label distance from its vertex. |
| `labelClearance` | `4` | Empty space requested around text. |
| `fontSize` | `18` | Shared text size. |
| `vertexFontSize`, `sideFontSize`, `angleFontSize` | shared size | Per-label-kind size overrides. |
| `labelColor` | `"#111827"` | Shared text color. |
| `vertexLabelColor`, `sideLabelColor`, `angleLabelColor` | shared color | Per-label-kind color overrides. |
| `labelWeight` | `600` | Text weight. |

### Marks

Edges use the order `AB`, `BC`, `CD`, and so on, with the closing edge last. Mark settings accept an array in that order or an object keyed by edge name:

```js
polygonDiagram(5, {
  sideMarks: { AB: 1, BC: 1, CD: 2 },
  parallelMarks: { DE: 1 },
  angleMarks: {
    A: 1,
    C: { count: 2, label: "y" },
    D: "right"
  }
})
```

- `sideMarks` calls `sideTicks()`. A number selects its tick count.
- `parallelMarks` calls `parallelMarks()`. A number selects its chevron count.
- `angleMarks` calls `angleMark()`. Use `true`, a count, an options object, or a string label.
- The special angle value `"right"`, or `{ type: "right" }`, calls `rightAngleMark()`.
- Set a mark collection to `true` to mark every side or angle once.

Mark option objects pass through controls such as `count`, `size`, `gap`, `position`, `radius`, `fill`, `color`, and `width` to the underlying annotation helper. `markWidth` supplies the shared default width.

### Side extensions

```js
polygonDiagram(4, {
  extensions: [
    { side: "AB", before: 45, beforeLabel: "P" },
    { side: "CD", after: 70, afterLabel: "Q", dash: [7, 5] }
  ]
})
```

Each extension chooses `side` by edge name, edge index, or a pair such as `["A", "B"]`. `before` extends behind the first endpoint and `after` extends beyond the second. If neither is supplied, `after` defaults to `50`. Endpoint labels use the same collision-aware placement as other labels.

Every result stores geometry anchors: `vertex0`, `side0`, letter anchors such as `A`, label anchors such as `vertexLabel0` and `angleLabel0`, plus `extension0Before` and `extension0After`.

| Outline option | Default |
| --- | --- |
| `radius` | `130` for regular polygons |
| `rotation` | `-Math.PI / 2` |
| `fill` | `"none"` |
| `stroke` / `color` | `"#1f2937"` |
| `strokeWidth` | `2.5` |
| `opacity` | `1` |

Adjacent custom points must be distinct. Unknown vertex or side names, invalid regular-polygon side counts, and negative extension lengths throw useful errors.

## `triangleDiagram()`

`triangleDiagram()` uses the same labels, marks, extensions, styles, and anchors as `polygonDiagram()`, but it owns the triangle construction too.

```js
triangleDiagram({ layout: "scalene", ...options })
triangleDiagram({ lengths: [AB, BC, CA], ...options })
triangleDiagram({ points: [A, B, C], ...options })
```

<DiagramExample id="math-triangle-diagram" />

### Presets

| `layout` | Construction | Automatic mark |
| --- | --- | --- |
| `"scalene"` | Offset apex over a base | none |
| `"right"` | Vertical and horizontal legs meet at `A` | right-angle square at `A` |
| `"isosceles"` | Centered apex | matching ticks on `BC` and `CA` |
| `"equilateral"` | Exact 60-degree geometry | matching ticks on all sides |

Preset width defaults to `320`, except the equilateral preset uses `280`. Height defaults to `220`; an equilateral triangle calculates its own exact height. For the scalene preset, `apex` defaults to `0.62`, measured from the left side of the base as a fraction of width.

Set `automaticMarks: false` to hide preset marks. Explicit `sideMarks` and `angleMarks` override individual automatic entries. `rightAngle: "B"` is a concise way to force a right-angle square at a named vertex.

### Construct from side lengths

```js
triangleDiagram({
  lengths: [3, 4, 5], // AB, BC, CA
  sideLabels: true,
  vertexLabels: ["A", "B", "C"]
})
```

The engine applies the triangle construction internally, then scales the result to fit `width` by `height`. It preserves the exact side ratios. Equal lengths receive matching tick marks, and a Pythagorean triple receives a right-angle square at the correct opposite vertex. Impossible lengths throw a `RangeError` instead of producing invalid SVG.

For a triangle, `sideLabels: true` shows the supplied lengths when `lengths` exists; otherwise it uses the conventional edge-order labels `c`, `a`, `b` for `AB`, `BC`, `CA`.

## `radialPolygon()`

`radialPolygon()` divides a polygon from one shared center into equal-angle triangular sectors. This is the correct grammar for polygon fraction models, color wheels, radial classifications, and the twelve-part diagram below. It is not a circle-sector helper and it is not a star polygon.

```js
radialPolygon(parts = 12, options = {})
radialPolygon({ parts, ...options })
```

`radialPartition` is an exact semantic alias.

<DiagramExample id="math-radial-polygon" />

```js
draw(radialPolygon(12, {
  palette: ["#1598d5", "#ffad2f"]
}));
```

The engine creates the outer vertices, center triangles, spokes, alternating colors, and outline. Every result remains an ordinary static `Diagram`.

| Option | Default | What it changes |
| --- | --- | --- |
| `radius` / `outerRadius` | `120` | Normal distance from the center to each outer vertex. |
| `rotation` | top side, or top spike | Rotates the complete construction in radians. |
| `center` | `[0, 0]` | Shared center point. |
| `palette` / `colors` | blue and orange | Colors cycled through the sectors. |
| `sectorColor(index, parts)` | none | Calculates an individual sector color. |
| `stroke` | `"#172033"` | Spoke and boundary color. |
| `strokeWidth` | `2.5` | Spoke and boundary thickness. |
| `spokes` / `dividers` | `true` | Shows or hides center-to-vertex lines. |
| `outline` / `boundary` | `true` | Shows or hides the outer boundary. |
| `opacity` | `1` | Whole-diagram opacity. |

### Spikes and custom radial profiles

Star/spike construction changes the **outer boundary**; it is separate from the center partition itself. The same helper supports it without requiring a second diagram component:

```js
radialPolygon({
  spikes: 6,
  radius: 120,
  innerRadius: 62,
  palette: ["#7c3aed", "#fbbf24"]
})
```

A numeric `spikes: 6` creates twelve alternating outer/inner vertices. `spikeRadius` is an alias of `innerRadius`; `spikeDepth` describes how far the valleys move inward. Alternating spikes require an even vertex count.

For a completely custom outline, pass one radius per vertex or a callback:

```js
radialPolygon(8, {
  radii: [120, 72, 104, 62, 120, 72, 104, 62]
})

radialPolygon(10, {
  radii: index => index % 2 ? 60 : 120
})
```

The result exposes `center`, `vertex0`, `vertex1`, and `sector0`, `sector1`, and so on as anchors. `parts` must be an integer of at least `3`; palettes must be nonempty; every custom radius must be positive.

## `rightTriangle()`

A right triangle contains one 90° angle. The two sides touching that angle are the legs, and the side opposite it is the hypotenuse. The helper includes a small right-angle marker.

```js
rightTriangle(a = 3, b = 4, options = {})
rightTriangle({ a, b, ...options })
```

The object form also accepts `base` and `height` aliases.

<DiagramExample id="math-right-triangle" />

| Option | Default | What it changes |
| --- | --- | --- |
| `scale` | `42` | Diagram units per mathematical side unit. It changes size, not the side ratio. |
| `fill` | `"#dbeafe"` | Triangle interior. |
| `stroke` | `"#1e40af"` | Triangle and right-angle-marker color. |
| `strokeWidth` | `3` | Triangle outline thickness. |
| `opacity` | `1` | Triangle transparency. |
| `labels` | `true` | Shows or hides all side labels. |
| `aLabel` | value of `a` | Horizontal-leg label. |
| `bLabel` | value of `b` | Vertical-leg label. |
| `cLabel` | computed hypotenuse | Sloping-side label, rounded to at most four decimals. |
| `fontSize` | `16` | Side-label size. |

The hypotenuse value is calculated with `Math.hypot(a, b)`. Custom label strings let you add units without changing the geometry.

The right-angle marker uses the triangle `stroke` color but has a fixed width of `2`; `strokeWidth` changes only the triangle outline. Side-label color is currently the default text color and has no separate option. Non-positive or non-finite `a`, `b`, and `scale` values fall back to their defaults.

## `pythagoras()`

This construction places a square on every side of a right triangle. It makes the Pythagorean theorem visible: the areas on the two legs add to the area on the hypotenuse.

```js
pythagoras(a = 3, b = 4, options = {})
```

Aliases: `pythagoreanDiagram`, `pythagorasDiagram`, and `pythagoreanTheorem`.

<DiagramExample id="math-pythagoras" />

| Option | Default | What it changes |
| --- | --- | --- |
| `scale` | `36` | Diagram size per mathematical unit. |
| `palette` | blue, green, gold | Three square colors in leg, leg, hypotenuse order. |
| `stroke` | `"#334155"` | Square and triangle outline color. |
| `strokeWidth` | `3` | Triangle-outline thickness. Square outlines use `2`. |
| `squareOpacity` | `0.55` | Square transparency. |
| `triangleFill` | `"#ffffff"` | Central triangle fill. |
| `labels` | `true` | Shows or hides square labels. |
| `aSquareLabel` | `"a²"` | First leg-square label. |
| `bSquareLabel` | `"b²"` | Second leg-square label. |
| `cSquareLabel` | `"c²"` | Hypotenuse-square label. |
| `fontSize` | `20` | Square-label size. |

Like `rightTriangle()`, the function accepts one object and the aliases `base`/`height`.

Square outlines have a fixed width of `2`, square labels use the fixed color `#0f172a`, and only the central triangle uses `strokeWidth`. A palette should contain at least three colors; missing entries become invalid paint values rather than receiving another documented fallback.

## `spiral()`

A spiral turns around a center while its radius changes. This helper samples an open polyline, so it stays sharp at every zoom level and exports as vector SVG.

```js
spiral(turns = 4, options = {})
spiral({ turns, ...options })
```

<DiagramExample id="math-spiral" />

| Option | Default | What it changes |
| --- | --- | --- |
| `turns` | `4` | Number of complete revolutions. Fractions are allowed. |
| `samples` | about `100` per turn | Number of points. More points make a smoother but larger SVG. |
| `startRadius` | `0` | Distance from the center at the beginning. |
| `endRadius` / `radius` | `120` | Distance from the center at the end. |
| `startAngle` | `0` | Initial direction in radians. |
| `clockwise` | `true` | Set `false` to reverse the turning direction. |
| `growth` | `"linear"` | How radius grows: `"linear"`, `"exponential"`, or a function. |
| `color` | `"#7c3aed"` | Spiral color. |
| `strokeWidth` | `3` | Spiral thickness. |

A custom growth function receives progress `t` from `0` to `1` and the current angle:

```js
spiral(5, {
  growth: (t, angle) => 15 + 100 * t * t
})
```

The callback's result is converted to a finite number; invalid results fall back to `startRadius`. The only special string is `"exponential"`; `"linear"` and every other non-function value currently use linear growth. `turns` and `endRadius`/`radius` must resolve to positive numbers or their defaults are used. `samples` is floored to an integer with a minimum of `8`.

## `sierpinski()`

A Sierpinski triangle is a recursive pattern. At every step, one triangle becomes three half-size corner triangles. The same rule repeats inside each new triangle.

```js
sierpinski(depth = 4, options = {})
sierpinski({ depth, ...options })
```

<DiagramExample id="math-sierpinski" />

| Option | Default | What it changes |
| --- | --- | --- |
| `depth` | `4` | Number of recursive subdivision steps. Minimum is `0`. |
| `size` | `320` | Width of the outer triangle. |
| `palette` | one fill color | Colors cycled across branches. |
| `fill` | `"#2563eb"` | Color used when no palette is supplied. |
| `stroke` | `"none"` | Small-triangle outline color. |
| `strokeWidth` | `0` | Small-triangle outline thickness. |

Depth `n` creates `3ⁿ` filled triangles. Depth `4` makes `81`; depth `8` makes `6,561`. Raise depth carefully because SVG size and render time grow quickly.

`depth` is floored to a non-negative integer, and invalid values fall back to `4`. `size` must be positive or falls back to `320`. Supply a nonempty palette; an empty array leaves the recursive fill lookup undefined.

## Choosing a reusable diagram

| Concept | Helper |
| --- | --- |
| Set membership and overlap | `vennDiagram()` |
| Multi-stage outcomes | `probabilityTree()` |
| General labelled polygon geometry | `polygonDiagram()` |
| Constructed triangles with semantic marks | `triangleDiagram()` |
| Polygon divided into central sectors | `radialPolygon()` |
| A measured 90° triangle | `rightTriangle()` |
| Areas in the Pythagorean theorem | `pythagoras()` |
| Radial growth through turns | `spiral()` |
| Self-similarity and recursion | `sierpinski()` |
