import * as coreEngine from "../src/index.js";
import * as mathEngine from "../src/math/index.js";

// Keep the worker's public author surface flat: core primitives and the
// reusable math-diagram library can be used in the same source file.
const engine = { ...coreEngine, ...mathEngine };

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

function isIdentifier(name) {
  return /^[A-Za-z_$][\w$]*$/.test(name);
}

function formatValue(value) {
  if (typeof value === "string") return value;
  if (typeof value === "undefined") return "undefined";
  if (typeof value === "function") return `[Function ${value.name || "anonymous"}]`;
  try {
    return JSON.stringify(value, (_key, item) => {
      if (typeof item === "bigint") return `${item}n`;
      if (typeof item === "function") return `[Function ${item.name || "anonymous"}]`;
      return item;
    }, 2);
  } catch {
    return String(value);
  }
}

function extractSvg(value) {
  if (typeof value === "string" && /<svg[\s>]/i.test(value)) return value;
  if (!value || typeof value !== "object") return null;

  for (const key of ["svg", "markup", "html", "source"]) {
    if (typeof value[key] === "string" && /<svg[\s>]/i.test(value[key])) {
      return value[key];
    }
  }

  if (typeof value.outerHTML === "string" && /<svg[\s>]/i.test(value.outerHTML)) {
    return value.outerHTML;
  }

  return null;
}

async function callSerializer(fn, owner, diagram, options) {
  const attempts = [
    () => fn.call(owner, diagram, options),
    () => fn.call(owner, diagram),
    () => fn.call(owner, { diagram, ...options }),
  ];

  let lastError;
  for (const attempt of attempts) {
    try {
      const result = await attempt();
      const svg = extractSvg(result);
      if (svg) return svg;
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError) throw lastError;
  return null;
}

async function serializeDiagram(engine, diagram, options) {
  const directSvg = extractSvg(diagram);
  if (directSvg) return directSvg;

  const moduleCandidates = [
    "renderSvg",
    "renderSVG",
    "toSvg",
    "toSVG",
    "exportSvg",
    "exportSVG",
    "renderToString",
    "serialize",
    "render",
  ];

  for (const name of moduleCandidates) {
    if (typeof engine[name] !== "function") continue;
    const svg = await callSerializer(engine[name], engine, diagram, options);
    if (svg) return svg;
  }

  if (diagram && typeof diagram === "object") {
    for (const name of ["toSvg", "toSVG", "renderSvg", "renderSVG", "render", "serialize"]) {
      if (typeof diagram[name] !== "function") continue;
      const svg = await callSerializer(diagram[name], diagram, options, options);
      if (svg) return svg;
    }
  }

  throw new Error(
    "The diagram was created, but no SVG serializer was found. " +
    "Export renderSvg(diagram), renderSVG(diagram), toSVG(diagram), or add diagram.toSVG()."
  );
}

function errorDetails(error) {
  const stack = String(error?.stack || "");
  const sourceMatch = stack.match(/diagram-program\.js:(\d+):(\d+)/);
  let line = Number(sourceMatch?.[1] || 0);
  let column = Number(sourceMatch?.[2] || 0);

  // AsyncFunction inserts a short wrapper before user source in most engines.
  if (line > 2) line -= 2;

  return {
    name: error?.name || "Error",
    message: error?.message || String(error),
    stack,
    line: Math.max(0, line),
    column: Math.max(0, column),
  };
}

self.addEventListener("message", async event => {
  const { type, requestId, source, options = {} } = event.data || {};
  if (type !== "run") return;

  const startedAt = performance.now();
  const logs = [];
  const report = level => (...values) => {
    logs.push({ level, text: values.map(formatValue).join(" ") });
  };

  try {
    // DSL names live in a scope object instead of becoming function
    // parameters. This lets author code use ordinary local names such as
    // `const frame = ...` even though the engine also exports `frame()`.
    const entries = Object.entries(engine).filter(([name]) => (
      isIdentifier(name) && name !== "draw" && name !== "console" && name !== "default"
    ));
    const names = entries.map(([name]) => name);
    let diagram;

    const draw = value => {
      diagram = value;
      return value;
    };

    const scopedConsole = Object.freeze({
      log: report("log"),
      info: report("info"),
      warn: report("warn"),
      error: report("error"),
    });

    const scope = Object.freeze({
      ...Object.fromEntries(entries),
      draw,
      console: scopedConsole,
    });

    // `with` is used only inside this isolated, time-limited authoring worker.
    // Lexical declarations in user source correctly shadow DSL helpers.
    const execute = new AsyncFunction(
      "scope",
      `with (scope) {\n${source}\n}\n//# sourceURL=diagram-program.js`
    );

    const returned = await execute(scope);
    if (diagram == null && returned != null) diagram = returned;

    if (diagram == null) {
      throw new Error("Nothing was drawn. End the program with draw(yourDiagram).");
    }

    const svg = await serializeDiagram(engine, diagram, options);
    self.postMessage({
      type: "result",
      requestId,
      svg,
      logs,
      duration: performance.now() - startedAt,
      engineExports: names,
    });
  } catch (error) {
    self.postMessage({
      type: "error",
      requestId,
      error: errorDetails(error),
      logs,
      duration: performance.now() - startedAt,
    });
  }
});
