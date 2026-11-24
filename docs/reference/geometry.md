# Points, vectors, and paths

Geometry values are the quiet mathematical layer beneath visible diagrams. A `Point` says **where** something is. A `Vector` says **which direction and how far**. A `PathData` says **which route a pen should follow**.

All core geometry objects are immutable: methods return new values instead of changing the original.

::: info Two geometry entry points
This page covers the compact geometry values available directly in Studio and from `math-diagrammer`. For the complete analytic engine, import `math-diagrammer/geometry` and continue to [Geometry foundations](./geometry-foundations.md) and [Path segments](./segments.md).
:::

## Points

### `point(x = 0, y = 0)` and `new Point(x = 0, y = 0)`

**In plain language:** stores one exact coordinate.

| Parameter | Meaning |
| --- | --- |
| `x` | Horizontal coordinate; positive moves right |
| `y` | Vertical coordinate; positive moves down |

<DiagramExample id="core-point" />

Public properties:

| Property | Type | Meaning |
| --- | --- | --- |
| `.x` | `number` | Stored horizontal coordinate, converted with `Number(x)` |
| `.y` | `number` | Stored vertical coordinate, converted with `Number(y)` |

Point methods:

| Method | Result |
| --- | --- |
| `.add(vector)` | A new Point moved by the vector |
| `.sub(otherPoint)` | Vector from the other point to this point |
| `.distanceTo(otherPoint)` | Straight-line distance |
| `.lerp(otherPoint, t)` | Point partway between two points; `t = 0.5` means halfway |

`Point` instances are frozen. These root methods expect objects with suitable `x` and `y` properties; they do not normalize arrays themselves.

### `normalizePoint(value)`

Converts any of these forms into a `Point`:

```js
normalizePoint(point(20, 30))
normalizePoint([20, 30])
normalizePoint({ x: 20, y: 30 })
```

Missing array or object coordinates default to zero. Unsupported values throw a `TypeError`.

## Vectors

### `vector(x = 0, y = 0)` and `new Vector(x = 0, y = 0)`

**In plain language:** stores a movement, not a fixed location.

For example, `vector(80, -30)` means “move 80 right and 30 up.” Add it to any point to apply that same movement.

<DiagramExample id="core-vector" />

Public properties:

| Property | Type | Meaning |
| --- | --- | --- |
| `.x` | `number` | Stored horizontal component |
| `.y` | `number` | Stored vertical component |

Vector methods:

| Method | Meaning |
| --- | --- |
| `.add(other)` / `.sub(other)` | Combine vector components |
| `.scale(amount)` | Multiply the length; a negative amount reverses direction |
| `.neg()` | Reverse the vector |
| `.dot(other)` | Dot product |
| `.cross(other)` | 2D scalar cross product |
| `.magnitudeSquared()` | Squared length, avoiding a square root |
| `.magnitude()` | Vector length |
| `.normalize()` | Same direction with length 1; near-zero becomes `(0, 0)` |
| `.perpendicular()` | 90-degree vector `(-y, x)` |
| `.rotate(angle)` | Rotate by radians |

`Vector.polar(angle, magnitude = 1)` is the static constructor used by the root `polar()` helper. Vector instances are frozen.

### `polar(angle, magnitude = 1)`

**In plain language:** makes a vector from an angle and a length instead of separate x and y parts.

The angle is in radians. `Vector.polar(angle, magnitude)` is the equivalent static form.

<DiagramExample id="core-polar" />

### `midpoint(a, b)`

**In plain language:** returns the Point halfway between two Point values.

It is equivalent to `a.lerp(b, 0.5)`. In the root DSL, pass actual `Point`-compatible objects; arrays are not normalized by this helper.

<DiagramExample id="core-midpoint" />

### `distance(a, b)`

Returns `a.distanceTo(b)`. Like `midpoint()`, this root helper expects Point-compatible objects.

## Geometry constructions

These helpers remove coordinate calculations from lesson code. They are exported by the root Studio DSL, accept `point()` values, `[x, y]` arrays, and `{ x, y }` objects, and return points or immutable line segments that can be passed directly to drawing primitives.

### `lineIntersection(a, b, c, d, epsilon = EPSILON)`

Returns the unique Point where the infinite line through `a-b` meets the infinite line through `c-d`.

```js
const crossing = lineIntersection([0, 0], [100, 0], [40, -60], [40, 60]);
// Point(40, 0)
```

Parallel lines, coincident lines, and zero-length lines return `null`. You may also pass two segment-like objects with public `.start` and `.end` points:

