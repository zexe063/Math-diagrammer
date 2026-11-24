# Composition and layout

Layout functions turn small diagrams into a larger diagram. They never modify their inputs; each one returns a new `Diagram`.

Think of the tools in three groups:

1. **Layering** puts drawings in the same coordinate space.
2. **Arrangement** places drawings next to one another.
3. **Bounds and placement** control the space a drawing occupies and where its anchors land.

## Layering

### `stack(diagrams)`

**In plain language:** places every child on the same transparent sheet.

Children render in array order: the first is at the back, and the final child is on top. Falsy children such as `null` are ignored, which is useful for optional decorations.

```text
stack([back, middle, front]) -> Diagram
```

`overlay()` is a deprecated alias. Prefer `stack()` in new lessons.

<DiagramExample id="core-stack" />

### `layer(base, children = [])`

**In plain language:** makes it explicit that one diagram is the background and the others sit on it.

It is equivalent to `stack([base, ...children])`. Use it for panels, badges, nodes, and highlighted regions.

| Parameter | Meaning |
| --- | --- |
| `base` | Background diagram |
| `children` | Diagrams drawn above the base |

<DiagramExample id="core-layer" />

## Rows and columns

### `row(items)` and `row(gap, items, options = {})`

**In plain language:** arranges diagrams from left to right, then centers the full result at the origin.

| Parameter | Meaning |
| --- | --- |
| `gap` | Empty horizontal space between neighboring bounds; default `0` |
| `items` | Array of diagrams |
| `options.align` | `"center"`, `"top"`, `"bottom"`, or `"baseline"` |

Baseline alignment is especially useful when text or formulas of different sizes share one row. Alias: `hcat`.

<DiagramExample id="core-row" />

### `column(items)` and `column(gap, items, options = {})`

**In plain language:** arranges diagrams from top to bottom, then centers the complete column at the origin.

| Parameter | Meaning |
| --- | --- |
| `gap` | Empty vertical space between neighboring bounds; default `0` |
| `items` | Array of diagrams |
| `options.align` | `"center"`, `"left"`, or `"right"` |

Alias: `vcat`.

<DiagramExample id="core-column" />

### `grid(columns, gapOrOptions, items?)`

**In plain language:** breaks one list into equal-count rows.

Supported forms:

```text
grid(columns, gap, items)
grid(columns, { items, gapX, gapY, rowAlign, columnAlign })
grid(columns, options, items)
```

| Option | Default | Meaning |
| --- | --- | --- |
| `gapX` | `0` | Horizontal gap inside each row |
| `gapY` | `0` | Vertical gap between rows |
| `rowAlign` | `"center"` | Vertical alignment of items in each row |
| `columnAlign` | `"center"` | Horizontal alignment of the rows |
| `items` | `[]` | Diagram list in the object form |

The last row may contain fewer diagrams.

`columns` must be a positive integer chosen by the author. The current function does not validate it; `0` prevents the internal loop from advancing, and fractional or negative values produce nonsensical grouping.

<DiagramExample id="core-grid" />

## Directional arrangement

### `distribute(direction, diagrams, gap = 0, options = {})`

**In plain language:** chooses a row or column by looking at a direction vector.

If the direction has a stronger horizontal component, it makes a row. Otherwise it makes a column. The sign does **not** reverse the item order.

| Parameter | Meaning |
| --- | --- |
| `direction` | `Vector`, `[x, y]`, or `{ x, y }` |
| `diagrams` | Items to arrange |
| `gap` | Empty space between items |
| `options.align` | Same alignment vocabulary as `row()` or `column()` |

<DiagramExample id="core-distribute" />

### `beside(direction, first, second, gap = 0)`

**In plain language:** puts exactly two diagrams beside one another and uses the direction sign to decide which side receives the second diagram.

| Direction | Result |
| --- | --- |
| `vector(1, 0)` | `second` goes right of `first` |
| `vector(-1, 0)` | `second` goes left of `first` |
| `vector(0, 1)` | `second` goes below `first` |
| `vector(0, -1)` | `second` goes above `first` |

<DiagramExample id="core-beside" />

::: warning Current direction form
Unlike `distribute()`, the current `beside()` implementation reads `direction.x` and `direction.y` directly. Use `vector(x, y)` or `{ x, y }`. An array such as `[-1, 0]` is presently interpreted as a zero direction and does not reliably choose the requested side.
:::

## Frames and size

### `frame(width, height, diagram, options = {})`

**In plain language:** tells the layout system to treat a diagram as if it occupies an exact rectangular area.

Frame is invisible. It neither paints a background nor clips content. It is useful when several items need identical layout cells.

| Option | Values | Default |
| --- | --- | --- |
| `alignX` | `"left"`, `"center"`, `"right"` | `"center"` |
| `alignY` | `"top"`, `"center"`, `"bottom"` | `"center"` |

The dashed rectangle in the example only reveals the otherwise invisible frame.

<DiagramExample id="core-frame" />

### `scaleToFit(width, height, diagram, options = {})`

**In plain language:** makes a diagram as large as possible inside a target width and height without changing its proportions.

With `{ cover: true }`, it becomes large enough to cover the target instead. `scaleToFit()` changes scale but does not create fixed frame bounds; combine it with `frame()` if both behaviors are required.

| Option | Default | Meaning |
| --- | --- | --- |
| `cover` | `false` | Use the larger scale factor so both target dimensions are covered |

If the input Diagram has zero width or height, the function returns that same Diagram without scaling. Width and height are not validated; use positive finite target dimensions.

<DiagramExample id="core-scale-to-fit" />

### `pad(amount, diagram)` and `diagram.pad(amountX, amountY?)`

