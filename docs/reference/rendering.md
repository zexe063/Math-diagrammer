# Rendering, exporting, and constants

Rendering is the final step. First build one complete `Diagram`; then either show it in Studio, insert it into a browser page, turn it into SVG text, or download it as a file.

## `draw(diagram, target?, options = {})`

**In plain language:** tells Math Diagrammer which finished picture you want to use.

In Studio, call `draw(diagram)` once at the end. Studio captures that value and renders it in the preview. In a browser application, you may also provide a CSS selector or DOM element as `target`.

<DiagramExample id="output-draw" />

| Argument | Meaning |
| --- | --- |
| `diagram` | The final `Diagram` value |
| `target` | Optional selector such as `"#preview"`, or a DOM element |
| `options` | The same SVG options accepted by `renderSvg()` |

`draw()` stores the value in `globalThis.__MATH_DIAGRAM_LAST__` and returns the same diagram. If a browser target cannot be found, it throws a useful error.

When `target` is omitted—or JavaScript is running without `document`—no SVG string is created and `options` is unused. When a target exists, `draw()` replaces its complete `innerHTML` with `renderSvg(diagram, options)`. A non-string target is used directly; callers should pass an element-like object with `innerHTML`.

The targetless branch does not validate that its value is a Diagram; it simply stores and returns it. Browser rendering performs `renderSvg()` validation.

::: tip One final draw call
Create alternatives, labels, and layers first. Calling `draw()` once makes the program easier to read and prevents earlier results from being replaced accidentally.
:::

## `renderSvg(diagram, options = {})`

**In plain language:** converts a `Diagram` value into a complete SVG string.

This is useful when a lesson system stores SVG in a database, sends it through an API, or inserts it into HTML itself. Aliases `renderSVG()` and `toSVG()` produce the same result. A diagram also has `diagram.toSVG(options)`.

<DiagramExample id="output-render-svg" />

| Option | Default | What it changes |
| --- | --- | --- |
| `padding` | `24` | Empty space around the visible diagram |
| `background` | none | Optional background color behind everything |
| `width` | `"100%"` | Root SVG width attribute |
| `height` | `"100%"` | Root SVG height attribute |
| `ariaLabel` | `"Mathematics diagram"` | Accessible description for screen readers |

The returned string starts with `<svg` and contains its own `viewBox`. Numeric coordinates are rounded to keep the result deterministic and compact.

`diagram` must be Diagram-like and contain both `.node` and `.bounds`; otherwise `renderSvg()` throws a `TypeError`. Empty diagrams use a 100-by-100 fallback view box before padding. The root SVG always has `role="img"`, the chosen `aria-label`, and round default caps/joins.

## `svgDataUri(diagram, options = {})`

**In plain language:** wraps the SVG text in a URL that can be assigned directly to an image.

<DiagramExample id="output-data-uri" />

```js
const image = document.querySelector("img");
image.src = svgDataUri(diagram, {
  width: 640,
  height: 480
});
```

The returned string begins with `data:image/svg+xml;charset=utf-8,`.

The SVG is URI-encoded with `encodeURIComponent()`. The function accepts the same Diagram validation and rendering options as `renderSvg()`.

## `downloadSvg(diagram, filename = "diagram.svg", options = {})`

**In plain language:** asks the browser to save the diagram as an SVG file.

<DiagramExample id="output-download" />

This function needs browser APIs, so it throws outside a browser. Studio's **Export SVG** button uses its own export workflow and also embeds the configured CoFo Sans font.

In a browser it creates a temporary SVG `Blob`, clicks a temporary anchor with `download = filename`, immediately revokes the object URL, and returns `undefined`. It does not add a filename extension automatically. This low-level helper serializes the engine SVG as-is; unlike Studio's separate export workflow, it does not embed CoFo Sans itself.

## Built-in color constants

Color constants save typing and make small examples easier to read. You can always use any CSS color string instead.

<DiagramExample id="output-colors" />

| Name | Value | Name | Value |
| --- | --- | --- | --- |
| `none` | `"none"` | `black` | `"#111827"` |
| `white` | `"#ffffff"` | `gray` | `"#64748b"` |
| `red` | `"#ef4444"` | `orange` | `"#f59e0b"` |
| `yellow` | `"#eab308"` | `green` | `"#22c55e"` |
| `blue` | `"#3b82f6"` | `indigo` | `"#6366f1"` |
| `violet` | `"#8b5cf6"` | `pink` | `"#ec4899"` |
| `cyan` | `"#06b6d4"` |  |  |

Use `none` when you want no fill or no stroke:

```js
circle(60).fill(none).stroke(blue, 4)
```

## `tau` and `degrees(value)`

Math Diagrammer uses radians for angles because JavaScript's trigonometric functions use radians.

- `tau` equals `Math.PI * 2`, which is one complete turn.
- `degrees(value)` converts a familiar degree value into radians.

`degrees()` applies JavaScript numeric multiplication directly. Numeric strings are coerced; nonnumeric values produce `NaN`, so pass a finite number in published lesson code.

<DiagramExample id="output-angles" />

| Familiar angle | Radian expression |
| --- | --- |
| Quarter turn | `degrees(90)` or `tau / 4` |
| Half turn | `degrees(180)` or `tau / 2` |
| Full turn | `degrees(360)` or `tau` |

Use whichever form makes the lesson code easiest to understand.
