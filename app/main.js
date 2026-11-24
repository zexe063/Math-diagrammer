import { EXAMPLES, getExample } from "./examples.js";

const $ = selector => document.querySelector(selector);

const elements = {
  workspace: $("#workspace"),
  resizer: $("#pane-resizer"),
  editorRegion: $("#editor-region"),
  exampleSelect: $("#example-select"),
  resetButton: $("#reset-button"),
  runButton: $("#run-button"),
  emptyRunButton: $("#empty-run-button"),
  exportButton: $("#export-button"),
  source: $("#source-editor"),
  monaco: $("#monaco-editor"),
  editorThemeSelect: $("#editor-theme-select"),
  editorMode: $("#editor-mode"),
  cursorPosition: $("#cursor-position"),
  saveState: $("#save-state"),
  copyCodeButton: $("#copy-code-button"),
  engineBadge: $("#engine-badge"),
  consolePanel: $("#console-panel"),
  consoleOutput: $("#console-output"),
  problemsOutput: $("#problems-output"),
  logCount: $("#log-count"),
  problemCount: $("#problem-count"),
  clearConsoleButton: $("#clear-console-button"),
  collapseConsoleButton: $("#collapse-console-button"),
  previewCanvas: $("#preview-canvas"),
  previewEmpty: $("#preview-empty"),
  diagramLayer: $("#diagram-layer"),
  renderOverlay: $("#render-overlay"),
  renderTime: $("#render-time"),
  diagramSize: $("#diagram-size"),
  gridButton: $("#grid-button"),
  zoomOutButton: $("#zoom-out-button"),
  zoomInButton: $("#zoom-in-button"),
  zoomLabel: $("#zoom-label"),
  fitButton: $("#fit-button"),
  toastRegion: $("#toast-region"),
};

const STORAGE = {
  source: "math-diagrammer.source.v1",
  example: "math-diagrammer.example.v1",
  paneWidth: "math-diagrammer.pane-width.v1",
  editorTheme: "math-diagrammer.editor-theme.v1",
};

const EDITOR_THEMES = Object.freeze({
  black: Object.freeze({
    label: "Black",
    monacoName: "math-diagrammer-black",
    base: "vs-dark",
    rules: [
      { token: "comment", foreground: "737373", fontStyle: "italic" },
      { token: "keyword", foreground: "C4B5FD" },
      { token: "number", foreground: "F9A8D4" },
      { token: "string", foreground: "86EFAC" },
      { token: "identifier", foreground: "F4F4F5" },
      { token: "delimiter", foreground: "A1A1AA" },
    ],
    colors: {
      "editor.background": "#050505",
      "editor.foreground": "#F4F4F5",
      "editorLineNumber.foreground": "#52525B",
      "editorLineNumber.activeForeground": "#D4D4D8",
      "editor.selectionBackground": "#3F3F4666",
      "editor.inactiveSelectionBackground": "#27272A66",
      "editor.lineHighlightBackground": "#0C0C0F",
      "editorCursor.foreground": "#FFFFFF",
      "editorGutter.background": "#080808",
      "editorIndentGuide.background1": "#27272A",
      "editorIndentGuide.activeBackground1": "#52525B",
    },
  }),
  "github-dark": Object.freeze({
    label: "GitHub Dark",
    monacoName: "math-diagrammer-github-dark",
    base: "vs-dark",
    rules: [
      { token: "comment", foreground: "8B949E", fontStyle: "italic" },
      { token: "keyword", foreground: "FF7B72" },
      { token: "number", foreground: "79C0FF" },
      { token: "string", foreground: "A5D6FF" },
      { token: "identifier", foreground: "E6EDF3" },
    ],
    colors: {
      "editor.background": "#0D1117",
      "editor.foreground": "#E6EDF3",
      "editorLineNumber.foreground": "#484F58",
      "editorLineNumber.activeForeground": "#E6EDF3",
      "editor.selectionBackground": "#388BFD44",
      "editor.lineHighlightBackground": "#161B22",
      "editorCursor.foreground": "#58A6FF",
      "editorGutter.background": "#0D1117",
      "editorIndentGuide.background1": "#21262D",
      "editorIndentGuide.activeBackground1": "#484F58",
    },
  }),
  "solarized-light": Object.freeze({
    label: "Solarized Light",
    monacoName: "math-diagrammer-solarized-light",
    base: "vs",
    rules: [
      { token: "comment", foreground: "93A1A1", fontStyle: "italic" },
      { token: "keyword", foreground: "859900" },
      { token: "number", foreground: "D33682" },
      { token: "string", foreground: "2AA198" },
      { token: "identifier", foreground: "586E75" },
    ],
    colors: {
      "editor.background": "#FDF6E3",
      "editor.foreground": "#586E75",
      "editorLineNumber.foreground": "#93A1A1",
      "editorLineNumber.activeForeground": "#586E75",
      "editor.selectionBackground": "#268BD233",
      "editor.lineHighlightBackground": "#F5EFD9",
      "editorCursor.foreground": "#268BD2",
      "editorGutter.background": "#EEE8D5",
      "editorIndentGuide.background1": "#D9D1BD",
      "editorIndentGuide.activeBackground1": "#93A1A1",
    },
  }),
});

