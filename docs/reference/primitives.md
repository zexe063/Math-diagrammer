# Primitives

Primitives are the smallest visible building blocks in Math Diagrammer. Every primitive returns an immutable `Diagram`, so the same result can be styled, transformed, aligned, layered, or reused without changing the original value.

This page is designed to be read like a lesson and used like an API reference. For every visual function:

1. inspect the rendered **Preview**;
2. open **Code** to see the complete runnable program;
3. read the exact inputs, output, defaults, aliases, and edge cases;
4. copy the example and change one value at a time.

::: info Coordinate system
The origin `[0, 0]` is at the center of each new primitive. Positive `x` moves right and positive `y` moves down. Unless a function explicitly says otherwise, angles are measured in radians.
:::

## Circles and ellipses

### `circle(radius)`

<DiagramExample id="core-circle" />

Creates a circle centered at `[0, 0]`.

```text
circle(radius) -> Diagram
```

| Input | Type | Meaning |
| --- | --- | --- |
| `radius` | `number` | Distance from the center to the edge. The geometric diameter is `radius * 2`. |

The returned Diagram starts with fill `#e5e7eb` and the normal default stroke. Its visible layout bounds also include half of the current stroke width.

```js
const small = circle(24);
const outlined = circle(60).fill("none").stroke("#075dcc", 4);
```

::: warning Input validation
`circle()` currently does not reject a negative or non-finite radius. Pass a finite value greater than or equal to zero.
:::

### `ellipse(rx, ry)`

<DiagramExample id="core-ellipse" />

Creates an oval centered at `[0, 0]`. It is a circle stretched independently in the horizontal and vertical directions.

```text
ellipse(rx, ry) -> Diagram
```

| Input | Type | Meaning |
| --- | --- | --- |
| `rx` | `number` | Horizontal radius. The geometric width is `rx * 2`. |
| `ry` | `number` | Vertical radius. The geometric height is `ry * 2`. |

When `rx === ry`, the geometry is circular. Both values should be finite and non-negative; the function does not currently validate them.

## Rectangles

### `rectangle(width, height = width)`

<DiagramExample id="core-rectangle" />

Creates a sharp-cornered rectangle centered at `[0, 0]`.

```text
rectangle(width, height = width) -> Diagram
rect(width, height = width) -> Diagram
square(size) -> Diagram
```

| Input | Type | Default | Meaning |
| --- | --- | --- | --- |
| `width` | `number` | required | Full horizontal size. |
| `height` | `number` | `width` | Full vertical size. |

Aliases and shortcuts:

- `rect` is the same function as `rectangle`.
- `square(size)` calls `rectangle(size, size)`.

The returned Diagram begins with fill `#e5e7eb`. Width and height are not validated, so authors should pass finite non-negative values.

### `roundedRect(width, height, radius?)`

<DiagramExample id="core-rounded-rect" />

Creates a rectangle with rounded corners, centered at `[0, 0]`.

```text
roundedRect(
  width,
  height,
  radius = Math.min(width, height) * 0.1
) -> Diagram
```

| Input | Type | Default | Meaning |
| --- | --- | --- | --- |
| `width` | `number` | required | Full horizontal size. |
| `height` | `number` | required | Full vertical size. |
| `radius` | `number` | 10% of the shorter side | Corner radius passed to SVG `rx` and `ry`. |

Use it for lesson cards, flowchart nodes, labels, buttons, and framed explanations. The function does not clamp the radius or validate dimensions.

## Polygons

### `regularPolygon(sides, radius)`

<DiagramExample id="core-regular-polygon" />

Creates a centered polygon whose corners are equally spaced around a circle. The first corner points upward.

```text
regularPolygon(sides, radius) -> Diagram
```

| Input | Type | Meaning |
| --- | --- | --- |
| `sides` | `integer` | Number of corners and edges. Must be at least `3`. |
| `radius` | `number` | Distance from the center to each corner. |

