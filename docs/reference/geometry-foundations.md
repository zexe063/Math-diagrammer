# Advanced geometry foundations

This page documents the advanced geometry module. It is designed for engine work: robust numeric helpers, immutable coordinate types, affine transforms, containment tests, and curve analysis.

Import it through the dedicated package entry point:

```js
import { Point, Vector, Matrix, Bounds } from "math-diagrammer/geometry";
```

The Studio global DSL instead uses the smaller classes from `src/core/geometry.js`. Some names overlap, but their complete APIs and a few behaviors differ. See [Points, vectors, and paths](./geometry.md) for that authoring API.

All classes on this page are immutable. Methods return new values.

## Numeric helpers

Import numeric helpers from `math-diagrammer/geometry`:

```js
import {
  EPSILON, clamp, lerp, nearlyEqual,
  solveLinear, quadraticRoots, cubicRoots
} from "math-diagrammer/geometry";
```

<DiagramExample id="geometry-numeric-helpers" />

### `EPSILON`

`EPSILON` is `1e-9`. It is the default tolerance used when floating-point results should be treated as effectively equal.

### `isFiniteNumber(value)`

Returns `true` only when `value` is a JavaScript number and is finite. Numeric strings, `NaN`, and positive or negative infinity return `false`.

### `finiteOr(value, fallback = 0)`

Returns `value` if `Number.isFinite(value)` is true; otherwise returns `fallback`.

### `clamp(value, min = 0, max = 1)`

Restricts a number to the closed interval from `min` to `max`.

```js
clamp(-0.2)       // 0
clamp(0.6)        // 0.6
clamp(14, 0, 10)  // 10
```

### `lerp(a, b, t)`

Linearly interpolates between two numbers using `a + (b - a) * t`.

- `t = 0` returns `a`.
- `t = 1` returns `b`.
- Values outside `[0, 1]` extrapolate; `lerp()` does not clamp.

### `nearlyEqual(a, b, epsilon = EPSILON)`

Compares numbers with a scale-aware relative tolerance:

```text
abs(a - b) <= epsilon * max(1, abs(a), abs(b))
```

This is usually more reliable than `a === b` for calculated geometry.

### `positiveModulo(value, modulus)`

Returns a non-negative remainder when `modulus` is positive. It is useful for wrapping positions and angles.

### `normalizeAngle(angle)`

Wraps a radian angle into `[0, Math.PI * 2)`.

### `angleDelta(from, to)`

Returns the shortest signed radian turn from `from` to `to`, in `(-Math.PI, Math.PI]`. An exact negative half-turn is represented as positive `Math.PI`.

### `angleOnSweep(angle, startAngle, sweepAngle, epsilon = EPSILON)`

Tests whether an angle lies on a directed circular sweep.

- Positive `sweepAngle` checks the positive direction.
- Negative `sweepAngle` checks the negative direction.
- A sweep at least one complete turn, within epsilon, contains every angle.

### `solveLinear(a, b, epsilon = EPSILON)`

Solves `a*x + b = 0` and returns an array of real roots.

- Returns `[-b / a]` for a non-zero coefficient.
- Returns `[]` when `abs(a) <= epsilon`; it does not distinguish “no solution” from “infinitely many solutions.”

### `quadraticRoots(a, b, c, epsilon = EPSILON)`

Returns the sorted real roots of `a*x² + b*x + c = 0`.

- Falls back to a linear equation when `a` is near zero.
- Returns `[]`, one root, or two roots.
- Uses a numerically stable form to reduce cancellation.

`solveQuadratic` is an exact alias of `quadraticRoots`.

### `cubicRoots(a, b, c, d, epsilon = EPSILON)`

Returns the sorted real roots of `a*x³ + b*x² + c*x + d = 0`.

- Falls back to `quadraticRoots()` when `a` is near zero.
- Returns only real roots.
- A repeated-root case can return two equal-by-multiplicity positions as two numeric entries.

## Point

### `new Point(x = 0, y = 0)`

Stores an immutable position. Constructor values are converted with `Number()`.

<DiagramExample id="geometry-point-vector" />

Properties:

| Property | Meaning |
| --- | --- |
| `.x` | Horizontal coordinate |
| `.y` | Vertical coordinate |

Methods:

| Method | Result |
| --- | --- |
| `.add(vectorLike)` | New Point translated by `Vector.from(vectorLike)` |
| `.translate(vectorLike)` | Alias-like readable form of `.add()` |
| `.subtract(pointLike)` | Vector from the other point to this point |
| `.sub(pointLike)` | Short alias of `.subtract()` |
| `.distanceTo(pointLike)` | Euclidean distance |
| `.lerp(pointLike, t)` | Interpolated Point; `t` is not clamped |
| `.equals(other, epsilon = EPSILON)` | Absolute per-coordinate tolerance check |
| `.nearlyEquals(other, epsilon = EPSILON)` | Alias of `.equals()` |
| `.transform(matrix)` | Equivalent to `matrix.applyToPoint(this)` |
| `.toArray()` | New `[x, y]` array |

### `Point.from(value)`

Normalizes these forms:

```js
Point.from(new Point(10, 20))
Point.from([10, 20])
Point.from({ x: 10, y: 20 })
```

An existing Point is returned unchanged. Missing coordinates become zero through the constructor defaults.

## Vector

### `new Vector(x = 0, y = 0)`

Stores an immutable direction and magnitude. Constructor values are converted with `Number()`.

Properties:

| Property | Meaning |
| --- | --- |
| `.x` | Horizontal component |
| `.y` | Vertical component |

Arithmetic and products:

| Method | Result |
| --- | --- |
| `.add(other)` | Component-wise addition |
| `.subtract(other)` | Component-wise subtraction |
| `.sub(other)` | Alias of `.subtract()` |
| `.scale(scalar)` | Multiply both components |
| `.divide(scalar)` | Divide both components; zero is not specially rejected |
| `.dot(other)` | Scalar dot product |
| `.cross(other)` | Scalar 2D cross product |

Length and direction:

| Method | Result |
| --- | --- |
| `.magnitudeSquared()` | `x² + y²` |
| `.lengthSquared()` | Alias of `.magnitudeSquared()` |
| `.magnitude()` | Length via `Math.hypot()` |
| `.length()` | Alias of `.magnitude()` |
| `.normalized(epsilon = EPSILON)` | Unit Vector, or `(0, 0)` when length is within epsilon |
| `.normalize(epsilon = EPSILON)` | Alias of `.normalized()` |
| `.perpendicular()` | `(-y, x)` |
| `.rotate(radians)` | Rotated Vector |
| `.angle()` | Direction from `Math.atan2(y, x)` |
| `.isZero(epsilon = EPSILON)` | Whether squared length is at most `epsilon²` |
| `.negate()` | Reversed Vector |
| `.neg()` | Alias of `.negate()` |

Comparison and conversion:

| Method | Result |
| --- | --- |
| `.equals(other, epsilon = EPSILON)` | Absolute per-component tolerance check |
| `.nearlyEquals(other, epsilon = EPSILON)` | Alias of `.equals()` |
| `.toArray()` | New `[x, y]` array |

The ordinary arithmetic methods expect an object with `x` and `y`. Use `Vector.from()` first when accepting multiple input shapes.

### `Vector.from(value)`

Returns an existing Vector unchanged, or converts an array or `{ x, y }` object.

### `Vector.fromAngle(radians, magnitude = 1)`

Creates `(cos(angle) * magnitude, sin(angle) * magnitude)`.

`Vector.polar(radians, magnitude)` is an alias.

## Convenience constructors

The `math-diagrammer/geometry` entry point also exports:

| Function | Meaning |
| --- | --- |
| `point(x = 0, y = 0)` | `new Point(x, y)` |
| `vector(x = 0, y = 0)` | `new Vector(x, y)` |
| `polar(angle, magnitude = 1)` | `Vector.fromAngle(angle, magnitude)` |
| `midpoint(a, b)` | Normalizes both with `Point.from()` and interpolates at `0.5` |
| `distance(a, b)` | Normalizes both with `Point.from()` and measures distance |
| `normalizePoint(value)` | Accepts Point, array, or object; otherwise throws `TypeError` |

