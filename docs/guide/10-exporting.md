# Rendering and exporting

Studio has two separate actions:

- `draw(diagram)` updates the preview.
- **Export SVG** downloads the most recent successful result.

The exported file is standalone SVG. Math formulas are vector geometry, and the
Studio export embeds the diagram text font for portability.

## A clean Studio program

```js
const diagram = column(22, [
  text("Quadratic formula", 26).fontWeight(700),
  math(String.raw`x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}`, 32)
]);

draw(diagram);
```

Use the Studio's Export SVG button after the preview succeeds.

## Rendering from an application

Outside Studio, import the engine and serialize a diagram:

```js
import { circle, renderSVG } from "./src/index.js";

const diagram = circle(60)
  .fill("#ddd6fe")
  .stroke("#7567ef", 3);

const svg = renderSVG(diagram, {
  padding: 32,
  background: "#ffffff",
  width: 400,
  height: 400,
  ariaLabel: "A purple circle"
});
```

`toSVG` is an alias, and each diagram also has `diagram.toSVG(options)`.

## Browser download API

This example belongs in an application module, not the Studio editor:

```js
import { downloadSvg, pythagoras } from "./src/index.js";

const diagram = pythagoras(3, 4);
downloadSvg(diagram, "pythagoras.svg", {
  padding: 40,
  background: "#ffffff"
});
```

## Export checklist

Before shipping a lesson diagram:

1. Fit the preview and inspect every label.
2. Check that no content is unintentionally clipped.
3. Use a white background when downstream tools require opaque artwork.
4. Give exported images a useful accessibility label.
5. Open the downloaded SVG independently to confirm portability.
6. Verify the commercial embedding license for any font included in exports.

For reproducible lesson assets, keep domains, sizes, and colors explicit rather
than depending on inferred defaults.
