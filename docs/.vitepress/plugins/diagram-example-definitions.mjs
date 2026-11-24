import {
  circle,
  column,
  math,
  numberLine,
  rectangle,
  row,
  roundedRect,
  stack,
  text,
  triangle,
} from "../../../src/index.js";

/**
 * Documentation examples are deliberately expressed as normal JavaScript
 * functions, rather than evaluated source strings. The source is displayed to
 * the reader; build() is the trusted implementation rendered by Vite on the
 * documentation author's machine.
 */
export const diagramExampleDefinitions = Object.freeze([
  {
    id: "primitive-composition",
    title: "Compose primitive shapes",
    description: "Style individual shapes, then arrange them with a row.",
    source: `const title = text("Three useful shapes", 28)
  .fill("#26344d")
  .fontWeight(600);

const shapes = row(28, [
  circle(38)
    .fill("#7567ef")
    .stroke("#4438a8", 3),

  roundedRect(82, 72, 12)
    .fill("#4fc4d0")
    .stroke("#176b75", 3),

  triangle(84)
    .fill("#f4b860")
    .stroke("#885b19", 3)
]);

draw(column(32, [title, shapes]));`,
    build: () => {
      const title = text("Three useful shapes", 28).fill("#26344d").fontWeight(600);
      const shapes = row(28, [
        circle(38).fill("#7567ef").stroke("#4438a8", 3),
        roundedRect(82, 72, 12).fill("#4fc4d0").stroke("#176b75", 3),
        triangle(84).fill("#f4b860").stroke("#885b19", 3),
      ]);
      return column(32, [title, shapes]);
    },
    render: { padding: 28, ariaLabel: "A titled row containing a circle, rounded rectangle, and triangle" },
  },
  {
    id: "stack-and-label",
    title: "Layer with stack",
    description: "A stack shares one center, making badges and annotations concise.",
    source: `const badge = stack([
  circle(54).fill("#ede9fe").stroke("#7567ef", 3),
  math(String.raw\`x^2\`, 28).fill("#352c82")
]);

draw(badge);`,
    build: () => stack([
      circle(54).fill("#ede9fe").stroke("#7567ef", 3),
      math(String.raw`x^2`, 28).fill("#352c82"),
    ]),
    render: { padding: 24, ariaLabel: "A purple circular badge containing x squared" },
  },
  {
    id: "latex-formula",
    title: "Typeset mathematics",
    description: "MathJax turns LaTeX into portable vector geometry inside the SVG.",
    source: `draw(column(26, [
  math(String.raw\`a^2 + b^2 = c^2\`, 34),
  math(String.raw\`x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\`, 30),
  math(String.raw\`\\int_0^\\pi \\sin(x)\\,dx = 2\`, 28)
]));`,
    build: () => column(26, [
      math(String.raw`a^2 + b^2 = c^2`, 34),
      math(String.raw`x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}`, 30),
      math(String.raw`\int_0^\pi \sin(x)\,dx = 2`, 28),
    ]),
    render: { padding: 28, ariaLabel: "Three typeset formulas including a fraction and integral" },
  },
  {
    id: "number-line-interval",
    title: "Build on a math helper",
    description: "Combine a reusable number line with ordinary primitives to mark an interval.",
    source: `const axis = numberLine({
  min: -4,
  max: 4,
  step: 1,
  width: 500,
  arrowheads: true,
  color: "#334155",
  tickColor: "#64748b"
});

draw(column(22, [
  text("Integers from -4 to 4", 24).fontWeight(600),
  axis
]));`,
    build: () => column(22, [
      text("Integers from -4 to 4", 24).fontWeight(600),
      numberLine({
        min: -4,
        max: 4,
        step: 1,
        width: 500,
        arrowheads: true,
        color: "#334155",
        tickColor: "#64748b",
      }),
    ]),
    render: { padding: 32, ariaLabel: "A titled number line showing integers from negative four to four" },
  },
]);
