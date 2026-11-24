# Diagram methods

Every visual constructor returns a `Diagram`. A Diagram holds three connected ideas:

- the drawing instructions;
- the rectangular bounds used by layout;
- style and named-anchor metadata.

Diagrams are immutable. A fluent method returns a changed copy and leaves the original untouched.

```js
const base = circle(45);
const ocean = base.fill("#bfdbfe").stroke("#2563eb", 4);
const sunset = base.fill("#fed7aa").stroke("#c2410c", 4);
```

Return convention: styling, transform, metadata, padding, and clipping methods return a new `Diagram`; `.anchor()` and `.boundaryToward()` return a `Point`; `.toSVG()` returns a string. No fluent method mutates its receiver.

## Measurements

| Member | Meaning |
| --- | --- |
| `.node` | Frozen internal drawing node; useful for engine extensions, not lesson logic |
| `.bounds` | Current `Bounds` used for arrangement and rendering |
| `.width` | `bounds.width` |
| `.height` | `bounds.height` |
| `.center` | Center `Point` of the bounds |
| `.styleValue` | Complete current style object |
| `.metadata` | Frozen `{ name, anchors }` object |

Visible stroke contributes to primitive bounds. For example, a circle with radius `10` and a two-unit stroke is 22 units wide.

## Styling

### `.fill(value)`, `.stroke(value, width?)`, and friends

**In plain language:** fluent style methods control how an existing diagram looks.

<DiagramExample id="core-styles" />

The complete convenience API is:

| Method | Purpose |
| --- | --- |
| `.fill(color)` | Interior paint; use `"none"` for no fill |
| `.stroke(color, width?)` | Outline or line paint and optional width |
| `.strokeWidth(width)` | Change only outline width |
| `.opacity(value)` | Opacity of the whole diagram |
| `.fillOpacity(value)` | Opacity of fill only |
| `.strokeOpacity(value)` | Opacity of stroke only |
| `.dash(values, offset = 0)` | Repeating dash and gap lengths |
| `.lineCap(value)` | Shape of open line ends: `round`, `butt`, or `square` |
| `.lineJoin(value)` | Shape of corners: `round`, `bevel`, or `miter` |
| `.color(value)` | Ordinary-text and MathJax glyph color |
| `.font(value)` | Font-family string for ordinary text |
| `.fontSize(value)` | Text font size |
| `.fontWeight(value)` | Text weight such as `400`, `600`, or `700` |
| `.fontStyle(value)` | Text style such as `normal` or `italic` |
| `.textAnchor(value)` | SVG horizontal text anchor |
| `.baseline(value)` | SVG dominant baseline |

For ordinary text, a non-`none` fill takes precedence over `.color()`. Styling a grouped diagram applies the override to its direct children, making `stack(...).opacity(0.5)` and `row(...).stroke(...)` convenient.

Style methods do not all affect every node type:

| Drawing type | Style values used by the renderer |
| --- | --- |
| Paths, rectangles, ellipses | Fill, stroke, stroke width, three opacities, dash array/offset, cap, join, miter limit, and fill rule |
| Ordinary `text()` | Font family, font size, font weight/style, text anchor, dominant baseline, text color, and whole opacity |
| `math()` | Glyph color and whole opacity; changing font methods does not re-typeset the MathJax geometry |

Methods may still store an irrelevant property, but the renderer ignores it for that node type. For example, `.dash()` does not dash text, and `.fontWeight()` does not rebuild a `math()` Diagram.

### `.withStyle(overrides)`

Applies several low-level style properties at once:

```js
shape.withStyle({
  fill: "#bfdbfe",
  stroke: "#2563eb",
  strokeWidth: 4,
  opacity: 0.85,
  lineJoin: "round"
})
```

Initial style defaults include `fill: "none"`, `stroke: "#1f2937"`, `strokeWidth: 2`, round caps and joins, and CoFo Sans for ordinary text.

The complete low-level style keys are:

| Key | Default | Notes |
| --- | --- | --- |
| `fill` | `"none"` | Interior paint or ordinary-text paint |
| `stroke` | `"#1f2937"` | Outline/line paint |
| `strokeWidth` | `2` | Visible stroke contributes to bounds |
| `opacity` | `1` | Whole rendered item |
| `fillOpacity`, `strokeOpacity` | `1` | Shape fill/stroke only |
| `dashArray` | `null` | Array of dash and gap lengths |
| `dashOffset` | `0` | Shift along the dash pattern |
| `lineCap`, `lineJoin` | `"round"` | SVG cap and join values |
| `miterLimit` | `4` | Limit for `miter` joins |
| `fillRule` | `"nonzero"` | Usually `"nonzero"` or `"evenodd"` |
| `fontFamily` | CoFo Sans stack | Ordinary text only |
| `fontSize` | `18` | Ordinary text; MathJax geometry is created earlier |
| `fontWeight` | `500` | Ordinary text only |
| `fontStyle` | `"normal"` | Ordinary text only |
| `textAnchor` | `"middle"` | Ordinary text horizontal anchoring |
| `dominantBaseline` | `"middle"` | Ordinary text vertical anchoring |
| `color` | `"#111827"` | Used by text/math when fill is `"none"` |

`withStyle()` shallow-merges overrides and freezes the new style object. It does not validate CSS values.

