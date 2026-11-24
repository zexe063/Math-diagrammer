# Math Diagrammer Studio

The `app/` directory is a dependency-free browser authoring surface for the diagram engine in `src/`.

Run it through the repository's development server (or any static server rooted at the repository), then open `/app/`. ES modules and Web Workers generally do not run correctly from a `file://` URL.

## Features

- JavaScript DSL editor with an always-available textarea
- optional Monaco enhancement when the CDN is reachable
- isolated, time-limited execution in a module Web Worker
- live preview with pan, zoom, fit, and a toggleable construction grid
- persistent preview camera across live code updates and workspace resizing
- subtle preview and camera transitions with reduced-motion support
- console capture and clickable source diagnostics
- deterministic SVG download of the latest successful render
- locally persisted source and pane sizing
- primitive, geometry, number-line, statistics, probability-tree, and Sierpiński examples

## Engine contract

The worker imports `../src/index.js` and `../src/math/index.js`, then exposes each valid named export as an author-program binding. Programs call `draw(diagram)` once they have composed a result.

The bundled examples assume these canonical exports:

```js
point(x, y)
circle(radius)
rectangle(width, height)
triangle(size)
line(pointA, pointB)
text(value, fontSize)
row(gap, diagrams)
column(gap, diagrams)
stack(diagrams)
```

`overlay(diagrams)` remains available as a deprecated compatibility alias for
existing programs. New diagrams should use `stack(diagrams)`.

They also assume immutable fluent methods:

```js
diagram.fill(color)
diagram.stroke(color, width)
diagram.translate(x, y)
diagram.rotate(radians)
diagram.rotateDeg(degrees)
diagram.scale(amount)
```

`rotate()` follows the engine's mathematical convention and accepts radians;
use `rotateDeg()` for degree values.

For rendering, the integration detects any of these module-level functions:

```js
renderSvg(diagram, options)
renderSVG(diagram, options)
toSvg(diagram, options)
toSVG(diagram, options)
exportSvg(diagram, options)
exportSVG(diagram, options)
renderToString(diagram, options)
serialize(diagram, options)
render(diagram, options)
```

It also detects equivalent methods directly on a diagram, such as `diagram.toSVG(options)`. A serializer may return the SVG string directly or an object containing `svg`, `markup`, `html`, or `source`.

The application strips scripts and inline event-handler attributes from preview SVG before inserting it into the page.
