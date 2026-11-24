import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import * as engine from "../src/index.js";
import { EXAMPLES } from "../app/examples.js";

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

test("every bundled studio program executes against the public DSL", async () => {
  const entries = Object.entries(engine).filter(([name]) => (
    /^[A-Za-z_$][\w$]*$/.test(name) && !["draw", "console", "default"].includes(name)
  ));
  for (const example of EXAMPLES) {
    let diagram;
    const capture = (value) => { diagram = value; return value; };
    const scope = Object.freeze({
      ...Object.fromEntries(entries),
      draw: capture,
      console,
    });
    const execute = new AsyncFunction("scope", `with (scope) {\n${example.code}\n}`);
    await execute(scope);
    assert.ok(diagram?.node, `${example.id} should draw a Diagram`);
    const svg = engine.renderSVG(diagram);
    assert.match(svg, /^<svg\b/);
    assert.doesNotMatch(svg, /NaN|Infinity|undefined/);
  }
});

test("author programs may shadow DSL helper names with local variables", async () => {
  let diagram;
  const scope = Object.freeze({
    ...engine,
    draw(value) { diagram = value; return value; },
    console,
  });
  const source = `
    const frame = rectangle(180, 180).fill("white").stroke("#222", 2);
    const center = point(0, 0);
    draw(overlay([frame, circle(8).fill("purple").translate(center.x, center.y)]));
  `;
  const execute = new AsyncFunction("scope", `with (scope) {\n${source}\n}`);
  await execute(scope);
  assert.ok(diagram?.node);
  assert.match(engine.renderSVG(diagram), /<svg\b/);
});

class FakeClassList {
  constructor(initial = "") {
    this.values = new Set(String(initial).split(/\s+/).filter(Boolean));
  }

  add(...names) { names.forEach(name => this.values.add(name)); }
  remove(...names) { names.forEach(name => this.values.delete(name)); }
  contains(name) { return this.values.has(name); }
  toggle(name, force) {
    const enabled = force == null ? !this.contains(name) : Boolean(force);
    if (enabled) this.add(name); else this.remove(name);
    return enabled;
  }
}

