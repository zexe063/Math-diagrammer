import { defineConfig } from "vitepress";
import { mathDiagramExamplesPlugin } from "./plugins/diagram-examples.mjs";

const apiSidebar = [
  {
    text: "Start here",
    items: [{ text: "API overview", link: "/reference/" }],
  },
  {
    text: "Core",
    items: [
      { text: "Primitives", link: "/reference/primitives" },
      { text: "Geometry foundations", link: "/reference/geometry-foundations" },
      { text: "Path segments", link: "/reference/segments" },
      { text: "Studio geometry", link: "/reference/geometry" },
      { text: "Diagram methods", link: "/reference/diagram" },
      { text: "Composition & layout", link: "/reference/layout" },
      { text: "Annotations", link: "/reference/annotations" },
    ],
  },
  {
    text: "Output",
    items: [{ text: "Rendering & export", link: "/reference/rendering" }],
  },
  {
    text: "Math toolkit",
    items: [
      { text: "Plots & axes", link: "/reference/plots" },
      { text: "Charts & fractions", link: "/reference/charts" },
      { text: "Math diagrams", link: "/reference/math-diagrams" },
      { text: "Cell grid", link: "/reference/cell-grid" },
    ],
  },
];

export default defineConfig({
  title: "Math Diagrammer",
  description: "Complete API documentation for composing precise mathematics diagrams with JavaScript.",
  lang: "en-US",
  srcExclude: ["guide/**", "examples/**"],
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ["meta", { name: "theme-color", content: "#ffffff" }],
    ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
    ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400&display=swap",
      },
    ],
  ],
  markdown: {
    lineNumbers: true,
    theme: { light: "github-light", dark: "github-dark" },
  },
  themeConfig: {
    logo: "/logo.svg",
    siteTitle: "Math Diagrammer",
    outline: { level: [2, 3], label: "On this page" },
    search: {
      provider: "local",
      options: {
        detailedView: true,
        translations: {
          button: { buttonText: "Search documentation", buttonAriaLabel: "Search documentation" },
        },
      },
    },
    nav: [{ text: "API", link: "/reference/", activeMatch: "^/reference/" }],
    sidebar: apiSidebar,
    docFooter: { prev: "Previous", next: "Next" },
    returnToTopLabel: "Back to top",
    sidebarMenuLabel: "API menu",
    darkModeSwitchLabel: "Appearance",
    lightModeSwitchTitle: "Use light theme",
    darkModeSwitchTitle: "Use dark theme",
  },
  vite: {
    plugins: [mathDiagramExamplesPlugin()],
  },
});