Returns the same kind of filled closed Diagram as `polygon()`. If `sides` is not an integer or is below `3`, it throws `RangeError: regularPolygon needs at least 3 sides.` Radius is not validated.

### `triangle(sizeOrPoints = 100)`

<DiagramExample id="core-triangle" />

Provides a short way to create either a centered regular triangle or a polygon from explicit points.

```text
triangle(size = 100) -> Diagram
triangle(points) -> Diagram
```

| Form | Meaning |
| --- | --- |
| `triangle(100)` | Calls `regularPolygon(3, 100 / Math.sqrt(3) * 1.2)`. The value is a convenient visual size, not an exact side length. |
| `triangle([[x1, y1], [x2, y2], [x3, y3]])` | Passes the array directly to `polygon()`. |

The array form is not restricted to exactly three entries by the implementation. For a meaningful triangle, supply exactly three distinct point-like values.

### `polygon(points)`

<DiagramExample id="core-polygon" />

Connects points in order and closes the last point back to the first.

```text
polygon(points) -> Diagram
```

Each entry may be:

```text
Point
[x, y]
{ x, y }
```

The result starts with fill `#e5e7eb`, making its interior visible. An empty array returns an empty Diagram. The function expects an array; malformed point values are rejected by `normalizePoint()`.

## Lines

### `line(start, end)` and `line(length)`

<DiagramExample id="core-line" />

Creates one straight open path.

```text
line(startPoint, endPoint) -> Diagram
line(length) -> Diagram
```

| Form | Meaning |
| --- | --- |
| `line(start, end)` | Normalizes both point-like values and joins them. |
| `line(length)` | Makes a centered horizontal line from `[-length / 2, 0]` to `[length / 2, 0]`. |

Point-like values may be a `Point`, `[x, y]`, or `{ x, y }`. Use `.stroke(color, width)` for appearance. A line has no closed interior, so filling it is normally meaningless.

### `polyline(points)`

<DiagramExample id="core-polyline" />

Visits several points with connected straight segments while leaving the first and final points unconnected.

```text
polyline(points) -> Diagram
```

Use it for graph traces, routes, zigzags, spirals made from samples, and open outlines. Points accept the same three point-like forms as `polygon()`. An empty array returns an empty Diagram; a one-point array records only a move and draws no visible segment.

## Arcs and circular regions

### `arc(radius, startAngle, endAngle)`

<DiagramExample id="core-arc" />

Creates the curved edge of a circular sweep.

```text
arc(radius, startAngle, endAngle) -> Diagram
```

| Input | Type | Meaning |
| --- | --- | --- |
| `radius` | `number` | Radius of the imagined circle. |
| `startAngle` | `number` | Starting direction in radians. |
| `endAngle` | `number` | Ending direction in radians. |

Angles follow the SVG screen coordinate system: `0` points right and positive angles turn toward positive `y`—clockwise on screen. The function normalizes the sweep into the positive direction.

If the absolute difference between the two angles is at least one complete turn, the function returns `circle(radius)`. Because a circle starts filled, use `.fill("none")` when you want only its outline.

### `sector(radius, startAngle, endAngle)`

<DiagramExample id="core-sector" />

Creates a closed slice from the center of a circle to its edge—like a piece of pie.

```text
sector(radius, startAngle, endAngle) -> Diagram
wedge(radius, startAngle, endAngle) -> Diagram
```

`wedge` is an exact alias of `sector`. The result starts with fill `#e5e7eb`. A sweep of at least one complete turn returns `circle(radius)`.

### `annularSector(innerRadius, outerRadius, startAngle, endAngle)`

<DiagramExample id="core-annular-sector" />

Creates a closed slice from a ring, with one outer arc and one inner arc.

```text
annularSector(
  innerRadius,
  outerRadius,
  startAngle,
  endAngle
) -> Diagram
```