const DEFAULT_EDITOR_THEME = "black";
const COFO_FONT_URL = new URL("./assets/fonts/CoFoSans-Regular.otf", import.meta.url).href;
let cofoFontDataPromise = null;

const state = {
  currentExample: "welcome",
  svg: "",
  runTimer: 0,
  saveTimer: 0,
  runSequence: 0,
  worker: null,
  workerTimeout: 0,
  monacoEditor: null,
  monacoModel: null,
  editorTheme: DEFAULT_EDITOR_THEME,
  logs: [],
  problems: [],
  view: { scale: 1, x: 0, y: 0 },
  pointer: null,
  hasInitialFit: false,
  fitNextRender: true,
  viewAnimationTimer: 0,
};

function normalizeEditorTheme(value) {
  return EDITOR_THEMES[value] ? value : DEFAULT_EDITOR_THEME;
}

function defineMonacoThemes() {
  if (!window.monaco) return;
  for (const theme of Object.values(EDITOR_THEMES)) {
    window.monaco.editor.defineTheme(theme.monacoName, {
      base: theme.base,
      inherit: true,
      rules: theme.rules,
      colors: theme.colors,
    });
  }
}

function applyEditorTheme(value, { persist = true } = {}) {
  const name = normalizeEditorTheme(value);
  state.editorTheme = name;
  document.documentElement.dataset.editorTheme = name;
  if (elements.editorThemeSelect) elements.editorThemeSelect.value = name;
  if (persist) localStorage.setItem(STORAGE.editorTheme, name);
  if (window.monaco) {
    window.monaco.editor.setTheme(EDITOR_THEMES[name].monacoName);
  }
  return name;
}

function loadEditorTheme() {
  applyEditorTheme(localStorage.getItem(STORAGE.editorTheme), { persist: false });
}

function populateExamples() {
  const groups = new Map();
  for (const example of EXAMPLES) {
    if (!groups.has(example.group)) groups.set(example.group, []);
    groups.get(example.group).push(example);
  }

  for (const [label, examples] of groups) {
    const group = document.createElement("optgroup");
    group.label = label;
    for (const example of examples) {
      const option = document.createElement("option");
      option.value = example.id;
      option.textContent = example.title;
      group.append(option);
    }
    elements.exampleSelect.append(group);
  }
}

function getCode() {
  return state.monacoEditor ? state.monacoEditor.getValue() : elements.source.value;
}

function setCode(code, { preserveHistory = false } = {}) {
  if (state.monacoEditor) {
    if (preserveHistory) {
      state.monacoEditor.executeEdits("math-diagrammer", [{
        range: state.monacoModel.getFullModelRange(),
        text: code,
        forceMoveMarkers: true,
      }]);
    } else {
      state.monacoEditor.setValue(code);
    }
  }
  elements.source.value = code;
  updateCursorPosition();
}