`.dash(values, offset)` copies `values` with the iterable spread operator and therefore throws when `values` is not iterable.

## Transforms

### Moving, rotating, and resizing

**In plain language:** transforms change the coordinate system around a diagram. They also move its bounds and custom anchors.

<DiagramExample id="core-transforms" />

| Method | Meaning |
| --- | --- |
| `.transform(matrix)` | Apply a custom affine `Matrix` |
| `.translate(x, y)` | Move by horizontal and vertical distances |
| `.translate(pointOrVector)` | Move by a `Point`, `Vector`, or `{ x, y }`; arrays are not accepted here |
| `.translateX(x)` | Move horizontally |
| `.translateY(y)` | Move vertically |
| `.moveTo(x, y)` / `.moveTo(pointLike)` | Put the diagram's current center at the target |
| `.scale(x, y = x)` | Resize around the origin; negative values also reflect |
| `.rotate(angle)` | Rotate by radians around the origin |
| `.rotateDeg(degrees)` | Rotate by degrees around the origin |
| `.skew(xAngle = 0, yAngle = 0)` | Skew using radian angles |
| `.reflectX()` | Flip vertically: `y` becomes `-y` |
| `.reflectY()` | Flip horizontally: `x` becomes `-x` |

`.transform()` expects a `Matrix`-compatible object with `applyToPoint()` and the properties used by Bounds transformation. The convenience methods construct that Matrix for you.

### Transform order

Each call wraps the result of the previous call, so order matters:

```js
shape.translate(80, 0).rotateDeg(30)
shape.rotateDeg(30).translate(80, 0) // a different result
```

Rotated bounds are the axis-aligned rectangle around transformed prior bounds. This is safe for layout but may include a little extra whitespace around curved shapes.

## Anchors and metadata

### `.withAnchor(name, pointLike)` and `.anchor(name = "center")`

**In plain language:** an anchor gives a meaningful name to a point on a diagram—such as `input`, `output`, `vertexA`, or `baseline`.

<DiagramExample id="core-anchors" />

`anchor(name)` first checks custom anchors. Otherwise it understands bounds names containing `left`, `right`, `top`, or `bottom`, including `topLeft` and `bottomRight`.

`withAnchor()` accepts the normal `Point`, `[x, y]`, and `{ x, y }` forms and throws a `TypeError` for unsupported values.

Ordinary `text()` defines a true baseline anchor. On other diagrams, `baseline` falls back to the bottom-center of the bounds. Custom anchors transform with the diagram.

### `.named(name)`

Stores a name in `diagram.metadata.name`. Naming does not draw anything; it helps extensions and debugging identify a diagram.

### `.boundaryToward(target)`

Returns the point on the visible boundary facing a target. Ellipses use their curved boundary, rectangles use their rectangle boundary, and paths approximate curves for intersection. This method powers `connect()` and `arrowBetween()`.

`target` accepts the normal point-like forms. Unsupported targets throw a `TypeError`. For grouped or unknown node types, the method falls back to rectangular Diagram bounds.

## Bounds and clipping

### `.pad(amountX, amountY = amountX)`

Expands only the layout bounds. It does not paint a background or move the visible diagram. See the [padding preview](./layout.md#pad-amount-diagram-and-diagram-pad-amountx-amounty).

### `.clip(mask)`

**In plain language:** uses another diagram like a cookie cutter and keeps only the content inside it.

Use a closed, filled shape as the mask. The returned layout bounds are the rectangular intersection of content and mask bounds.

`mask` must be a Diagram. The renderer forces the mask fill to white and stroke to none inside an SVG `<clipPath>`; the mask's visible colors are not used.

<DiagramExample id="core-clipping" />

## Serialization

### `.toSVG(options = {})`

Returns a complete SVG string. It is equivalent to `renderSvg(diagram, options)`.

See [Rendering and constants](./rendering.md#rendersvg-diagram-options) for all serialization options and validation behavior.

```js
const svg = circle(50)
  .fill("#bfdbfe")
  .stroke("#2563eb", 4)
  .toSVG({ padding: 24, ariaLabel: "Blue circle" });
```

## Low-level construction

These exports are public for engine extensions, but lesson authors normally use primitives and layout functions.

### `new Diagram(node, bounds = Bounds.empty(), currentStyle = defaultStyle, metadata = {})`

Constructs and freezes a raw Diagram. `metadata` is normalized to a frozen `{ name, anchors }` object. The constructor freezes the top-level node object, but it assumes extension authors supply a node shape the renderer understands. `defaultStyle` here means the internal defaults listed above; it is not a separate root export.

### `primitive(node, bounds, overrides = {}, metadata = {})`

Creates a primitive and expands its bounds for half of its initial visible stroke. `overrides` uses the low-level style keys above. The built-in renderer recognizes empty, path, rect, ellipse, text, and math primitive nodes; arbitrary node types render nothing unless the renderer is extended.

### `group(diagrams, metadata = {})`

Filters falsy children, unions their bounds, and returns a group. Nested arrays are not flattened automatically. Every remaining truthy child must be a Diagram-like value with `.bounds`; invalid values fail while the bounds are being combined.

### `empty()`

Returns an empty group with empty bounds.

### `intersectBounds(a, b)`

Returns the rectangular overlap of two Bounds values, or `Bounds.empty()` when they do not overlap.
