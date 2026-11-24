# Annotations and connectors

Annotations explain a diagram without becoming its main subject. Use them for direction arrows, relationships, point names, and measurement ticks.

## `arrow(start, end, options = {})`

**In plain language:** draws a directional line from one point to another.

Both endpoints accept a `Point`, `[x, y]`, or `{ x, y }`.

| Option | Default | Meaning |
| --- | --- | --- |
| `color` | `"#1f2937"` | Shaft and head color |
| `width` | `2` | Shaft stroke width |
| `headLength` | `max(8, width * 4)` | Distance from arrow tip to head base |
| `headWidth` | `headLength * 0.72` | Width across the triangular head |

The shaft ends at the base of the head, preventing a dark line from showing through the triangle.

Returns one `Diagram` containing the shaft and triangular head. A zero-length arrow has no meaningful direction; supply two distinct points for predictable geometry.

<DiagramExample id="core-arrow" />

## `connect(first, second, options = {})`

**In plain language:** draws a line between two shapes and stops at their visible edges instead of crossing their interiors.

Both arguments must be diagrams. `connectOutside()` is an alias.

| Option | Default | Meaning |
| --- | --- | --- |
| `fromAnchor` | `"center"` | Anchor used to choose the direction from the first shape |
| `toAnchor` | `"center"` | Anchor used to choose the direction toward the second shape |
| `color` | `"#64748b"` | Connector color |
| `width` | `2` | Connector width |

Anchor options guide the boundary search; they do not force the final line endpoints to equal the anchors.

Returns a line Diagram. The function calls `.anchor()` and `.boundaryToward()` on both inputs, so point arrays and plain objects are not accepted here.

<DiagramExample id="core-connect" />

## `arrowBetween(first, second, options = {})`

**In plain language:** connects two visible shape boundaries and adds an arrowhead at the destination.

It accepts `fromAnchor` and `toAnchor`, plus every `arrow()` option: `color`, `width`, `headLength`, and `headWidth`.

Like `connect()`, both inputs must be Diagrams. It returns the same grouped arrow shape as `arrow()`, with endpoints calculated from the visible boundaries.

<DiagramExample id="core-arrow-between" />

::: tip Draw connectors behind nodes
In a stack, place the connector first and the nodes afterward. The nodes then cover tiny edge overlaps cleanly.
:::

## `label(value, target, options = {})`

**In plain language:** places a short, bold ordinary-text label at a point.

| Option | Default | Meaning |
| --- | --- | --- |
| `offset` | `[0, 0]` | Extra `[x, y]` movement away from the target |
| `size` | `18` | Text size |
| `color` | `"#111827"` | Text color |
| `weight` | `600` | Text weight |

`offset` currently expects an array. For a LaTeX label, compose `math()` with `place()` instead.

`target` itself accepts any normal point-like value. The return value is an ordinary `text()` Diagram moved so its center lands on `target + offset`.

<DiagramExample id="core-label" />

## `tick(target, options = {})`

**In plain language:** makes a short centered line mark, such as a ruler tick or equal-side marker.

| Option | Default | Meaning |
| --- | --- | --- |
| `size` | `10` | Total tick length |
| `angle` | `Math.PI / 2` | Direction of the tick in radians |
| `color` | `"#1f2937"` | Tick color |
| `width` | `2` | Tick stroke width |

The default angle makes a vertical tick. Use `0` for a horizontal tick or `Math.PI / 4` for a diagonal one.

`target` accepts a `Point`, `[x, y]`, or `{ x, y }`. The function returns a centered line Diagram; the angle uses radians.

<DiagramExample id="core-tick" />

## `angleMark(vertex, firstRayPoint, secondRayPoint, options = {})`

**In plain language:** marks and labels an angle without requiring the author to calculate angles, arc endpoints, or label coordinates.

The three positions accept `Point`, `[x, y]`, or `{ x, y }`. The second and third points define rays beginning at `vertex`.

