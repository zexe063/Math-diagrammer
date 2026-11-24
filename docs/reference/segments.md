# Advanced path segments

The advanced geometry segment classes represent mathematically analyzable pieces of a path. They can sample points, calculate derivatives and unit tangents, reverse direction, transform themselves, and return accurate bounds.

```js
import {
  LineSegment, QuadraticSegment, CubicSegment, ArcSegment
} from "math-diagrammer/geometry";
```

The standard parameter `t` normally means:

- `0`: segment start;
- `1`: segment end;
- a value between them: a point along the segment.

Line and Bézier methods do not clamp `t`, so values outside `[0, 1]` extrapolate. A degenerate `ArcSegment` is the exception: its `pointAt(t)` clamps before linearly interpolating.

## Shared segment ideas

All four segment classes expose:

| Method | Meaning |
| --- | --- |
| `.pointAt(t)` | Point at parameter `t` |
| `.at(t)` | Alias of `.pointAt(t)` |
| `.derivativeAt(t)` | Non-normalized direction and speed |
| `.tangentAt(t)` | Normalized derivative; zero derivative becomes `(0, 0)` |
| `.bounds()` | Axis-aligned Bounds containing the segment |
| `.reverse()` | New segment traveling the opposite direction |
| `.transform(matrix)` | New transformed segment |
| `.transformed(matrix)` | Alias of `.transform(matrix)` |

## LineSegment

### `new LineSegment(start, end)`

Converts both endpoints with `Point.from()` and freezes the result.

Properties:

| Property | Meaning |
| --- | --- |
| `.start` | Starting Point |
| `.end` | Ending Point |

<DiagramExample id="geometry-line-segment" />

Line-specific behavior:

- `.pointAt(t)` performs linear interpolation.
- `.derivativeAt()` returns `end.subtract(start)` and ignores its argument.
- `.tangentAt(t = 0)` normalizes that constant derivative.
- `.bounds()` contains only the two endpoints.
- `.reverse()` swaps `start` and `end`.

## QuadraticSegment

### `new QuadraticSegment(start, control, end)`

A quadratic Bézier has one control point that pulls the curve.

Properties:

| Property | Meaning |
| --- | --- |
| `.start` | Starting Point |
| `.control` | Control Point |
| `.end` | Ending Point |

<DiagramExample id="geometry-bezier-segments" />

Additional method:

### `.extremaParameters()`

Returns unique interior `t` values where either x or y reaches a local extremum. Values near `0` and `1` are excluded using `EPSILON`.

`.bounds()` evaluates the curve at `0`, `1`, and every extrema parameter. `.reverse()` swaps the endpoints while retaining the same control point.

## CubicSegment

### `new CubicSegment(start, control1, control2, end)`

A cubic Bézier has two control points, giving independent control over how it leaves the start and approaches the end.

Properties:

| Property | Meaning |
| --- | --- |
| `.start` | Starting Point |
| `.control1` | First control Point |
| `.control2` | Second control Point |
| `.end` | Ending Point |

The Preview/Code block above shows both quadratic and cubic segments.

### `.extremaParameters()`

Solves the quadratic derivatives of x and y, then returns unique roots strictly inside the segment. `.bounds()` samples both endpoints and those extrema.

`.reverse()` swaps endpoints **and** swaps the control-point order:

```text
(start, control1, control2, end)
becomes
(end, control2, control1, start)
```

## ArcSegment

`ArcSegment` represents a possibly rotated elliptical arc. It supports SVG endpoint parameters, center parameters, and arbitrary transformed basis vectors.

### Endpoint constructor

```text
new ArcSegment(
  start,
  end,
  radiusX,
  radiusY = radiusX,
  rotationDegrees = 0,
  largeArc = false,
  sweep = true
)
```

`start` and `end` are normalized with `Point.from()`. Radii become absolute numeric values. Rotation is supplied in degrees for SVG compatibility.

### Stored properties

| Property | Meaning |
| --- | --- |
| `.start`, `.end` | Endpoint Points |
| `.center` | Calculated ellipse center |
| `.radiusX`, `.radiusY` | Corrected non-negative radii |
| `.rotation` | Ellipse rotation in radians |
| `.rotationDegrees` | Rotation in degrees |
| `.startAngle` | Start angle in ellipse basis coordinates |
| `.sweepAngle` | Signed angle traveled |
| `.largeArc` | SVG large-arc flag |
| `.sweep` | SVG sweep flag |
| `.degenerate` | Whether the arc behaves as a straight interpolation |
| `.basisX`, `.basisY` | World-space ellipse basis Vectors |

### `ArcSegment.fromSvg(...)`

Static form with the same arguments as the constructor.

### `ArcSegment.fromSvgEndpoint(...)`

Alias of `ArcSegment.fromSvg(...)`.