function loadInitialSource() {
  const savedExample = localStorage.getItem(STORAGE.example);
  state.currentExample = getExample(savedExample).id;
  elements.exampleSelect.value = state.currentExample;

  const saved = localStorage.getItem(STORAGE.source);
  setCode(saved || getExample(state.currentExample).code);
}

function persistSource() {
  clearTimeout(state.saveTimer);
  elements.saveState.textContent = "Saving…";
  state.saveTimer = window.setTimeout(() => {
    localStorage.setItem(STORAGE.source, getCode());
    localStorage.setItem(STORAGE.example, state.currentExample);
    elements.saveState.textContent = "Saved locally";
  }, 220);
}

function sourceChanged() {
  persistSource();
  scheduleRun();
  updateCursorPosition();
}

function scheduleRun() {
  clearTimeout(state.runTimer);
  state.runTimer = window.setTimeout(() => runSource({ quiet: true }), 650);
}

function setEngineStatus(kind, label) {
  elements.engineBadge.className = `status-badge ${kind ? `is-${kind}` : ""}`;
  elements.engineBadge.querySelector("span").textContent = label;
}

function setRendering(isRendering) {
  elements.renderOverlay.hidden = !isRendering;
  elements.runButton.disabled = isRendering;
  elements.diagramLayer.classList.toggle("is-updating", isRendering && Boolean(state.svg));
}

function makeWorker() {
  return new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
}

async function runSource({ quiet = false } = {}) {
  clearTimeout(state.runTimer);
  const source = getCode();
  const requestId = ++state.runSequence;

  if (state.worker) state.worker.terminate();
  clearTimeout(state.workerTimeout);
  setRendering(true);
  setEngineStatus("loading", "Rendering");
  clearDiagnostics();

  let worker;
  try {
    worker = makeWorker();
    state.worker = worker;
  } catch (error) {
    handleRunError(requestId, {
      name: "WorkerError",
      message: `Could not start the diagram worker: ${error.message}`,
      line: 0,
      column: 0,
    }, []);
    return;
  }

  worker.addEventListener("message", event => {
    if (requestId !== state.runSequence) return;
    const message = event.data || {};
    if (message.type === "result") {
      handleRunResult(message);
    } else if (message.type === "error") {
      handleRunError(requestId, message.error, message.logs || [], message.duration);
    }
  });

  worker.addEventListener("error", event => {
    if (requestId !== state.runSequence) return;
    handleRunError(requestId, {
      name: "EngineLoadError",
      message: event.message || "The engine module could not be loaded. Run the project through a local development server.",
      line: event.lineno || 0,
      column: event.colno || 0,
    }, []);
  });

  worker.postMessage({
    type: "run",
    requestId,
    source,
    options: { padding: 32, background: "transparent" },
  });

  state.workerTimeout = window.setTimeout(() => {
    if (requestId !== state.runSequence) return;
    worker.terminate();
    handleRunError(requestId, {
      name: "ExecutionTimeout",
      message: "The program ran for more than 8 seconds and was stopped. Check for an infinite loop or excessive recursion.",
      line: 0,
      column: 0,
    }, []);
  }, 8000);

  if (!quiet) toast("Running diagram…");
}

function handleRunResult(message) {
  clearTimeout(state.workerTimeout);
  state.worker?.terminate();
  state.worker = null;

  try {
    const cleanSvg = sanitizeSvg(message.svg);
    const shouldFit = state.fitNextRender || !state.hasInitialFit;
    state.svg = cleanSvg;
    elements.diagramLayer.classList.add("is-entering");
    elements.diagramLayer.innerHTML = cleanSvg;
    prepareSvgSize();
    elements.previewEmpty.hidden = true;
    elements.exportButton.disabled = false;
    state.logs = message.logs || [];
    state.problems = [];
    renderConsole();
    clearMarkers();
    setRendering(false);
    setEngineStatus("", "Engine ready");
    elements.renderTime.textContent = `Rendered in ${formatDuration(message.duration)}`;
    updateDiagramMetadata();

    requestAnimationFrame(() => {
      if (shouldFit) {
        fitDiagram({ animate: state.hasInitialFit });
      } else {
        setView(state.view);
      }

      requestAnimationFrame(() => {
        elements.diagramLayer.classList.remove("is-entering");
      });
    });
  } catch (error) {
    handleRunError(message.requestId, {
      name: "InvalidSvgError",
      message: error.message,
      line: 0,
      column: 0,
    }, message.logs || [], message.duration);
  }
}

