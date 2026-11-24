import fs from "node:fs/promises";
import { codeToHtml } from "shiki";
import * as engine from "../../../src/index.js";
import { diagramExampleDefinitions } from "./diagram-example-definitions.mjs";
import { coreApiExampleDefinitions } from "./core-api-example-definitions.mjs";
import { mathApiExampleDefinitions } from "./math-api-example-definitions.mjs";
import { outputApiExampleDefinitions } from "./output-api-example-definitions.mjs";
import { geometryApiExampleDefinitions } from "./geometry-api-example-definitions.mjs";

const { renderSvg } = engine;
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

async function highlightSource(source, language = "js") {
  const html = await codeToHtml(source, {
    lang: language,
    themes: { light: "github-light", dark: "github-dark" },
    transformers: [{
      line(node, line) {
        node.properties["data-line"] = line;
      },
    }],
  });
  return html.match(/<code[^>]*>([\s\S]*?)<\/code>/)?.[1] ?? "";
}

const markdownExampleDefinitions = Object.freeze([
  {
    id: "recipe-fractions-and-number-lines",
    file: "fractions-and-number-lines.md",
    title: "Fractions and a number line",
    description: "Connect a fraction model to the same value on an axis.",
  },
  {
    id: "recipe-function-plot",
    file: "function-plot.md",
    title: "Annotated function plot",
    description: "Plot a parabola and project a lesson-specific annotation onto it.",
  },
  {
    id: "recipe-statistics-dashboard",
    file: "statistics-dashboard.md",
    title: "Statistics dashboard",
    description: "Compose four statistical views into a consistent summary sheet.",
  },
  {
    id: "recipe-probability-tree",
    file: "probability-tree.md",
    title: "Probability tree",
    description: "Turn nested outcome data into a labeled two-stage tree.",
  },
  {
    id: "recipe-geometry-and-pythagoras",
    file: "geometry-and-pythagoras.md",
    title: "Geometry and Pythagoras",
    description: "Place a measured triangle beside the square construction.",
  },
  {
    id: "recipe-venn-diagram",
    file: "venn-diagram.md",
    title: "Venn diagram",
    description: "Combine a reusable set diagram with a lesson-specific universe and formula.",
  },
  {
    id: "recipe-generative-patterns",
    file: "generative-patterns.md",
    title: "Generative patterns",
    description: "Present a spiral and recursive triangle using one panel grammar.",
  },
  {
    id: "recipe-lesson-card",
    file: "lesson-card.md",
    title: "Lesson explanation card",
    description: "Combine prose, a formula, and a semantic visual in one export.",
  },
  {
    id: "recipe-custom-cell-grid",
    file: "custom-cell-grid.md",
    title: "Custom semantic cell grid",
    description: "Express a route with cell addresses while the grid owns the coordinates.",
  },
]);

export const DIAGRAM_EXAMPLES_MODULE_ID = "virtual:math-diagram-examples";
const RESOLVED_MODULE_ID = `\0${DIAGRAM_EXAMPLES_MODULE_ID}`;