```js
lineIntersection(firstSegment, secondSegment)
```

### `segmentIntersection(a, b, c, d, epsilon = EPSILON)`

Works like `lineIntersection()`, but the result must lie on both finite segments. A shared endpoint returns that endpoint. Collinear segments with a positive-length overlap return `null` because their intersection is not one unique point.

The two-segment overload is also available:

```js
segmentIntersection(firstSegment, secondSegment)
```

### `projectPoint(value, a, b, options = {})`

Drops a perpendicular from `value` to the infinite line through `a-b` and returns its foot.

```js
projectPoint([80, 50], [0, 0], [60, 0])                  // Point(80, 0)
projectPoint([80, 50], [0, 0], [60, 0], { clamp: true }) // Point(60, 0)
```

`projectPointToLine` is an exact alias of `projectPoint`. `projectPointToSegment(value, a, b)` always clamps the answer to the finite segment. All three accept a segment-like object instead of separate `a, b` endpoints. A zero-length reference line throws `RangeError`.

### `parallelThrough(value, a, b, options = {})`

Returns a `LineSegment` centered on `value` and parallel to `a-b`. Its default length equals the reference segment length; set `options.length` to choose a drawing span.

```js
const parallel = parallelThrough([0, -50], [-100, 0], [100, 0], {
  length: 240
});

draw(line(parallel.start, parallel.end).stroke("#2563eb", 3));
```

The returned segment also supports `.pointAt()`, `.derivativeAt()`, `.tangentAt()`, `.bounds()`, and the other shared `LineSegment` methods.

### `perpendicularThrough(value, a, b, options = {})`

Has the same overloads and return value as `parallelThrough()`, but rotates the reference direction by 90 degrees.

```js
const altitudeLine = perpendicularThrough(vertex, sideStart, sideEnd, {
  length: 300
});
```

### `angleBisector(vertex, firstRayPoint, secondRayPoint, options = {})`

Returns a `LineSegment` beginning at `vertex` and following the angle bisector. The default mode is the internal, smaller-angle bisector.

| Option | Meaning |
| --- | --- |
| `mode: "internal"` | Internal bisector; aliases: `"interior"`, `"minor"` |
| `mode: "external"` | External bisector; aliases: `"exterior"`, `"major"` |
| `external: true` | Short form for external mode |
| `length` | Output segment length; defaults to the shorter input ray |

```js
const bisector = angleBisector(b, a, c, { length: 120 });
draw(line(bisector.start, bisector.end).stroke("#dc2626", 3));
```

Zero-length rays, an undefined straight-ray bisector, an unknown mode, or a non-positive length throw `RangeError`.

### Triangle centers

The four standard center helpers accept three vertices:

| Function | Construction |
| --- | --- |
| `triangleCentroid(a, b, c)` | Intersection of the medians; always returns a Point |
| `triangleIncenter(a, b, c)` | Intersection of internal angle bisectors |
| `triangleCircumcenter(a, b, c)` | Center of the circle through all three vertices |
| `triangleOrthocenter(a, b, c)` | Intersection of the altitudes |
| `triangleCenters(a, b, c)` | Frozen object containing all four results |

`centroid`, `incenter`, `circumcenter`, and `orthocenter` are concise aliases of their `triangle...` forms. For collinear or coincident vertices, the incenter, circumcenter, and orthocenter return `null`; the arithmetic centroid remains defined.

```js
const a = point(0, 0);
const b = point(180, 0);
const c = point(0, -120);
const centers = triangleCenters(a, b, c);

draw(stack([
  polygon([a, b, c]).fill("none").stroke("#111827", 3),
  place(dot(7).fill("#dc2626"), centers.centroid),
  place(dot(7).fill("#2563eb"), centers.incenter),
  place(dot(7).fill("#15803d"), centers.circumcenter),
  place(dot(7).fill("#7c3aed"), centers.orthocenter)
]));
```

## Building a custom path

### `pen()` and `pathData()`

Both return an empty immutable `PathData`. `pen()` is the author-friendly name; `pathData()` is the low-level root alias.

```js
const data = pen().moveTo(-100, 0).lineTo(100, 0);
const diagram = path(data).fill("none").stroke("#2563eb", 4);
```

::: warning Path commands do not mutate
This code leaves `data` empty because the returned value was ignored:

```js
const data = pen();
data.moveTo(0, 0); // return value was lost
```

Chain commands or reassign: `data = data.moveTo(0, 0)`.
:::

### Path commands

<DiagramExample id="core-path-commands" />

#### `.moveTo(x, y)` or `.moveTo(pointLike)`

