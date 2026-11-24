---
title: API overview
description: The complete Math Diagrammer API, organized as a practical learning path.
pageClass: api-overview-page
---

# API overview

The API reference is also the learning path. Begin with primitives and geometry, then move through diagram methods, composition, output, and the higher-level mathematics toolkit.

```js
import { circle, draw, row, text } from "math-diagrammer";
import { functionPlot, numberLine } from "math-diagrammer/math";
import { ArcSegment, Bounds, Matrix, Point } from "math-diagrammer/geometry";
```

## Core API

<div class="api-reference-list">
  <a href="./primitives">
    <span class="api-reference-list__index">01</span>
    <span><strong>Primitives</strong><small>Shapes, paths, text, TeX mathematics, and low-level nodes</small></span>
  </a>
  <a href="./geometry-foundations">
    <span class="api-reference-list__index">02</span>
    <span><strong>Geometry foundations</strong><small>Complete numeric, Point, Vector, Matrix, and Bounds APIs</small></span>
  </a>
  <a href="./segments">
    <span class="api-reference-list__index">03</span>
    <span><strong>Path segments</strong><small>Line, quadratic, cubic, and elliptical-arc analysis</small></span>
  </a>
  <a href="./geometry">
    <span class="api-reference-list__index">04</span>
    <span><strong>Studio geometry</strong><small>Compact root-DSL points, vectors, matrices, bounds, and PathData</small></span>
  </a>
  <a href="./diagram">
    <span class="api-reference-list__index">05</span>
    <span><strong>Diagram methods</strong><small>Styling, transforms, clipping, anchors, bounds, and metadata</small></span>
  </a>
  <a href="./layout">
    <span class="api-reference-list__index">06</span>
    <span><strong>Composition and layout</strong><small>Layers, rows, columns, grids, frames, alignment, and placement</small></span>
  </a>
  <a href="./annotations">
    <span class="api-reference-list__index">07</span>
    <span><strong>Annotations</strong><small>Arrows, connectors, labels, ticks, and boundary helpers</small></span>
  </a>
  <a href="./rendering">
    <span class="api-reference-list__index">08</span>
    <span><strong>Rendering and export</strong><small>Draw, serialize, download, and use shared constants</small></span>
  </a>
</div>

## Mathematics toolkit

<div class="api-reference-list">
  <a href="./plots">
    <span class="api-reference-list__index">09</span>
    <span><strong>Plots and axes</strong><small>Number lines, coordinate planes, functions, curves, and scatter plots</small></span>
  </a>
  <a href="./charts">
    <span class="api-reference-list__index">10</span>
    <span><strong>Charts and fractions</strong><small>Fraction models, bars, histograms, box plots, and pie charts</small></span>
  </a>
  <a href="./math-diagrams">
    <span class="api-reference-list__index">11</span>
    <span><strong>Math diagrams</strong><small>Venn diagrams, probability trees, triangles, spirals, and fractals</small></span>
  </a>
  <a href="./cell-grid">
    <span class="api-reference-list__index">12</span>
    <span><strong>Cell grid</strong><small>Addressable grids, diagonals, shading, triangles, and semantic content</small></span>
  </a>
</div>

## Shared conventions

Unless stated otherwise, every primitive, composition function, annotation, plot, chart, and math helper returns an immutable `Diagram`.

The coordinate origin is `(0, 0)`. Positive `x` points right and positive `y` points down, matching SVG. Angles are radians unless an API explicitly accepts degrees.

Most point parameters accept all three forms:

```js
point(20, 30)
[20, 30]
{ x: 20, y: 30 }
```

| Preferred name | Aliases |
| --- | --- |
| `rectangle` | `rect` |
| `sector` | `wedge` |
| `math` | `mathText`, `latex` |
| `row` | `hcat` |
| `column` | `vcat` |
| `strut` | `spacer` |
| `stack` | `overlay` (deprecated) |
| `connect` | `connectOutside` |
| `renderSvg` | `renderSVG`, `toSVG` |
| `pythagoras` | `pythagoreanDiagram`, `pythagorasDiagram`, `pythagoreanTheorem` |