function assertSafeGeneratedSvg(svg, id) {
  if (!/^<svg\b[^>]*xmlns=["']http:\/\/www\.w3\.org\/2000\/svg["']/i.test(svg)) {
    throw new Error(`Diagram example "${id}" did not produce a standalone SVG.`);
  }

  const forbiddenMarkup = /<(?:script|foreignObject|iframe|object|embed)\b|\son[a-z]+\s*=|javascript:/i;
  const externalResource = /\b(?:href|src)\s*=\s*["']\s*(?:https?:|\/\/|data:text\/html)/i;
  if (forbiddenMarkup.test(svg) || externalResource.test(svg)) {
    throw new Error(`Diagram example "${id}" produced unsafe SVG markup.`);
  }

  if (/NaN|Infinity|undefined/.test(svg)) {
    throw new Error(`Diagram example "${id}" contains invalid geometry.`);
  }
}

async function renderDefinitions(definitions) {
  const records = {};

  for (const definition of definitions) {
    if (!definition.id || records[definition.id]) {
      throw new Error(`Diagram example ids must be unique and non-empty: "${definition.id ?? ""}".`);
    }

    try {
      const svg = renderSvg(definition.build(), definition.render);
      assertSafeGeneratedSvg(svg, definition.id);
      const source = String(definition.source ?? "").trim();
      const language = definition.language ?? "js";
      records[definition.id] = {
        id: definition.id,
        title: definition.title ?? "",
        description: definition.description ?? "",
        language,
        source,
        highlightedSource: await highlightSource(source, language),
        svg,
      };
    } catch (error) {
      error.message = `Could not render documentation diagram "${definition.id}": ${error.message}`;
      throw error;
    }
  }

  return records;
}

function extractFirstJavaScriptBlock(markdown, file) {
  const match = markdown.match(/```js\s*\r?\n([\s\S]*?)```/);
  if (!match) throw new Error(`Documentation recipe "${file}" has no JavaScript block.`);
  return match[1].trim();
}

async function renderMarkdownDefinitions(definitions) {
  const records = {};
  const entries = Object.entries(engine).filter(([name]) => (
    /^[A-Za-z_$][\w$]*$/.test(name) && !["draw", "console", "default"].includes(name)
  ));

  for (const definition of definitions) {
    const url = new URL(`../../examples/${definition.file}`, import.meta.url);
    const markdown = await fs.readFile(url, "utf8");
    const source = extractFirstJavaScriptBlock(markdown, definition.file);
    let diagram;
    const scope = Object.freeze({
      ...Object.fromEntries(entries),
      draw(value) { diagram = value; return value; },
      console: Object.freeze({ log() {}, info() {}, warn() {}, error() {} }),
    });

    try {
      const execute = new AsyncFunction("scope", `with (scope) {\n${source}\n}`);
      await execute(scope);
      if (!diagram?.node) throw new Error("the program did not draw a Diagram");
      const svg = renderSvg(diagram, {
        padding: 32,
        ariaLabel: definition.title,
      });
      assertSafeGeneratedSvg(svg, definition.id);
      records[definition.id] = {
        id: definition.id,
        title: definition.title,
        description: definition.description,
        language: "js",
        source,
        highlightedSource: await highlightSource(source, "js"),
        svg,
      };
    } catch (error) {
      error.message = `Could not render documentation recipe "${definition.id}": ${error.message}`;
      throw error;
    }
  }

  return records;
}

/**
 * Pre-renders trusted diagram definitions while Vite is building the docs.
 * The virtual client module contains only JSON data; it never ships the
 * diagram engine or a JavaScript evaluator to documentation readers.
 */
export function mathDiagramExamplesPlugin(options = {}) {
  const requestedIds = options.include ? new Set(options.include) : null;
  let recordsPromise;

  async function records() {
    if (!recordsPromise) {
      recordsPromise = (async () => {
        const allDefinitions = [
          ...diagramExampleDefinitions,
          ...coreApiExampleDefinitions,
          ...mathApiExampleDefinitions,
          ...outputApiExampleDefinitions,
          ...geometryApiExampleDefinitions,
        ];
        const definitions = requestedIds
          ? allDefinitions.filter(item => requestedIds.has(item.id))
          : allDefinitions;
        const markdownDefinitions = requestedIds
          ? markdownExampleDefinitions.filter(item => requestedIds.has(item.id))
          : markdownExampleDefinitions;
        return {
          ...await renderDefinitions(definitions),
          ...await renderMarkdownDefinitions(markdownDefinitions),
        };
      })();
    }
    return recordsPromise;
  }

  return {
    name: "math-diagrammer:documentation-examples",
    enforce: "pre",

    resolveId(id) {
      return id === DIAGRAM_EXAMPLES_MODULE_ID ? RESOLVED_MODULE_ID : null;
    },

    async load(id) {
      if (id !== RESOLVED_MODULE_ID) return null;

      const payload = JSON.stringify(await records()).replaceAll("<", "\\u003c");

      return [
        `export const diagramExamples = Object.freeze(${payload});`,
        "export function diagramExample(id) {",
        "  const example = diagramExamples[id];",
        "  if (!example) throw new Error(`Unknown diagram example: ${id}`);",
        "  return example;",
        "}",
        "export default diagramExamples;",
      ].join("\n");
    },
  };
}

export default mathDiagramExamplesPlugin;
