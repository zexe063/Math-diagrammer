# Learn Math Diagrammer

Math Diagrammer is easiest to learn as a small visual language. You create
immutable `Diagram` values, style or transform them, compose them into a larger
diagram, and finally pass one result to `draw()`.

Follow this order:

1. [Mental model](./01-mental-model.md)
2. [Your first diagram](./02-first-diagram.md)
3. [Primitives and paths](./03-primitives.md)
4. [Styling](./04-styling.md)
5. [Layout and composition](./05-layout-composition.md)
6. [Labels and mathematical notation](./06-labels-and-math.md)
7. [Transforms and anchors](./07-transforms-and-anchors.md)
8. [Semantic cell grids](./08-cell-grid.md)
9. [Charts and plots](./09-charts-and-plots.md)
10. [Rendering and exporting](./10-exporting.md)
11. [Reusable author helpers](./11-reusable-helpers.md)
12. [Debugging](./12-debugging.md)

The examples in these pages assume the Studio environment. Studio exposes the
public DSL automatically, so do not add imports there. A normal program ends
with exactly one call to `draw()`.

After the guide, use the [recipe collection](../examples/index.md) as a starting
point for real lesson diagrams.
