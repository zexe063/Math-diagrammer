# Math component layer

These zero-dependency ES modules use only the public diagram API exported by
`../index.js`. Primitive constructors are expected to return immutable
`Diagram` values with fluent styling and transform methods such as `fill`,
`stroke`, `opacity`, `translate`, `rotate`, `scale`, `dash`, and `clip`.

Every helper returns an ordinary static `Diagram`; none depends on the DOM,
editor, renderer internals, event handlers, or interaction state. As a result,
math components can be composed, restyled, transformed, clipped, and rendered
exactly like core primitives.

`cellGrid` is the first semantic toolkit in this layer. It maps addressed
cells, corners, edges, and regions to drawing coordinates while still returning
an ordinary static `Diagram`.

The module covers axes and plots, fractions, statistical charts, Venn and
probability diagrams, right-triangle/Pythagorean diagrams, spirals, and
Sierpiński triangles. Coordinates are centered and use SVG's positive-downward
`y` convention.