function handleRunError(requestId, error, logs = [], duration = 0) {
  if (requestId !== state.runSequence) return;
  clearTimeout(state.workerTimeout);
  state.worker?.terminate();
  state.worker = null;
  state.logs = logs;
  state.problems = [error || { name: "Error", message: "Unknown execution error" }];
  renderConsole();
  setMarkers(state.problems);
  setRendering(false);
  setEngineStatus("error", "Needs attention");
  elements.renderTime.textContent = duration ? `Failed after ${formatDuration(duration)}` : "Render failed";
  elements.consolePanel.classList.remove("is-collapsed");
  switchConsoleTab("problems");
}

function sanitizeSvg(svgText) {
  if (typeof svgText !== "string" || !/<svg[\s>]/i.test(svgText)) {
    throw new Error("The renderer did not return a valid SVG document.");
  }

  const parser = new DOMParser();
  const documentNode = parser.parseFromString(svgText, "image/svg+xml");
  if (documentNode.querySelector("parsererror")) {
    throw new Error("The renderer returned malformed SVG markup.");
  }

  const svg = documentNode.documentElement;
  if (svg.localName !== "svg") throw new Error("SVG output is missing its root <svg> element.");

  svg.querySelectorAll("script").forEach(node => node.remove());
  for (const node of [svg, ...svg.querySelectorAll("*")]) {
    for (const attribute of [...node.attributes]) {
      if (/^on/i.test(attribute.name)) node.removeAttribute(attribute.name);
      if (/^(href|xlink:href)$/i.test(attribute.name) && /^\s*javascript:/i.test(attribute.value)) {
        node.removeAttribute(attribute.name);
      }
    }
  }

  if (!svg.getAttribute("xmlns")) svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  return new XMLSerializer().serializeToString(svg);
}

function updateDiagramMetadata() {
  const svg = elements.diagramLayer.querySelector("svg");
  if (!svg) return;
  const metrics = svgMetrics(svg);
  elements.diagramSize.textContent = `${round(metrics.width)} × ${round(metrics.height)} SVG`;
}

function svgMetrics(svg) {
  const viewBox = svg.viewBox?.baseVal;
  if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
    return { width: viewBox.width, height: viewBox.height };
  }

  const width = parseFloat(svg.getAttribute("width")) || 640;
  const height = parseFloat(svg.getAttribute("height")) || 480;
  return { width, height };
}

function renderConsole() {
  elements.consoleOutput.replaceChildren();
  elements.problemsOutput.replaceChildren();

  if (!state.logs.length) {
    const empty = document.createElement("div");
    empty.className = "console-empty";
    empty.textContent = state.problems.length ? "No console output" : "Program completed without console output";
    elements.consoleOutput.append(empty);
  } else {
    for (const log of state.logs) {
      const line = document.createElement("div");
      line.className = `console-line ${log.level || "log"}`;
      line.textContent = log.text;
      elements.consoleOutput.append(line);
    }
  }

  if (!state.problems.length) {
    const empty = document.createElement("div");
    empty.className = "console-empty";
    empty.textContent = "No problems detected";
    elements.problemsOutput.append(empty);
  } else {
    for (const problem of state.problems) {
      const card = document.createElement("div");
      card.className = "problem-card";
      card.tabIndex = 0;
      const heading = document.createElement("strong");
      const location = problem.line ? ` · line ${problem.line}${problem.column ? `:${problem.column}` : ""}` : "";
      heading.textContent = `${problem.name || "Error"}${location}`;
      const message = document.createElement("div");
      message.textContent = problem.message || String(problem);
      card.append(heading, message);
      card.addEventListener("click", () => revealProblem(problem));
      card.addEventListener("keydown", event => {
        if (event.key === "Enter") revealProblem(problem);
      });
      elements.problemsOutput.append(card);
    }
  }

  elements.logCount.textContent = String(state.logs.length);
  elements.problemCount.textContent = String(state.problems.length);
}