**In plain language:** adds invisible breathing room around a diagram.

`pad(amount, diagram)` is the functional form. `.pad(x, y)` is the fluent form. Padding changes layout bounds, not the visible geometry.

The functional form accepts one shared amount only. Use the Diagram method for different horizontal and vertical amounts.

<DiagramExample id="core-pad" />

### `strut(width, height)`

**In plain language:** creates an invisible diagram with exact dimensions.

Use it when a row, column, or stack needs deliberate empty space. `spacer()` is an alias.

<DiagramExample id="core-strut" />

## Alignment and exact placement

### `align(diagram, where = "center")`

**In plain language:** moves one named anchor of a diagram to `[0, 0]`.

Common anchors are `center`, `left`, `right`, `top`, `bottom`, `topLeft`, `topRight`, `bottomLeft`, and `bottomRight`.

Convenience functions call the same operation:

```text
alignLeft(diagram)   alignRight(diagram)
alignTop(diagram)    alignBottom(diagram)
center(diagram)
```

Unknown anchor names fall back to the bounds center unless a custom anchor with that exact name exists.

<DiagramExample id="core-align" />

### `place(diagram, target, sourceAnchor = "center")`

**In plain language:** pins a chosen part of a diagram onto an exact target point.

| Parameter | Meaning |
| --- | --- |
| `diagram` | Item to move |
| `target` | `Point`, `[x, y]`, or `{ x, y }` destination |
| `sourceAnchor` | Part of the diagram that must land on the target |

This is clearer than hand-calculating translations when labels or cards must touch a known point.

<DiagramExample id="core-place" />

### `placeLabels(items, options = {})`

**In plain language:** places several labels near preferred points and automatically tries nearby positions when a label would cross a line, cover an obstacle, or overlap an earlier label.

```js
placeLabels([
  { value: "A", at: a, direction: [-1, 1], name: "A" },
  { value: "B", at: b, direction: [1, 1], name: "B" },
  { value: "c", at: midpoint(a, b), direction: [0, 1], name: "side" }
], {
  obstacles: [[a, b]],
  clearance: 5
})
```

<DiagramExample id="core-place-labels" />

Each item describes one label:

| Item field | Default | Meaning |
| --- | --- | --- |
| `value` / `label` | required | Text to render. A Diagram is also accepted. |
| `diagram` / `content` | none | Explicit Diagram used instead of text. |
| `at` / `anchor` | required | Preferred point around which candidates are generated. |
| `direction` | `[0, -1]` | Preferred direction from `at`. It does not need to be normalized. |
| `offset` | `24` | First candidate's distance from `at`. |
| `step` | `12` | Extra radial and sideways distance between candidates. |
| `rings` | `2` | Number of additional candidate rings. |
| `candidates` | automatic | Exact candidate centers, tried in array order. |
| `name` | `"label0"`, `"label1"`, ... | Anchor name stored on the returned Diagram. |
| `fontSize` / `size` | `18` | Text size. |
| `color` | `"#111827"` | Text color. |
| `weight` | `600` | Text weight. |
| `sourceAnchor` | `"center"` | Which anchor of a supplied Diagram lands on a candidate. |

`options.obstacles` may contain line segments such as `[a, b]`, `{ start, end }`, or `{ from, to }`; point-like values; Bounds-like objects; or Diagrams. `avoid` is an alias for `obstacles`. `clearance` defaults to `4`.

The helper gives collisions a much larger score than distance, then uses candidate order to break ties. The same input therefore produces the same placement every time. It is a small deterministic collision avoider, not a global text-layout solver: supply useful directions or explicit candidates for unusually dense diagrams.

The result is one ordinary Diagram. Read chosen centers with `result.anchor("A")` or the automatic names `label0`, `label1`, and so on.

## Advanced connector layout

### `connectWith(first, second, options = {})`

**In plain language:** computes two endpoints, then lets your own function decide what kind of connector to draw.

<DiagramExample id="core-connect-with" />

Each endpoint may be a `Diagram` or a point-like value. For a Diagram, `fromAnchor` or `toAnchor` selects the center of the boundary-search ray. The current implementation intersects that ray with the Diagram's **rectangular bounds**; it does not follow a circle, curved path, or other visible outline. Use `connect()` or `arrowBetween()` when you need shape-aware boundaries.

| Option | Default | Meaning |
| --- | --- | --- |
| `fromAnchor` | `"center"` | Anchor that begins the first Diagram's search ray |
| `toAnchor` | `"center"` | Anchor that begins the second Diagram's search ray |
| `lineFactory(start, end)` | required | Returns the connector Diagram |

```js
connectWith(leftNode, rightNode, {
  fromAnchor: "center",
  toAnchor: "center",
  lineFactory: (start, end) => arrow(start, end, { color: "#2563eb" })
})
```

Use the simpler [connectors](./annotations.md) unless you need a custom line factory.

If `lineFactory` is absent or falsy, `connectWith()` throws an `Error`. Point-like endpoints are used directly and do not require anchors.

### `boundaryPoint(bounds, centerPoint, towardPoint)`

**In plain language:** follows a straight ray until it touches the edge of an invisible rectangle.

<DiagramExample id="core-boundary-point" />

Returns a `Point` where the ray from `centerPoint` toward `towardPoint` meets rectangular `bounds`. Pass `null`/`undefined` as `centerPoint` to use `bounds.center`. Arguments are expected to be `Bounds`/`Point` objects with their normal methods; arrays are not normalized here. When the two points are equal, it returns the chosen center. It is a low-level utility; `connect()` and `Diagram.boundaryToward()` understand more actual shape geometry.
