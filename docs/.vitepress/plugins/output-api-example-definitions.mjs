import {
  arc,
  black,
  blue,
  circle,
  column,
  cyan,
  degrees,
  gray,
  green,
  indigo,
  line,
  orange,
  pink,
  point,
  red,
  roundedRect,
  row,
  sector,
  stack,
  text,
  violet,
  white,
  yellow,
} from "../../../src/index.js";

const render = (ariaLabel, padding = 30) => ({ ariaLabel, padding });

const fileBadge = () => stack([
  roundedRect(300, 150, 10).fill("#ffffff").stroke("#101114", 4),
  column(10, [
    text("diagram.svg", 28).fill("#101114").fontWeight(700),
    text("standalone vector file", 17).fill("#075dcc"),
  ]),
]);

export const outputApiExampleDefinitions = Object.freeze([
  {
    id: "output-draw",
    title: "Send one finished diagram to the preview",
    description: "Build the complete picture first, then call draw once at the end.",
    source: `const answer = stack([
  roundedRect(300, 130, 12)
    .fill("#fff7cc")
    .stroke("#101114", 4),
  text("12 × 4 = 48", 30)
    .fill("#075dcc")
    .fontWeight(700)
]);

draw(answer);`,
    build: () => stack([
      roundedRect(300, 130, 12).fill("#fff7cc").stroke("#101114", 4),
      text("12 × 4 = 48", 30).fill("#075dcc").fontWeight(700),
    ]),
    render: render("A high contrast yellow answer card reading twelve times four equals forty eight"),
  },
  {
    id: "output-render-svg",
    title: "Turn a Diagram into SVG text",
    description: "renderSvg returns the complete vector markup without changing the Diagram.",
    source: `const diagram = circle(64)
  .fill("#22d3ee")
  .stroke("#101114", 4);

const svg = renderSvg(diagram, {
  padding: 32,
  background: "#ffffff",
  ariaLabel: "A cyan circle"
});

console.log(svg.slice(0, 80));
draw(diagram);`,
    build: () => circle(64).fill("#22d3ee").stroke("#101114", 4),
    render: render("A cyan circle used as the serialization example"),
  },
  {
    id: "output-data-uri",
    title: "Use SVG as an image source",
    description: "svgDataUri packages the complete diagram inside a URL string.",
    source: `const diagram = circle(58)
  .fill("#fbbf24")
  .stroke("#101114", 4);

draw(diagram);

// In a browser application:
// const image = document.querySelector("img");
// image.src = svgDataUri(diagram);`,
    build: () => circle(58).fill("#fbbf24").stroke("#101114", 4),
    render: render("A gold circle used as an SVG image source example"),
  },
  {
    id: "output-download",
    title: "Prepare a portable SVG file",
    description: "downloadSvg creates a temporary browser file and starts the save action.",
    source: `const diagram = stack([
  roundedRect(300, 150, 10)
    .fill("#ffffff")
    .stroke("#101114", 4),
  column(10, [
    text("diagram.svg", 28)
      .fill("#101114")
      .fontWeight(700),
    text("standalone vector file", 17)
      .fill("#075dcc")
  ])
]);

draw(diagram);

// In a browser application:
// downloadSvg(diagram, "diagram.svg");`,
    build: fileBadge,
    render: render("A bordered file card labelled diagram dot SVG"),
  },
  {
    id: "output-colors",
    title: "Built-in color constants",
    description: "The constants are convenient defaults; ordinary CSS color strings also work.",
    source: `const colors = [
  black, gray, red, orange, yellow,
  green, blue, indigo, violet, pink, cyan
];

draw(row(10,
  colors.map(color =>
    circle(18).fill(color).stroke("#101114", 2)
  )
));`,
    build: () => row(10, [black, gray, red, orange, yellow, green, blue, indigo, violet, pink, cyan]
      .map(color => circle(18).fill(color).stroke("#101114", 2))),
    render: render("A row of eleven high contrast built-in color swatches", 24),
  },
  {
    id: "output-angles",
    title: "Write angles as degrees or full turns",
    description: "degrees converts familiar degree values to radians, while tau means one complete turn.",
    source: `draw(stack([
  circle(88).fill("#ffffff").stroke("#101114", 3),
  sector(72, degrees(-90), degrees(20))
    .fill("#fbbf24")
    .stroke("#101114", 2),
  arc(98, 0, tau * 0.72)
    .fill("none")
    .stroke("#075dcc", 7),
  line(point(0, 0), point(0, -68))
    .stroke("#dc2626", 4)
]));`,
    build: () => stack([
      circle(88).fill(white).stroke("#101114", 3),
      sector(72, degrees(-90), degrees(20)).fill("#fbbf24").stroke("#101114", 2),
      arc(98, 0, Math.PI * 2 * 0.72).fill("none").stroke("#075dcc", 7),
      line(point(0, 0), point(0, -68)).stroke("#dc2626", 4),
    ]),
    render: render("A clock-like angle diagram with a gold sector blue arc and red radius"),
  },
]);

export default outputApiExampleDefinitions;