function clearDiagnostics() {
  state.logs = [];
  state.problems = [];
  renderConsole();
  clearMarkers();
}

function revealProblem(problem) {
  if (!problem.line) return;
  if (state.monacoEditor) {
    state.monacoEditor.setPosition({ lineNumber: problem.line, column: problem.column || 1 });
    state.monacoEditor.revealLineInCenter(problem.line);
    state.monacoEditor.focus();
    return;
  }

  const lines = elements.source.value.split("\n");
  const offset = lines.slice(0, Math.max(0, problem.line - 1)).reduce((sum, line) => sum + line.length + 1, 0);
  const position = offset + Math.max(0, (problem.column || 1) - 1);
  elements.source.focus();
  elements.source.setSelectionRange(position, position);
  updateCursorPosition();
}

function setMarkers(problems) {
  if (!state.monacoModel || !window.monaco) return;
  window.monaco.editor.setModelMarkers(state.monacoModel, "diagrammer", problems.map(problem => ({
    startLineNumber: problem.line || 1,
    endLineNumber: problem.line || 1,
    startColumn: problem.column || 1,
    endColumn: (problem.column || 1) + 1,
    message: problem.message || "Diagram error",
    severity: window.monaco.MarkerSeverity.Error,
    source: "Math Diagrammer",
  })));
}

function clearMarkers() {
  if (state.monacoModel && window.monaco) {
    window.monaco.editor.setModelMarkers(state.monacoModel, "diagrammer", []);
  }
}