class FakeElement {
  constructor(id = "") {
    this.id = id;
    this.value = "";
    this.textContent = "";
    this.hidden = false;
    this.disabled = false;
    this.className = "";
    this.classList = new FakeClassList();
    this.style = {};
    this.dataset = {};
    this.attributes = new Map();
    this.listeners = new Map();
    this.children = [];
    this.selectionStart = 0;
    this.selectionEnd = 0;
    this.rect = { left: 0, top: 0, width: 1000, height: 700 };
    this.svg = null;
  }

  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(listener);
  }

  dispatch(type, values = {}) {
    const event = {
      target: this,
      currentTarget: this,
      preventDefault() {},
      button: 0,
      pointerId: 1,
      clientX: 0,
      clientY: 0,
      ...values,
    };
    for (const listener of this.listeners.get(type) || []) listener(event);
    return event;
  }

  append(...children) { this.children.push(...children); }
  appendChild(child) { this.children.push(child); return child; }
  replaceChildren(...children) { this.children = [...children]; }
  remove() {}
  click() { this.dispatch("click"); }
  focus() {}
  setSelectionRange(start, end) { this.selectionStart = start; this.selectionEnd = end; }
  setRangeText(text, start, end) {
    this.value = `${this.value.slice(0, start)}${text}${this.value.slice(end)}`;
    this.selectionStart = this.selectionEnd = start + text.length;
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  querySelector(selector) {
    if (selector === "svg") return this.svg;
    if (selector === "span") return this.children.find(child => child?.tagName === "span") || new FakeElement();
    return null;
  }
  querySelectorAll() { return []; }
  getBoundingClientRect() { return { ...this.rect, right: this.rect.left + this.rect.width, bottom: this.rect.top + this.rect.height }; }
  setPointerCapture() {}
  releasePointerCapture() {}
  hasPointerCapture() { return false; }
  set innerHTML(value) {
    this._innerHTML = value;
    if (/<svg\b/i.test(value)) {
      const viewBox = value.match(/viewBox=["']([^"']+)["']/i)?.[1]?.trim().split(/[ ,]+/).map(Number);
      const width = viewBox?.[2] || Number(value.match(/width=["']([\d.]+)/i)?.[1]) || 640;
      const height = viewBox?.[3] || Number(value.match(/height=["']([\d.]+)/i)?.[1]) || 480;
      this.svg = new FakeElement("svg");
      this.svg.tagName = "svg";
      this.svg.viewBox = { baseVal: { width, height } };
      this.svg.setAttribute("width", String(width));
      this.svg.setAttribute("height", String(height));
    } else {
      this.svg = null;
    }
  }
  get innerHTML() { return this._innerHTML || ""; }
}

function stripModuleSyntax(source) {
  return source
    .replace(/^import\s+\{[^}]+\}\s+from\s+["'][^"']+["'];?\s*/m, "")
    .replace(/new URL\("\.\/worker\.js",\s*import\.meta\.url\)/g, '"./worker.js"')
    .replace(/new URL\("\.\/assets\/fonts\/CoFoSans-Regular\.otf",\s*import\.meta\.url\)\.href/g, '"./assets/fonts/CoFoSans-Regular.otf"')
    .replace(/\binitialise\(\);\s*$/, "");
}

async function createStudioHarness() {
  const source = stripModuleSyntax(await fs.readFile(new URL("../app/main.js", import.meta.url), "utf8"));
  const ids = [
    "workspace", "pane-resizer", "editor-region", "example-select", "reset-button", "run-button",
    "empty-run-button", "export-button", "source-editor", "monaco-editor", "editor-mode", "cursor-position",
    "editor-theme-select",
    "save-state", "copy-code-button", "engine-badge", "console-panel", "console-output", "problems-output",
    "log-count", "problem-count", "clear-console-button", "collapse-console-button", "preview-canvas",
    "preview-empty", "diagram-layer", "render-overlay", "render-time", "diagram-size", "grid-button",
    "zoom-out-button", "zoom-in-button", "zoom-label", "fit-button", "toast-region",
  ];
  const elements = Object.fromEntries(ids.map(id => [id, new FakeElement(id)]));
  elements["engine-badge"].children.push(Object.assign(new FakeElement(), { tagName: "span" }));
  elements.workspace.rect = { left: 0, top: 0, width: 1400, height: 800 };
  elements["preview-canvas"].rect = { left: 500, top: 50, width: 900, height: 700 };
  elements["pane-resizer"].rect = { left: 500, top: 0, width: 5, height: 800 };
  elements["editor-region"].rect = { left: 0, top: 50, width: 500, height: 600 };
  elements["console-panel"].rect = { left: 0, top: 650, width: 500, height: 150 };

  const documentListeners = new Map();
  const windowListeners = new Map();
  const document = {
    body: elements.workspace,
    head: new FakeElement("head"),
    documentElement: new FakeElement("html"),
    querySelector(selector) { return selector.startsWith("#") ? elements[selector.slice(1)] : null; },
    querySelectorAll(selector) {
      if (selector === ".console-tab") return [];
      return [];
    },
    createElement(tagName) { const node = new FakeElement(); node.tagName = tagName; return node; },
    addEventListener(type, listener) {
      if (!documentListeners.has(type)) documentListeners.set(type, []);
      documentListeners.get(type).push(listener);
    },
    removeEventListener(type, listener) {
      documentListeners.set(type, (documentListeners.get(type) || []).filter(value => value !== listener));
    },
  };
  const localStorage = new Map();
  const rafQueue = [];
  const timeoutQueue = new Map();
  let nextTimeout = 1;
  const window = {
    innerWidth: 1400,
    setTimeout(callback) { const id = nextTimeout++; timeoutQueue.set(id, callback); return id; },
    clearTimeout(id) { timeoutQueue.delete(id); },
    requestAnimationFrame(callback) { rafQueue.push(callback); return rafQueue.length; },
    cancelAnimationFrame() {},
    addEventListener(type, listener) {
      if (!windowListeners.has(type)) windowListeners.set(type, []);
      windowListeners.get(type).push(listener);
    },
    dispatch(type, values = {}) {
      for (const listener of windowListeners.get(type) || []) listener({ type, ...values });
    },
    confirm() { return true; },
    monaco: null,
  };
  const storage = {
    getItem(key) { return localStorage.get(key) ?? null; },
    setItem(key, value) { localStorage.set(key, String(value)); },
  };
  const context = vm.createContext({
    console,
    document,
    window,
    localStorage: storage,
    navigator: { clipboard: { writeText: async () => {} } },
    URL,
    Blob,
    EXAMPLES,
    getExample(id) { return EXAMPLES.find(example => example.id === id) || EXAMPLES[0]; },
    requestAnimationFrame: window.requestAnimationFrame,
    cancelAnimationFrame: window.cancelAnimationFrame,
    setTimeout: window.setTimeout,
    clearTimeout: window.clearTimeout,
    DOMParser: class {
      parseFromString(svgText) {
        const root = new FakeElement("svg");
        root.localName = "svg";
        root.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        for (const [, name, quote, value] of svgText.matchAll(/([\w:-]+)=(['"])(.*?)\2/g)) {
          root.setAttribute(name, value);
        }
        root.querySelectorAll = () => [];
        return {
          documentElement: root,
          querySelector() { return null; },
        };
      }
    },
    XMLSerializer: class {
      serializeToString(root) {
        const attributes = [...root.attributes]
          .map(([name, value]) => `${name}="${value}"`)
          .join(" ");
        return `<svg${attributes ? ` ${attributes}` : ""}></svg>`;
      }
    },
  });
  vm.runInContext(`${source}\n;globalThis.__studio = { state, elements, handleRunResult, setView, fitDiagram, selectExample, bindEvents, setupResizer, applyEditorTheme, embedCoFoFont };`, context);

  function dispatchDocument(type, values = {}) {
    for (const listener of documentListeners.get(type) || []) listener({ preventDefault() {}, ...values });
  }

  function flushAnimationFrames() {
    while (rafQueue.length) rafQueue.shift()(0);
  }

  function successfulRender(requestId = 1, width = 400, height = 300) {
    context.__studio.handleRunResult({
      requestId,
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"></svg>`,
      duration: 1,
      logs: [],
    });
  }

  return { context, elements, window, successfulRender, flushAnimationFrames, dispatchDocument };
}

test("ordinary successful rerenders fit only the initial result", async () => {
  const studio = await createStudioHarness();
  studio.successfulRender(1);
  assert.equal(studio.elements["diagram-layer"].style.transform || "", "");
  studio.flushAnimationFrames();
  const fitted = studio.elements["diagram-layer"].style.transform;
  assert.notEqual(fitted, "translate(0px, 0px) scale(1)");

  studio.context.__studio.setView({ scale: 2.25, x: 137, y: -42 });
  const userCamera = studio.elements["diagram-layer"].style.transform;
  studio.successfulRender(2, 420, 320);
  studio.flushAnimationFrames();
  assert.equal(studio.elements["diagram-layer"].style.transform, userCamera);
});

test("switching examples schedules a fit for the replacement result", async () => {
  const studio = await createStudioHarness();
  studio.successfulRender(1);
  studio.flushAnimationFrames();
  studio.context.__studio.setView({ scale: 2, x: 111, y: -33 });
  const userCamera = studio.elements["diagram-layer"].style.transform;

  const next = EXAMPLES.find(example => example.id !== studio.context.__studio.state.currentExample);
  studio.context.__studio.selectExample(next.id);
  studio.successfulRender(2, 500, 240);
  assert.equal(studio.elements["diagram-layer"].style.transform, userCamera);
  studio.flushAnimationFrames();
  assert.notEqual(studio.elements["diagram-layer"].style.transform, userCamera);
});

test("window and pane resizing preserve an adjusted user camera", async () => {
  const studio = await createStudioHarness();
  studio.context.__studio.bindEvents();
  studio.context.__studio.setupResizer();
  studio.successfulRender(1);
  studio.flushAnimationFrames();
  studio.context.__studio.setView({ scale: 2.4, x: 153, y: -51 });
  const userCamera = studio.elements["diagram-layer"].style.transform;

  studio.elements["preview-canvas"].rect.width = 760;
  studio.window.dispatch("resize");
  assert.equal(studio.elements["diagram-layer"].style.transform, userCamera);

  studio.elements["pane-resizer"].dispatch("pointerdown", { clientX: 500 });
  studio.dispatchDocument("pointermove", { clientX: 620 });
  studio.dispatchDocument("pointerup", { clientX: 620 });
  assert.equal(studio.elements["diagram-layer"].style.transform, userCamera);
});

test("studio keeps its smooth camera-update hooks", async () => {
  const [mainSource, styles] = await Promise.all([
    fs.readFile(new URL("../app/main.js", import.meta.url), "utf8"),
    fs.readFile(new URL("../app/styles.css", import.meta.url), "utf8"),
  ]);
  assert.match(mainSource, /requestAnimationFrame\s*\(/);
  assert.match(styles, /\.diagram-layer\s*\{[^}]*will-change:\s*transform/s);
  assert.match(styles, /\.diagram-layer\s*\{[^}]*transform-origin:\s*0 0/s);
});

test("studio loads CoFo Sans, IBM Plex Mono, and selectable editor themes", async () => {
  const [html, mainSource, styles] = await Promise.all([
    fs.readFile(new URL("../app/index.html", import.meta.url), "utf8"),
    fs.readFile(new URL("../app/main.js", import.meta.url), "utf8"),
    fs.readFile(new URL("../app/styles.css", import.meta.url), "utf8"),
  ]);

  assert.match(html, /family=IBM\+Plex\+Mono/);
  assert.match(html, /id="editor-theme-select"/);
  assert.match(html, /value="black"/);
  assert.match(html, /value="github-dark"/);
  assert.match(html, /value="solarized-light"/);
  assert.match(styles, /@font-face\s*\{[^}]*font-family:\s*"CoFo Sans"/s);
  assert.match(styles, /CoFoSans-Regular\.otf/);
  assert.match(styles, /--font-ui:\s*"CoFo Sans"/);
  assert.match(styles, /--font-code:\s*"IBM Plex Mono"/);
  assert.match(mainSource, /math-diagrammer-black/);
  assert.match(mainSource, /math-diagrammer-github-dark/);
  assert.match(mainSource, /math-diagrammer-solarized-light/);
});

test("editor theme selection updates the fallback editor and persists", async () => {
  const studio = await createStudioHarness();
  studio.context.__studio.bindEvents();
  const select = studio.elements["editor-theme-select"];

  select.value = "github-dark";
  select.dispatch("change");

  assert.equal(studio.context.document.documentElement.dataset.editorTheme, "github-dark");
  assert.equal(
    studio.context.localStorage.getItem("math-diagrammer.editor-theme.v1"),
    "github-dark",
  );
  assert.equal(studio.context.__studio.applyEditorTheme("unknown", { persist: false }), "black");
});

test("SVG export helper embeds CoFo Sans exactly once", async () => {
  const studio = await createStudioHarness();
  const source = '<svg xmlns="http://www.w3.org/2000/svg"><text>Label</text></svg>';
  const data = "data:font/otf;base64,QUJD";
  const embedded = studio.context.__studio.embedCoFoFont(source, data);
  const repeated = studio.context.__studio.embedCoFoFont(embedded, data);

  assert.match(embedded, /data-math-diagrammer-font="CoFo Sans"/);
  assert.match(embedded, /data:font\/otf;base64,QUJD/);
  assert.equal(repeated, embedded);
});

test("the diagonal subdivision example uses the canonical stack API", () => {
  const example = EXAMPLES.find(({ id }) => id === "diagonal-subdivision");
  assert.ok(example, "diagonal subdivision example should be bundled");
  assert.match(example.code, /\bstack\s*\(/);
  assert.doesNotMatch(example.code, /\boverlay\s*\(/);
});

test("the diagonal tile pattern uses the semantic cell-grid API", () => {
  const example = EXAMPLES.find(({ id }) => id === "diagonal-tile-pattern");
  assert.ok(example, "diagonal tile pattern example should be bundled");
  assert.match(example.code, /\bcellGrid\s*\(/);
  assert.match(example.code, /shadedTriangles/);
  assert.doesNotMatch(example.code, /gridPoint|Array\.from|Math\.floor/);
});

test("cell-grid examples demonstrate both shorthand and semantic addressing", () => {
  const hundredGrid = EXAMPLES.find(({ id }) => id === "hundred-grid");
  const customContent = EXAMPLES.find(({ id }) => id === "cell-grid-content");
  assert.ok(hundredGrid);
  assert.ok(customContent);
  assert.match(hundredGrid.code, /shadedCells:\s*37/);
  assert.match(customContent.code, /grid\.cell\(0,\s*0\)\.place/);
});