Unlike the root DSL versions, the advanced `midpoint()` and `distance()` helpers accept arrays and objects because they call `Point.from()` internally.

## Geometric constructions

The construction helpers are exported from both `math-diagrammer` and `math-diagrammer/geometry`. Root Studio authors do not need a separate import. All point arguments accept a Point, `[x, y]`, or `{ x, y }`.

### Intersections

```js
lineIntersection(a, b, c, d, epsilon = EPSILON)
lineIntersection(firstSegment, secondSegment, epsilon = EPSILON)

segmentIntersection(a, b, c, d, epsilon = EPSILON)
segmentIntersection(firstSegment, secondSegment, epsilon = EPSILON)
```

`lineIntersection()` treats both inputs as infinite lines. `segmentIntersection()` additionally requires both line parameters to lie in `[0, 1]`. Each returns a Point only when the intersection is unique, otherwise `null`. Therefore parallel lines, coincident lines, and positive-length collinear overlaps return `null`; a single shared collinear endpoint returns that Point.

### Point projection

```js
projectPoint(value, a, b, options = {})
projectPoint(value, segment, options = {})
projectPointToLine(value, a, b, options = {})
projectPointToSegment(value, a, b)
```

`projectPoint()` and its exact alias `projectPointToLine()` project onto the infinite line. Set `{ clamp: true }` to restrict the parameter to the segment. `projectPointToSegment()` is the always-clamped form. A zero-length reference throws `RangeError`.

### Lines through a point

```js
const parallel = parallelThrough(pointValue, a, b, { length: 200 });
const perpendicular = perpendicularThrough(pointValue, referenceSegment, {
  length: 200
});
```

Both return an immutable `LineSegment` centered on `pointValue`. Without `length`, the result uses the reference segment's length. A zero-length reference or a non-positive/non-finite requested length throws `RangeError`.

### Angle bisectors

```js
const internal = angleBisector(vertex, firstRayPoint, secondRayPoint);
const external = angleBisector(vertex, firstRayPoint, secondRayPoint, {
  mode: "external",
  length: 150
});
```

The result is a `LineSegment` whose `.start` is the vertex. Modes are `internal` and `external`; `interior`/`minor` and `exterior`/`major` are accepted aliases. `external: true` is a shortcut. The default length is the shorter ray length.

### Standard triangle centers

```js
triangleCentroid(a, b, c)
triangleIncenter(a, b, c)
triangleCircumcenter(a, b, c)
triangleOrthocenter(a, b, c)
triangleCenters(a, b, c)
```

`triangleCenters()` returns a frozen `{ centroid, incenter, circumcenter, orthocenter }` object. `centroid`, `incenter`, `circumcenter`, and `orthocenter` are aliases of the four individual functions. Degenerate triangles produce `null` for every center except the arithmetic centroid.

## Matrix

### `new Matrix(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0)`

Stores an immutable SVG-style affine matrix:

```text
x' = a*x + c*y + e
y' = b*x + d*y + f
```

<DiagramExample id="geometry-matrix-transform" />

Properties:

| Property | Meaning |
| --- | --- |
| `.a`, `.b`, `.c`, `.d`, `.e`, `.f` | Six numeric SVG matrix coefficients |
| `.tx` | Getter alias of `.e` |
| `.ty` | Getter alias of `.f` |

Methods:

| Method | Result |
| --- | --- |
| `.multiply(other)` | Matrix product `this * other` |
| `.then(other)` | Application-order composition `other.multiply(this)` |
| `.applyToPoint(pointLike)` | Transforms a Point, including translation |
| `.applyToVector(vectorLike)` | Transforms a Vector, excluding translation |
| `.determinant()` | `a*d - b*c` |
| `.inverse(epsilon = EPSILON)` | Inverse Matrix, or `null` when determinant is within epsilon |
| `.isIdentity(epsilon = EPSILON)` | Approximate identity check |
| `.equals(other, epsilon = EPSILON)` | Absolute tolerance across six coefficients |
| `.nearlyEquals(other, epsilon = EPSILON)` | Alias of `.equals()` |
| `.toArray()` | `[a, b, c, d, e, f]` |
| `.toSvgString()` | Space-separated six-value string |
| `.toSVG()` | `matrix(a b c d e f)` string |