function switchConsoleTab(tab) {
  document.querySelectorAll(".console-tab").forEach(button => {
    const active = button.dataset.tab === tab;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  elements.consoleOutput.hidden = tab !== "console";
  elements.problemsOutput.hidden = tab !== "problems";
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const chunks = [];
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    chunks.push(String.fromCharCode(...bytes.subarray(offset, offset + chunkSize)));
  }
  return btoa(chunks.join(""));
}

function loadCoFoFontData() {
  if (!cofoFontDataPromise) {
    cofoFontDataPromise = fetch(COFO_FONT_URL).then(async response => {
      if (!response.ok) {
        throw new Error("CoFo Sans font asset could not be loaded.");
      }
      const base64 = arrayBufferToBase64(await response.arrayBuffer());
      return "data:font/otf;base64," + base64;
    });
  }
  return cofoFontDataPromise;
}

function embedCoFoFont(svgText, fontDataUrl) {
  if (svgText.includes("data-math-diagrammer-font")) return svgText;
  const style = `<style type="text/css" data-math-diagrammer-font="CoFo Sans"><![CDATA[@font-face{font-family:"CoFo Sans";src:url("${fontDataUrl}") format("opentype");font-style:normal;font-weight:400;}]]></style>`;
  if (/<defs\b[^>]*>/i.test(svgText)) {
    return svgText.replace(/<defs\b[^>]*>/i, match => match + style);
  }
  return svgText.replace(/<svg\b[^>]*>/i, match => match + "<defs>" + style + "</defs>");
}

async function exportSvg() {
  if (!state.svg) return;
  let svg;
  try {
    svg = embedCoFoFont(state.svg, await loadCoFoFontData());
  } catch (error) {
    toast(error.message || "Could not embed CoFo Sans in the SVG.", "error");
    return;
  }
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${state.currentExample || "math-diagram"}.svg`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("SVG exported", "success");
}

function copySource() {
  navigator.clipboard.writeText(getCode()).then(
    () => toast("Source copied", "success"),
    () => toast("Could not access the clipboard", "error")
  );
}

function selectExample(id, { force = false } = {}) {
  const example = getExample(id);
  if (!force && id === state.currentExample) return;
  state.currentExample = example.id;
  state.fitNextRender = true;
  elements.exampleSelect.value = example.id;
  setCode(example.code);
  persistSource();
  runSource();
}

function resetExample() {
  const example = getExample(state.currentExample);
  if (getCode() !== example.code && !window.confirm(`Reset “${example.title}” to its original source?`)) return;
  setCode(example.code);
  state.fitNextRender = true;
  persistSource();
  runSource();
  toast("Example reset", "success");
}

function updateCursorPosition() {
  if (state.monacoEditor) {
    const position = state.monacoEditor.getPosition();
    elements.cursorPosition.textContent = `Ln ${position.lineNumber}, Col ${position.column}`;
    return;
  }

  const before = elements.source.value.slice(0, elements.source.selectionStart);
  const lines = before.split("\n");
  elements.cursorPosition.textContent = `Ln ${lines.length}, Col ${lines.at(-1).length + 1}`;
}

function handleTextareaKeydown(event) {
  if (event.key === "Tab") {
    event.preventDefault();
    const start = elements.source.selectionStart;
    const end = elements.source.selectionEnd;
    elements.source.setRangeText("  ", start, end, "end");
    sourceChanged();
  }

  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    runSource();
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    exportSvg();
  }
}

function setView(next, { animate = false } = {}) {
  clearTimeout(state.viewAnimationTimer);
  elements.diagramLayer.classList.toggle("is-view-animating", animate);
  state.view = {
    scale: clamp(next.scale, 0.08, 12),
    x: next.x,
    y: next.y,
  };
  elements.diagramLayer.style.transform = `translate(${state.view.x}px, ${state.view.y}px) scale(${state.view.scale})`;
  elements.zoomLabel.textContent = `${Math.round(state.view.scale * 100)}%`;

  if (animate) {
    state.viewAnimationTimer = window.setTimeout(() => {
      elements.diagramLayer.classList.remove("is-view-animating");
    }, 240);
  }
}

function prepareSvgSize() {
  const svg = elements.diagramLayer.querySelector("svg");
  if (!svg) return null;
  const metrics = svgMetrics(svg);
  svg.style.width = `${metrics.width}px`;
  svg.style.height = `${metrics.height}px`;
  return metrics;
}

function fitDiagram({ animate = true } = {}) {
  const metrics = prepareSvgSize();
  if (!metrics) return;
  const canvas = elements.previewCanvas.getBoundingClientRect();
  const padding = 60;
  const scale = clamp(Math.min(
    (canvas.width - padding * 2) / metrics.width,
    (canvas.height - padding * 2) / metrics.height
  ), 0.08, 6);

  setView({
    scale,
    x: (canvas.width - metrics.width * scale) / 2,
    y: (canvas.height - metrics.height * scale) / 2,
  }, { animate });
  state.hasInitialFit = true;
  state.fitNextRender = false;
}

function zoomAt(factor, clientX, clientY, { animate = false } = {}) {
  if (!elements.diagramLayer.querySelector("svg")) return;
  const rect = elements.previewCanvas.getBoundingClientRect();
  const px = clientX == null ? rect.width / 2 : clientX - rect.left;
  const py = clientY == null ? rect.height / 2 : clientY - rect.top;
  const oldScale = state.view.scale;
  const scale = clamp(oldScale * factor, 0.08, 12);
  const localX = (px - state.view.x) / oldScale;
  const localY = (py - state.view.y) / oldScale;
  setView({ scale, x: px - localX * scale, y: py - localY * scale }, { animate });
}

function pointerDown(event) {
  if (event.button !== 0 || !elements.diagramLayer.querySelector("svg")) return;
  clearTimeout(state.viewAnimationTimer);
  elements.diagramLayer.classList.remove("is-view-animating");
  state.pointer = {
    id: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    viewX: state.view.x,
    viewY: state.view.y,
  };
  elements.previewCanvas.setPointerCapture(event.pointerId);
}

function pointerMove(event) {
  if (!state.pointer || event.pointerId !== state.pointer.id) return;
  setView({
    scale: state.view.scale,
    x: state.pointer.viewX + event.clientX - state.pointer.startX,
    y: state.pointer.viewY + event.clientY - state.pointer.startY,
  });
}

function pointerUp(event) {
  if (!state.pointer || event.pointerId !== state.pointer.id) return;
  state.pointer = null;
  elements.previewCanvas.releasePointerCapture(event.pointerId);
}

function setupResizer() {
  const saved = Number(localStorage.getItem(STORAGE.paneWidth));
  if (saved) setEditorPaneWidth(saved);

  const startResize = event => {
    event.preventDefault();
    elements.resizer.classList.add("is-dragging");
    const onMove = moveEvent => setEditorPaneWidth(moveEvent.clientX);
    const onUp = () => {
      elements.resizer.classList.remove("is-dragging");
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      state.monacoEditor?.layout();
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  };

  elements.resizer.addEventListener("pointerdown", startResize);
  elements.resizer.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const current = elements.resizer.getBoundingClientRect().left - elements.workspace.getBoundingClientRect().left;
    setEditorPaneWidth(current + (event.key === "ArrowRight" ? 20 : -20));
  });
}

function setEditorPaneWidth(clientX) {
  if (window.innerWidth <= 680) return;
  const rect = elements.workspace.getBoundingClientRect();
  const width = clamp(clientX - rect.left, 300, rect.width - 385);
  elements.workspace.style.gridTemplateColumns = `${width}px 5px minmax(380px, 1fr)`;
  localStorage.setItem(STORAGE.paneWidth, String(width));
}

function setupConsoleResizer() {
  let active = null;

  elements.consolePanel.addEventListener("pointerdown", event => {
    if (event.clientY - elements.consolePanel.getBoundingClientRect().top > 6) return;
    event.preventDefault();
    elements.consolePanel.classList.remove("is-collapsed");
    active = {
      startY: event.clientY,
      startHeight: elements.consolePanel.getBoundingClientRect().height,
    };
    elements.consolePanel.setPointerCapture(event.pointerId);
  });

  elements.consolePanel.addEventListener("pointermove", event => {
    if (!active) return;
    const available = elements.editorRegion.getBoundingClientRect().height + active.startHeight;
    const height = clamp(active.startHeight + active.startY - event.clientY, 70, Math.max(90, available - 150));
    elements.consolePanel.style.height = `${height}px`;
    state.monacoEditor?.layout();
  });

  const stop = event => {
    if (!active) return;
    active = null;
    if (elements.consolePanel.hasPointerCapture(event.pointerId)) {
      elements.consolePanel.releasePointerCapture(event.pointerId);
    }
  };
  elements.consolePanel.addEventListener("pointerup", stop);
  elements.consolePanel.addEventListener("pointercancel", stop);
}

function loadMonaco() {
  // The textarea is the complete offline editor. Monaco is a progressive enhancement.
  const loader = document.createElement("script");
  loader.src = "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/loader.js";
  loader.async = true;
  loader.addEventListener("load", () => {
    window.require.config({
      paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs" },
    });
    window.require(["vs/editor/editor.main"], initialiseMonaco, () => {});
  });
  loader.addEventListener("error", () => {});
  document.head.append(loader);
}

function initialiseMonaco() {
  if (!window.monaco || state.monacoEditor) return;
  const code = elements.source.value;
  defineMonacoThemes();

  state.monacoModel = window.monaco.editor.createModel(code, "javascript");
  state.monacoEditor = window.monaco.editor.create(elements.monaco, {
    model: state.monacoModel,
    theme: EDITOR_THEMES[state.editorTheme].monacoName,
    automaticLayout: true,
    minimap: { enabled: false },
    fontFamily: '"IBM Plex Mono", Consolas, "Liberation Mono", monospace',
    fontSize: 13,
    lineHeight: 22,
    padding: { top: 13, bottom: 26 },
    scrollBeyondLastLine: false,
    smoothScrolling: true,
    tabSize: 2,
    insertSpaces: true,
    renderWhitespace: "selection",
    bracketPairColorization: { enabled: true },
    guides: { bracketPairs: true, indentation: true },
    overviewRulerBorder: false,
    fixedOverflowWidgets: true,
  });

  state.monacoEditor.addCommand(window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.Enter, () => runSource());
  state.monacoEditor.addCommand(window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.KeyS, () => exportSvg());
  state.monacoEditor.onDidChangeModelContent(sourceChanged);
  state.monacoEditor.onDidChangeCursorPosition(updateCursorPosition);
  elements.source.style.display = "none";
  elements.monaco.style.display = "block";
  elements.monaco.setAttribute("aria-hidden", "false");
  elements.editorMode.textContent = "Monaco";
  setMarkers(state.problems);
  document.fonts?.ready.then(() => window.monaco?.editor.remeasureFonts?.());
}

function bindEvents() {
  elements.exampleSelect.addEventListener("change", event => selectExample(event.target.value));
  elements.resetButton.addEventListener("click", resetExample);
  elements.runButton.addEventListener("click", () => runSource());
  elements.emptyRunButton.addEventListener("click", () => runSource());
  elements.exportButton.addEventListener("click", exportSvg);
  elements.copyCodeButton.addEventListener("click", copySource);
  elements.editorThemeSelect.addEventListener("change", event => {
    applyEditorTheme(event.target.value);
  });
  elements.source.addEventListener("input", sourceChanged);
  elements.source.addEventListener("click", updateCursorPosition);
  elements.source.addEventListener("keyup", updateCursorPosition);
  elements.source.addEventListener("keydown", handleTextareaKeydown);

  document.querySelectorAll(".console-tab").forEach(button => {
    button.addEventListener("click", () => switchConsoleTab(button.dataset.tab));
  });
  elements.clearConsoleButton.addEventListener("click", clearDiagnostics);
  elements.collapseConsoleButton.addEventListener("click", () => {
    elements.consolePanel.classList.toggle("is-collapsed");
  });

  elements.gridButton.addEventListener("click", () => {
    const enabled = elements.previewCanvas.classList.toggle("has-grid");
    elements.gridButton.classList.toggle("is-active", enabled);
    elements.gridButton.setAttribute("aria-pressed", String(enabled));
  });
  elements.zoomOutButton.addEventListener("click", () => zoomAt(0.8, null, null, { animate: true }));
  elements.zoomInButton.addEventListener("click", () => zoomAt(1.25, null, null, { animate: true }));
  elements.zoomLabel.addEventListener("click", () => {
    const rect = elements.previewCanvas.getBoundingClientRect();
    zoomAt(1 / state.view.scale, rect.left + rect.width / 2, rect.top + rect.height / 2, { animate: true });
  });
  elements.fitButton.addEventListener("click", () => fitDiagram({ animate: true }));
  elements.previewCanvas.addEventListener("dblclick", () => fitDiagram({ animate: true }));
  elements.previewCanvas.addEventListener("wheel", event => {
    event.preventDefault();
    zoomAt(Math.exp(-event.deltaY * 0.0015), event.clientX, event.clientY);
  }, { passive: false });
  elements.previewCanvas.addEventListener("pointerdown", pointerDown);
  elements.previewCanvas.addEventListener("pointermove", pointerMove);
  elements.previewCanvas.addEventListener("pointerup", pointerUp);
  elements.previewCanvas.addEventListener("pointercancel", pointerUp);
}

function formatDuration(value) {
  if (!Number.isFinite(value)) return "—";
  return value < 1000 ? `${Math.round(value)} ms` : `${(value / 1000).toFixed(2)} s`;
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toast(message, type = "") {
  const node = document.createElement("div");
  node.className = `toast ${type}`;
  node.textContent = message;
  elements.toastRegion.append(node);
  window.setTimeout(() => node.remove(), 2400);
}

function initialise() {
  loadEditorTheme();
  populateExamples();
  loadInitialSource();
  bindEvents();
  setupResizer();
  setupConsoleResizer();
  renderConsole();
  loadMonaco();
  runSource({ quiet: true });
}

initialise();