Lifts the imaginary pen and starts a new subpath at a point. Every drawn path should begin here.

#### `.lineTo(x, y)` or `.lineTo(pointLike)`

Draws a straight segment from the current point to the new point.

#### `.quadTo(cx, cy, x, y)` or `.quadTo(control, end)`

Draws a quadratic Bézier curve. One control point pulls the curve without being a point the curve must pass through.

#### `.cubicTo(c1x, c1y, c2x, c2y, x, y)` or `.cubicTo(control1, control2, end)`

Draws a cubic Bézier curve. Two control points independently shape the start and end of the curve.

#### `.arcTo(rx, ry, rotation, largeArc, sweep, end)`

Draws an elliptical SVG arc from the current point to `end`.

| Parameter | Meaning |
| --- | --- |
| `rx`, `ry` | Horizontal and vertical ellipse radii |
| `rotation` | Ellipse-axis rotation in **degrees**, unlike most DSL angles |
| `largeArc` | Choose the longer of the two possible routes |
| `sweep` | Choose the sweep direction |
| `end` | Point-like endpoint, or use separate `x, y` arguments |

#### `.close()`

Draws back to the current subpath's starting point. Before `moveTo()`, it safely does nothing.

Every command except `moveTo()` requires a current point and throws if the path has not started.

### Inspecting `PathData`

| Member | Meaning |
| --- | --- |
| `.commands` | Frozen array of recorded command objects |
| `.current` | Current Point, or `null` |
| `.start` | Current subpath's start Point, or `null` |
| `.bounds()` | Bounds covering lines, Bézier extrema, and elliptical arcs |
| `.toSVGPath()` | SVG `d` attribute text |

`new PathData(commands = [], current = null, start = null)` is public for extension authors, but normal diagrams should begin with `pen()`.

Recorded command objects use these public shapes:

| Type | Stored fields |
| --- | --- |
| `M` | `{ type, point }` |
| `L`, `Z` | `{ type, from, point }` |
| `Q` | `{ type, from, control, point }` |
| `C` | `{ type, from, control1, control2, point }` |
| `A` | `{ type, from, rx, ry, rotation, largeArc, sweep, point }` |

## Matrices

### `new Matrix(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0)`

A Matrix stores an SVG affine transform. Most authors use Diagram methods such as `.translate()` and `.rotateDeg()` instead.

Public coefficients are `.a`, `.b`, `.c`, `.d`, `.e`, and `.f`, following the SVG affine equations:

```text
x' = a*x + c*y + e
y' = b*x + d*y + f
```

Static constructors:

```text
Matrix.identity()
Matrix.translate(x, y)
Matrix.scale(x, y = x)
Matrix.rotate(angleInRadians)
Matrix.skew(xAngle = 0, yAngle = 0)
```

Methods:

| Method | Result |
| --- | --- |
| `.multiply(other)` | Composed Matrix |
| `.applyToPoint(point)` | Transformed Point including translation |
| `.applyToVector(vector)` | Transformed Vector without translation |
| `.inverse()` | Inverse Matrix; throws for a singular transform |
| `.toSVG()` | SVG `matrix(a b c d e f)` string |

## Bounds

### `new Bounds(minX, minY, maxX, maxY)`

Bounds is the immutable axis-aligned rectangle used by layout.

Static helpers:

```text
Bounds.empty()
Bounds.fromPoints(points)
```

Properties:

```text
.minX   .minY   .maxX   .maxY
.isEmpty   .width   .height   .center
```

Methods:

| Method | Meaning |
| --- | --- |
| `.include(point)` | Expand to include a Point |
| `.union(other)` | Smallest bounds containing both Bounds values |
| `.expand(x, y = x)` | Add space on every side |
| `.translate(x, y)` | Move the bounds |
| `.transform(matrix)` | Bounds around the four transformed corners |
| `.anchor(name)` | Named edge/corner/center Point |

Anchor names recognize the words `left`, `right`, `top`, and `bottom`, including camel-case combinations such as `topLeft`. Unknown names return the center.

### `EPSILON`

`EPSILON` is `1e-9`. The engine uses it when tiny floating-point differences should count as equal.

## Advanced engine geometry

This page covers the compact geometry types exported by the root authoring DSL. The dedicated `math-diagrammer/geometry` entry point provides numeric root solvers, richer Point/Vector/Matrix/Bounds types, and analyzable line, Bézier, and elliptical-arc segments.

- [Advanced geometry foundations](./geometry-foundations.md)
- [Advanced path segments](./segments.md)
