---
layout: doc
title: Math Diagrammer API
description: Build precise mathematics diagrams from small, composable JavaScript values.
aside: false
pageClass: api-entry-page
---

<div class="api-intro">
  <p class="api-intro__eyebrow">JavaScript diagram API</p>
  <h1>Math Diagrammer</h1>
  <p class="api-intro__summary">Build precise mathematics diagrams from small, composable values. Start with a primitive, place it with geometry and layout, then render one portable SVG.</p>
  <div class="api-intro__actions">
    <a class="api-action api-action--primary" href="./reference/primitives">Start with primitives</a>
    <a class="api-action" href="./reference/">Browse the complete API</a>
  </div>
</div>

## Start with the API

The reference is the learning path. Read it in order when you are new, or jump directly to a function when you know what you need.

<div class="api-route-grid">
  <a href="./reference/primitives">
    <span class="api-route-grid__number">01</span>
    <strong>Primitives</strong>
    <span>Create circles, rectangles, paths, text, and mathematical notation.</span>
  </a>
  <a href="./reference/geometry-foundations">
    <span class="api-route-grid__number">02</span>
    <strong>Geometry foundations</strong>
    <span>Work with points, vectors, bounds, matrices, paths, and segments.</span>
  </a>
  <a href="./reference/diagram">
    <span class="api-route-grid__number">03</span>
    <strong>Diagram methods</strong>
    <span>Style, transform, clip, inspect, and reuse every diagram value.</span>
  </a>
  <a href="./reference/layout">
    <span class="api-route-grid__number">04</span>
    <strong>Composition</strong>
    <span>Arrange diagrams with stacks, rows, columns, grids, and alignment.</span>
  </a>
</div>

## The core pattern

Every drawing helper returns a `Diagram`. Methods return new diagrams, so values stay reusable and composition remains predictable.

<DiagramExample id="primitive-composition" />

## Continue by task

<div class="api-link-list">
  <a href="./reference/annotations"><strong>Annotations</strong><span>Arrows, connectors, labels, and ticks</span></a>
  <a href="./reference/rendering"><strong>Rendering</strong><span>SVG output, downloads, colors, and constants</span></a>
  <a href="./reference/plots"><strong>Plots</strong><span>Number lines, axes, functions, and scatter plots</span></a>
  <a href="./reference/charts"><strong>Charts</strong><span>Fractions, bars, histograms, box plots, and pies</span></a>
  <a href="./reference/math-diagrams"><strong>Math diagrams</strong><span>Sets, probability, triangles, spirals, and recursion</span></a>
  <a href="./reference/cell-grid"><strong>Cell grid</strong><span>Addressable grids with semantic content and shading</span></a>
</div>