| Input | Rule |
| --- | --- |
| `innerRadius` | Must be greater than or equal to `0`. |
| `outerRadius` | Must be strictly greater than `innerRadius`. |
| `startAngle`, `endAngle` | Radians, using the same direction as `arc()`. |

Invalid radii throw `RangeError: annularSector requires 0 <= innerRadius < outerRadius.` The function does not otherwise validate finite numeric input.

### `ring(innerRadius, outerRadius)`

<DiagramExample id="core-ring" />

Creates a complete donut-shaped region.

```text
ring(innerRadius, outerRadius) -> Diagram
```

Internally it calls `annularSector(innerRadius, outerRadius, 0, Math.PI * 2 - 1e-7)`. The tiny subtraction avoids the SVG rule that a single arc cannot represent a full circle. It inherits the same radius validation and `RangeError` as `annularSector()`.

## Text and mathematics

### `text(value, size = 18)`

<DiagramExample id="core-text" />

Creates ordinary centered SVG text.

```text
text(value, size = 18) -> Diagram
```

| Input | Type | Meaning |
| --- | --- | --- |
| `value` | any | Converted with `String(value)`. |
| `size` | `number` | Initial font size in diagram units. |

Important behavior:

- CoFo Sans is the default font family.
- A custom `baseline` anchor is added below the text center for row alignment.
- Text bounds are estimated from character count, so they are intentionally approximate.
- If the complete string begins and ends with `$`, `text()` delegates to `math()`.
- The initial fill and stroke are both `none`; the renderer uses the Diagram's text color unless a visible fill is set.

Use `frame()` when exact repeated layout width matters.

### `math(value, size = 20)`

<DiagramExample id="core-math" />

Typesets inline TeX with MathJax and stores the resulting vector geometry inside the Diagram.

```text
math(value, size = 20) -> Diagram
mathText(value, size = 20) -> Diagram
latex(value, size = 20) -> Diagram
```

`mathText` and `latex` are exact aliases. Surrounding `$...$` delimiters are optional and removed before typesetting. Prefer `String.raw` for TeX containing backslashes:

```js
math(String.raw`\frac{x^2}{2}`, 28)
```

MathJax uses its base, AMS, `newcommand`, and autoload packages. Results are cached by source and font size. If conversion throws, the engine falls back to escaped ordinary SVG text rather than inserting unsafe markup.

The SVG stores glyph geometry, so formulas stay sharp and do not require a math font on the reader's device. Fluent color and opacity work after typesetting; changing font-family or font-weight does not re-typeset the formula.

### `dot(radius = 3)`

<DiagramExample id="core-dot" />

Creates a small filled point marker.

```text
dot(radius = 3) -> Diagram
```

It is shorthand for:

```js
circle(radius).fill("#111827").stroke("none", 0)
```

Because it returns a normal Diagram, it can be recolored with `.fill()`, moved with `.moveTo()`, or positioned with `place()`.

## Free-form paths

### `pen()`

<DiagramExample id="core-pen-path" />

Creates an empty immutable `PathData` command sequence.

```text
pen() -> PathData
```

`pen` is the author-friendly export name for the low-level path-data factory. It draws nothing by itself. Chain `.moveTo()`, `.lineTo()`, `.quadTo()`, `.cubicTo()`, `.arcTo()`, and `.close()`, then pass the result to `path()`.

Every command returns a new `PathData`; commands do not mutate the original value.

### `path(pathData = pen())`

The preview above demonstrates `pen()` and `path()` together.

```text
path(pathData = pen()) -> Diagram
```

Turns `PathData` into a normal styleable Diagram. Calling `path()` with no argument returns an empty path Diagram. Passing anything that is not an instance of `PathData` throws `TypeError: path() expects PathData.`

The Diagram's bounds are calculated analytically from line endpoints, Bézier extrema, and elliptical-arc extrema rather than only from control points.

Continue with [Geometry foundations](./geometry-foundations.md) for points, vectors, matrices, bounds, and numeric helpers, then [Path segments](./segments.md) for the complete curve-segment API.