::: warning Different from the Studio Matrix
This advanced `.inverse()` returns `null` for a singular matrix. The root DSL's smaller `Matrix` class throws an Error instead.
:::

Static constructors and aliases:

| Constructor | Meaning |
| --- | --- |
| `Matrix.identity()` | Identity matrix |
| `Matrix.translation(x, y = 0)` | Translation matrix |
| `Matrix.translation(pointLike)` | Translation using `.x` and `.y` |
| `Matrix.translate(...)` | Alias of `.translation(...)` |
| `Matrix.scaling(x, y = x)` | Scale matrix |
| `Matrix.scale(...)` | Alias of `.scaling(...)` |
| `Matrix.rotation(radians)` | Rotation matrix |
| `Matrix.rotate(radians)` | Alias of `.rotation()` |
| `Matrix.skewX(radians)` | Horizontal skew |
| `Matrix.skewY(radians)` | Vertical skew |
| `Matrix.skew(xRadians = 0, yRadians = 0)` | Combined skew |

## Bounds

### `new Bounds(minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity)`

Stores an immutable axis-aligned bounding box. `new Bounds()` is empty.

<DiagramExample id="geometry-bounds" />

Properties and getters:

| Property | Meaning |
| --- | --- |
| `.minX`, `.minY`, `.maxX`, `.maxY` | Stored boundary coordinates |
| `.isEmpty` | `true` when minimum exceeds maximum on either axis |
| `.width`, `.height` | Zero for empty bounds; otherwise coordinate difference |
| `.center` | Center Point; `(0, 0)` for empty bounds |
| `.left`, `.right`, `.top`, `.bottom` | Aliases of min/max coordinates |

Static constructors:

| Constructor | Meaning |
| --- | --- |
| `Bounds.empty()` | New empty Bounds |
| `Bounds.fromPoints(points)` | Includes every point-like value |
| `Bounds.fromRect(x, y, width, height)` | Rectangle bounds; negative sizes are normalized |

Combining and resizing:

| Method | Result |
| --- | --- |
| `.clone()` | Equal new Bounds |
| `.includePoint(pointLike)` | Bounds including the point; non-finite points are ignored |
| `.include(value)` | Alias of `.includePoint()` |
| `.includeBounds(other)` | Bounds including another non-empty Bounds |
| `.union(other)` | Alias of `.includeBounds()` |
| `.intersect(other)` | Coordinate intersection; non-overlap produces empty Bounds |
| `.expand(amountX, amountY = amountX)` | Grows every side; empty bounds remain empty |
| `.translate(x, y = 0)` | Move by scalar components |
| `.translate(vectorLike)` | Move using `Vector.from()` |

Queries and conversion:

| Method | Result |
| --- | --- |
| `.containsPoint(pointLike, epsilon = EPSILON)` | Inclusive point-containment test |
| `.containsBounds(other, epsilon = EPSILON)` | Whether both opposite corners of non-empty `other` are contained |
| `.intersects(other, epsilon = EPSILON)` | Inclusive overlap test |
| `.corners()` | Four Points clockwise from top-left; `[]` when empty |
| `.transform(matrix)` | Bounds around transformed corners |
| `.support(direction)` | Maximum dot product in a direction; `-Infinity` when empty |
| `.anchor(name = "center")` | Named edge/corner/center Point; case-insensitive substring matching |
| `.equals(other, epsilon = EPSILON)` | Tolerance comparison; any two empty Bounds are equal |
| `.toJSON()` | `{ minX, minY, maxX, maxY }` |

## Copyable examples for every foundation member

The compact examples below are deliberately independent of the visual previews. They show the smallest useful call for every public member.

### Every numeric helper