### `ArcSegment.fromCenter(center, radiusX, radiusY, startAngle, sweepAngle, rotation = 0)`

Builds from center parameters. Unlike endpoint construction, `rotation` is in **radians**.

<DiagramExample id="geometry-arc-segment" />

### `ArcSegment.fromBasis(center, basisX, basisY, startAngle, sweepAngle)`

Builds from two arbitrary world-space basis vectors. This form preserves an ellipse after general affine transformations, including skew.

It derives `radiusX`, `radiusY`, and `rotation` from the basis vectors. Degeneracy occurs when either basis is effectively zero or the sweep is effectively zero.

### Arc methods

| Method | Meaning |
| --- | --- |
| `.pointAt(t)` | Uses `startAngle + sweepAngle * t`; degenerate arcs clamp and lerp endpoints |
| `.pointAtAngle(angle)` | Point at a direct ellipse-basis angle |
| `.derivativeAt(t)` | Derivative including sweep magnitude and direction |
| `.tangentAt(t)` | Normalized derivative |
| `.extremaAngles()` | Candidate x/y extrema that actually lie on the sweep |
| `.bounds()` | Endpoints plus all swept extrema; endpoint bounds when degenerate |
| `.reverse()` | Same basis with start advanced to the old end and negated sweep |
| `.transform(matrix)` | Transforms center and both basis vectors |

## `svgArcToCenter(...)`

```text
svgArcToCenter(
  start,
  end,
  radiusX,
  radiusY,
  rotationDegrees = 0,
  largeArc = false,
  sweep = true
)
```

Converts SVG endpoint arc parameters into a center representation. If the requested radii are too small to connect the endpoints, it scales both radii upward according to the SVG algorithm.

<DiagramExample id="geometry-svg-arc-center" />

Returned object:

| Field | Meaning |
| --- | --- |
| `center` | Calculated Point |
| `radiusX`, `radiusY` | Absolute, possibly corrected radii |
| `rotation` | Rotation in radians |
| `rotationDegrees` | Original numeric degree value |
| `startAngle` | Ellipse-basis start angle |
| `sweepAngle` | Signed sweep angle |
| `degenerate` | `true` for equal endpoints or a near-zero radius |

For a degenerate result, the center is the midpoint, both angles are zero, and the radii remain their absolute input values.

## Bounds helpers

### `segmentBounds(segment)`

Calls `segment.bounds()`. It throws `TypeError("Expected a path segment with bounds().")` when the input is missing or has no callable `bounds` method.

### `pathBounds(segments)`

Reduces a segment array into the union of every `segmentBounds()` result. An empty array returns `Bounds.empty()`.

<DiagramExample id="geometry-path-bounds" />

Back to [advanced geometry foundations](./geometry-foundations.md) or the [authoring path API](./geometry.md).

## Copyable examples for every segment member

The examples below use the dedicated `math-diagrammer/geometry` entry point and keep each call small enough to paste into a module.

### Shared methods on every segment

```js
import { LineSegment, Point, Matrix } from "math-diagrammer/geometry";

const segment = new LineSegment(new Point(0, 0), new Point(100, 40));
segment.pointAt(0.25)                         // Point(25, 10)
segment.at(0.25)                              // alias of pointAt()
segment.derivativeAt(0.25)                    // Vector(100, 40)
segment.tangentAt(0.25)                       // unit Vector
segment.bounds()                              // Bounds around both endpoints
segment.reverse()                             // LineSegment(100, 40 -> 0, 0)
segment.transform(Matrix.translation(10, 5))  // translated LineSegment
segment.transformed(Matrix.scale(2))         // alias of transform()
```

### Every `LineSegment` member

```js
import { LineSegment, Matrix, Point } from "math-diagrammer/geometry";

const line = new LineSegment([0, 0], { x: 80, y: 30 });
line.start                                     // Point(0, 0)
line.end                                       // Point(80, 30)
line.pointAt(0.5)                              // Point(40, 15)
line.at(0.5)                                   // same result
line.derivativeAt()                            // Vector(80, 30)
line.tangentAt()                               // normalized direction
line.bounds()                                  // exact endpoint Bounds
line.reverse()                                 // endpoints swapped
line.transform(Matrix.translation(5, 0))       // transformed copy
line.transformed(Matrix.identity())            // alias of transform()
```

`start` and `end` accept any value understood by `Point.from()`: a Point, `[x, y]`, or `{ x, y }`.

### Every `QuadraticSegment` member