| Option | Default | Meaning |
| --- | --- | --- |
| `mode` | `"minor"` | `"minor"`, `"major"`, `"clockwise"`, or `"counterclockwise"` sweep |
| `exterior` / `reflex` | `false` | Convenience aliases for a major angle |
| `radius` | `28` | Radius of the first arc or filled region |
| `count` | `1` | Number of matching arc marks |
| `gap` | `6` | Space between repeated arcs |
| `fill` | `"none"` | Filled sector color; leaving it as `none` draws an arc only |
| `innerRadius` | `0` | Creates an annular filled mark when greater than zero |
| `stroke` / `color` | `"#1f2937"` | Arc and boundary color |
| `width` | `2` | Stroke width |
| `label` | none | Text or Diagram placed automatically on the angle bisector |
| `labelRadius` | outer radius `+ 20` | Distance from the vertex to the label |
| `labelOffset` | `[0, 0]` | Final small label adjustment |

The result exposes `vertex`, `start`, `end`, and optional `label` anchors. A ray endpoint equal to the vertex, or two identical rays, throws a `RangeError`.

<DiagramExample id="core-angle-mark" />

## `extendLine(start, end, options = {})`

**In plain language:** continues a segment along its existing direction without author-side vector calculations.

| Option | Default | Meaning |
| --- | --- | --- |
| `before` | `0` | Distance added before `start` |
| `after` | `40` | Distance added after `end` |
| `color` / `stroke` | `"#1f2937"` | Line color |
| `width` | `2` | Line width |
| `dash` | none | Dash pattern |
| `lineCap` | inherited | SVG line-cap style |

`lineExtension()` is an alias. The result exposes `start`, `end`, `extendedStart`, and `extendedEnd` anchors, which can be passed directly to `angleMark()`.

<DiagramExample id="core-extend-line" />

## `rightAngleMark(vertex, firstRayPoint, secondRayPoint, options = {})`

**In plain language:** creates the square corner used to show that two rays are perpendicular.

| Option | Default | Meaning |
| --- | --- | --- |
| `size` | `18` | Distance traveled along each ray |
| `color` / `stroke` | `"#1f2937"` | Corner-line color |
| `width` | `2` | Corner-line width |
| `fill` | none | Optional highlighted interior |
| `fillOpacity` | `1` | Opacity of the optional fill |

The function derives the corner orientation from the rays. It assumes the supplied rays represent the intended right angle.

<DiagramExample id="core-right-angle-mark" />

## `sideTicks(start, end, options = {})`

**In plain language:** places matching equality ticks perpendicular to any side.

| Option | Default | Meaning |
| --- | --- | --- |
| `count` | `1` | Number of ticks identifying the equality group |
| `size` | `12` | Length of each tick |
| `gap` | `7` | Distance between repeated ticks |
| `position` | `0.5` | Position along the side, where `0.5` is its midpoint |
| `color` / `stroke` | `"#1f2937"` | Tick color |
| `width` | `2` | Tick width |

<DiagramExample id="core-side-ticks" />

## `parallelMarks(start, end, options = {})`

**In plain language:** adds one or more automatically rotated chevrons to identify parallel sides or lines.

It supports `count`, `size`, `gap`, `position`, `color`, and `width`, with the same meanings as `sideTicks()`. Matching lines should use the same `count`.

<DiagramExample id="core-parallel-marks" />

## `dimensionLine(start, end, options = {})`

**In plain language:** creates an offset measurement line with extension lines, arrowheads, and an automatic or custom label.

| Option | Default | Meaning |
| --- | --- | --- |
| `offset` | `28` | Signed perpendicular distance from the measured segment |
| `overshoot` | `7` | Extra extension beyond the dimension line |
| `extensions` | `true` | Draw endpoint extension lines |
| `arrows` | `true` | Use arrowheads at both ends |
| `label` | measured length | Custom text or Diagram; `false` hides it |
| `precision` | `0` | Decimal places for the automatic measurement |
| `unit` | `""` | Text appended to the automatic measurement |
| `labelGap` | `17` | Space between the dimension line and label |
| `color` / `stroke` | `"#1f2937"` | Annotation color |
| `width` | `2` | Stroke width |

<DiagramExample id="core-dimension-line" />

## Choosing the right connector

| You know... | Use... |
| --- | --- |
| Two exact coordinates | `line()` or `arrow()` |
| Two shapes and want a plain relationship | `connect()` |
| Two shapes and want a direction | `arrowBetween()` |
| Two shapes but need a custom curve or factory | `connectWith()` |