```js
import {
  EPSILON,
  angleDelta,
  angleOnSweep,
  clamp,
  cubicRoots,
  finiteOr,
  isFiniteNumber,
  lerp,
  nearlyEqual,
  normalizeAngle,
  positiveModulo,
  quadraticRoots,
  solveLinear,
  solveQuadratic
} from "math-diagrammer/geometry";

EPSILON                                      // 1e-9
isFiniteNumber(42)                           // true
isFiniteNumber("42")                         // false
finiteOr(Infinity, 7)                        // 7
clamp(12, 0, 10)                             // 10
lerp(10, 30, 0.25)                           // 15
nearlyEqual(0.1 + 0.2, 0.3)                  // true
positiveModulo(-1, 12)                       // 11
normalizeAngle(-Math.PI / 2)                 // 3 * Math.PI / 2
angleDelta(Math.PI * 1.9, Math.PI * 0.1)     // shortest signed turn
angleOnSweep(Math.PI / 2, 0, Math.PI)        // true
solveLinear(2, -8)                           // [4]
quadraticRoots(1, -5, 6)                     // [2, 3]
solveQuadratic(1, 0, -9)                     // [-3, 3]
cubicRoots(1, -6, 11, -6)                    // [1, 2, 3]
```

### Every Point member

```js
import { Matrix, Point, Vector } from "math-diagrammer/geometry";

const p = new Point(12, -8);                  // constructor
p.x                                            // 12
p.y                                            // -8
p.add(new Vector(3, 4))                       // Point(15, -4)
p.translate([3, 4])                           // Point(15, -4)
p.subtract([2, -8])                           // Vector(10, 0)
p.sub(new Point(2, -8))                       // Vector(10, 0)
p.distanceTo([15, -4])                        // 5
p.lerp(new Point(20, 8), 0.5)                 // Point(16, 0)
p.equals(new Point(12, -8))                   // true
p.nearlyEquals([12 + 1e-10, -8])              // true
p.transform(Matrix.translation(5, 0))         // Point(17, -8)
p.toArray()                                    // [12, -8]

Point.from(p)                                  // same Point instance
Point.from([10, 20])                           // Point(10, 20)
Point.from({ x: 10, y: 20 })                   // Point(10, 20)
```

### Every Vector member

```js
import { Vector } from "math-diagrammer/geometry";

const v = new Vector(3, 4);                   // constructor
v.x                                            // 3
v.y                                            // 4
v.add(new Vector(1, 2))                       // Vector(4, 6)
v.subtract(new Vector(1, 2))                  // Vector(2, 2)
v.sub(new Vector(1, 2))                       // Vector(2, 2)
v.scale(2)                                     // Vector(6, 8)
v.divide(2)                                    // Vector(1.5, 2)
v.dot(new Vector(2, 0))                       // 6
v.cross(new Vector(0, 2))                     // 6
v.magnitudeSquared()                           // 25
v.lengthSquared()                              // 25
v.magnitude()                                  // 5
v.length()                                     // 5
v.normalized()                                 // Vector(0.6, 0.8)
v.normalize()                                  // alias of normalized()
v.perpendicular()                              // Vector(-4, 3)
new Vector(1, 0).rotate(Math.PI / 2)           // approximately Vector(0, 1)
new Vector(0, 1).angle()                       // Math.PI / 2
new Vector(0, 0).isZero()                      // true
v.equals(new Vector(3, 4))                    // true
v.nearlyEquals(new Vector(3, 4 + 1e-10))       // true
v.negate()                                     // Vector(-3, -4)
v.neg()                                        // alias of negate()
v.toArray()                                    // [3, 4]

Vector.from(v)                                 // same Vector instance
Vector.from([3, 4])                            // Vector(3, 4)
Vector.from({ x: 3, y: 4 })                    // Vector(3, 4)
Vector.fromAngle(Math.PI / 2, 10)              // approximately Vector(0, 10)
Vector.polar(0, 10)                            // Vector(10, 0)
```

### Every convenience constructor

```js
import {
  distance, midpoint, normalizePoint, point, polar, vector
} from "math-diagrammer/geometry";

point(5, 7)                                    // Point(5, 7)
vector(3, -2)                                  // Vector(3, -2)
polar(Math.PI, 8)                              // approximately Vector(-8, 0)
midpoint([0, 0], [10, 6])                      // Point(5, 3)
distance([0, 0], [3, 4])                       // 5
normalizePoint({ x: 2, y: 9 })                 // Point(2, 9)
normalizePoint("bad")                          // throws TypeError
```