```js
import { Point, QuadraticSegment, Matrix } from "math-diagrammer/geometry";

const quadratic = new QuadraticSegment(
  new Point(0, 0), new Point(50, -80), new Point(100, 0)
);
quadratic.start                                // first endpoint
quadratic.control                              // one control Point
quadratic.end                                  // final endpoint
quadratic.pointAt(0.5)                         // exact midpoint on curve
quadratic.at(0.5)                              // alias of pointAt()
quadratic.derivativeAt(0.5)                   // curve direction and speed
quadratic.tangentAt(0.5)                       // unit tangent
quadratic.extremaParameters()                 // interior x/y-extremum parameters
quadratic.bounds()                             // endpoint + extrema bounds
quadratic.reverse()                            // same control, reversed endpoints
quadratic.transform(Matrix.scale(1.5))        // transformed copy
quadratic.transformed(Matrix.identity())      // alias of transform()
```

### Every `CubicSegment` member

```js
import { CubicSegment, Point, Matrix } from "math-diagrammer/geometry";

const cubic = new CubicSegment(
  [0, 0], [30, -80], { x: 70, y: 80 }, [100, 0]
);
cubic.start                                    // first endpoint
cubic.control1                                 // first control Point
cubic.control2                                 // second control Point
cubic.end                                      // final endpoint
cubic.pointAt(0.5)                             // exact point at t = 0.5
cubic.at(0.5)                                  // alias of pointAt()
cubic.derivativeAt(0.5)                        // derivative Vector
cubic.tangentAt(0.5)                            // unit tangent
cubic.extremaParameters()                      // interior derivative roots
cubic.bounds()                                  // endpoint + extrema bounds
cubic.reverse()                                // controls swap as direction reverses
cubic.transform(Matrix.rotation(Math.PI / 6))  // transformed copy
cubic.transformed(Matrix.identity())           // alias of transform()
```

### Every `ArcSegment` constructor and property

```js
import { ArcSegment, Point, Vector } from "math-diagrammer/geometry";

const endpointArc = new ArcSegment(
  new Point(-80, 0), new Point(80, 0),
  100, 60, 20, false, true
);
endpointArc.start; endpointArc.end             // endpoint Points
endpointArc.center                              // calculated center Point
endpointArc.radiusX; endpointArc.radiusY       // corrected radii
endpointArc.rotation                            // radians
endpointArc.rotationDegrees                    // original degree form
endpointArc.startAngle; endpointArc.sweepAngle  // center parameterization
endpointArc.largeArc; endpointArc.sweep         // SVG flags
endpointArc.degenerate                          // boolean degeneracy marker
endpointArc.basisX; endpointArc.basisY         // world-space basis Vectors

ArcSegment.fromSvg([0, 0], [100, 0], 70, 40)    // endpoint constructor form
ArcSegment.fromSvgEndpoint([0, 0], [100, 0], 70, 40)
                                                // exact alias of fromSvg()
ArcSegment.fromCenter(
  new Point(0, 0), 100, 60, 0, Math.PI, Math.PI / 8
)                                               // center + radian angles
ArcSegment.fromBasis(
  new Point(0, 0), new Vector(100, 0), new Vector(0, 60), 0, Math.PI
)                                               // arbitrary basis form
```

### Every `ArcSegment` method

```js
import { ArcSegment, Matrix, Point } from "math-diagrammer/geometry";

const arc = ArcSegment.fromCenter(
  new Point(0, 0), 100, 60, -Math.PI / 2, Math.PI, 0
);
arc.pointAt(0.25)                               // sampled point by t
arc.at(0.25)                                    // alias of pointAt()
arc.pointAtAngle(Math.PI / 4)                   // direct ellipse-basis angle
arc.derivativeAt(0.25)                          // derivative Vector
arc.tangentAt(0.25)                              // unit tangent
arc.extremaAngles()                             // swept x/y candidate angles
arc.bounds()                                    // exact swept bounds
arc.reverse()                                   // same arc in reverse direction
arc.transform(Matrix.skewX(Math.PI / 10))      // transformed basis copy
arc.transformed(Matrix.identity())              // alias of transform()
```

### `svgArcToCenter()` and its returned fields

```js
import { Point, svgArcToCenter } from "math-diagrammer/geometry";

const converted = svgArcToCenter(
  new Point(-100, 20), new Point(100, -20),
  130, 70, 18, false, true
);
converted.center                               // center Point
converted.radiusX; converted.radiusY           // absolute/corrected radii
converted.rotation                              // radians
converted.rotationDegrees                      // degrees
converted.startAngle                            // ellipse-basis start
converted.sweepAngle                            // signed sweep
converted.degenerate                            // equal endpoints/radius test
```

### Every bounds helper

```js
import {
  LineSegment, Point, QuadraticSegment,
  pathBounds, segmentBounds
} from "math-diagrammer/geometry";

const parts = [
  new LineSegment([0, 0], [40, 20]),
  new QuadraticSegment([40, 20], [70, -30], [100, 10])
];
segmentBounds(parts[0])                         // Bounds for one segment
pathBounds(parts)                               // union of all segment Bounds
pathBounds([])                                  // Bounds.empty()
segmentBounds({})                               // throws TypeError
```
