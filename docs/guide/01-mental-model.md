# Mental model

The engine has four layers:

1. **Primitives** create visible objects such as circles, lines, text, and math.
2. **Fluent methods** return styled or transformed copies.
3. **Combinators** arrange or layer diagrams.
4. **`draw()`** publishes the final diagram to Studio.

```js
const shape = circle(42);                     // create
const styled = shape.fill("#7567ef");         // copy and style
const moved = styled.translate(-55, 0);       // copy and transform
const picture = stack([                       // compose
  moved,
  circle(42).fill("#4fc4d0").translate(55, 0)
]);

draw(picture);                                // render once
```

## Diagrams are values

Methods do not modify the original value. This makes reuse safe:

```js
const tile = roundedRect(90, 64, 12)
  .fill("#ede9fe")
  .stroke("#7567ef", 3);

draw(row(18, [
  tile,
  tile.fill("#cffafe").stroke("#0891b2", 3),
  tile.fill("#fef3c7").stroke("#d97706", 3)
]));
```

`tile` remains purple; each method call creates another `Diagram`.

## Bounds drive layout

Every diagram knows its `bounds`, `width`, `height`, and `center`. Layout
functions use those measurements, so authors normally describe relationships
instead of manually calculating every coordinate.

- Use `row()` and `column()` for sequences.
- Use `stack()` when items share the same visual space.
- Use `grid()` for repeated cards or symbols.
- Use coordinates only when geometry itself is the lesson.

## Coordinate convention

The origin is at `(0, 0)`. Positive `x` goes right and positive `y` goes down,
matching SVG. Angles are radians unless a method explicitly says degrees.

```js
const origin = dot(5);
const right = dot(5).translate(90, 0);
const down = dot(5).translate(0, 90);

draw(stack([
  line(point(0, 0), point(90, 0)).stroke("#7567ef", 3),
  line(point(0, 0), point(0, 90)).stroke("#4fc4d0", 3),
  origin,
  right,
  down,
  text("+x", 16).translate(110, 0),
  text("+y", 16).translate(0, 112)
]));
```

## Build from relationships

Prefer code that states the visual idea:

```js
const formulaCard = column(16, [
  text("Area of a circle", 24).fontWeight(600),
  math(String.raw`A = \pi r^2`, 32)
]);

draw(
  stack([
    roundedRect(330, 150, 18)
      .fill("#f8fafc")
      .stroke("#cbd5e1", 2),
    formulaCard
  ])
);
```

The card is a background and content sharing a center. No pixel positioning is
needed for the internal layout.