### Every Matrix member

```js
import { Matrix, Point, Vector } from "math-diagrammer/geometry";

const m = new Matrix(1, 2, 3, 4, 5, 6);       // constructor
m.a; m.b; m.c; m.d; m.e; m.f                  // six coefficients
m.tx                                            // 5, alias of e
m.ty                                            // 6, alias of f
m.multiply(Matrix.scale(2))                    // matrix product m * scale
m.then(Matrix.translation(10, 0))              // translation applied after m
m.applyToPoint(new Point(2, 3))                // includes e and f
m.applyToVector(new Vector(2, 3))              // ignores e and f
m.determinant()                                // -2
m.inverse()                                    // inverse Matrix
new Matrix(0, 0, 0, 0, 0, 0).inverse()        // null
Matrix.identity().isIdentity()                 // true
m.equals(new Matrix(1, 2, 3, 4, 5, 6))        // true
m.nearlyEquals(new Matrix(1, 2, 3, 4, 5, 6))  // true
m.toArray()                                    // [1, 2, 3, 4, 5, 6]
m.toSvgString()                                // "1 2 3 4 5 6"
m.toSVG()                                      // "matrix(1 2 3 4 5 6)"

Matrix.identity()                              // identity Matrix
Matrix.translation(10, 20)                    // scalar translation
Matrix.translation({ x: 10, y: 20 })          // point-like overload
Matrix.translate(10, 20)                      // alias of translation()
Matrix.scaling(2, 3)                           // non-uniform scaling
Matrix.scale(2)                                // uniform scaling alias
Matrix.rotation(Math.PI / 4)                  // rotation constructor
Matrix.rotate(Math.PI / 4)                    // alias of rotation()
Matrix.skewX(Math.PI / 8)                     // horizontal skew
Matrix.skewY(Math.PI / 8)                     // vertical skew
Matrix.skew(Math.PI / 8, Math.PI / 12)        // combined skew
```

### Every Bounds member

```js
import { Bounds, Matrix, Point, Vector } from "math-diagrammer/geometry";

const b = new Bounds(-10, -20, 30, 40);        // constructor
b.minX; b.minY; b.maxX; b.maxY                 // -10, -20, 30, 40
b.isEmpty                                      // false
b.width                                        // 40
b.height                                       // 60
b.center                                       // Point(10, 10)
b.left; b.right; b.top; b.bottom               // -10, 30, -20, 40

Bounds.empty()                                 // empty Bounds
Bounds.fromPoints([[0, 0], [8, 12]])           // Bounds(0, 0, 8, 12)
Bounds.fromRect(10, 20, -5, -8)                // Bounds(5, 12, 10, 20)

b.clone()                                      // equal new Bounds
b.includePoint([50, 10])                       // extends maxX to 50
b.include([50, 10])                            // alias of includePoint()
b.includeBounds(new Bounds(-30, 0, 0, 10))    // includes another box
b.union(new Bounds(-30, 0, 0, 10))            // alias of includeBounds()
b.intersect(new Bounds(0, 0, 100, 100))       // overlapping Bounds
b.expand(5)                                    // five units on every side
b.expand(5, 10)                                // separate x/y amounts
b.translate(8, -3)                            // scalar overload
b.translate(new Vector(8, -3))                // vector-like overload
b.containsPoint(new Point(0, 0))              // true
b.containsBounds(new Bounds(0, 0, 10, 10))    // true
b.intersects(new Bounds(25, 35, 50, 60))      // true
b.corners()                                    // four Points, top-left first
b.transform(Matrix.rotation(Math.PI / 4))     // bounds around rotated corners
b.support(new Vector(1, 0))                   // 30, farthest x projection
b.anchor("topLeft")                           // Point(-10, -20)
b.equals(new Bounds(-10, -20, 30, 40))        // true
b.toJSON()                                     // { minX:-10, minY:-20, maxX:30, maxY:40 }
```

Next: [Advanced path segments](./segments.md).
