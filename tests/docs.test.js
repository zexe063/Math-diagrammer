import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import * as engine from "../src/index.js";

const DOCS_ROOT = path.resolve("docs");
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

async function markdownFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory() && entry.name !== ".vitepress") return markdownFiles(target);
    return entry.isFile() && entry.name.endsWith(".md") ? [target] : [];
  }));
  return nested.flat();
}

function studioPrograms(markdown) {
  return [...markdown.matchAll(/```js\s*\r?\n([\s\S]*?)```/g)]
    .map(match => match[1].trim())
    .filter(source => /\bdraw\s*\(/.test(source));
}

test("every complete Studio program in the learning docs renders finite SVG", async () => {
  const files = (await markdownFiles(DOCS_ROOT))
    .filter(file => /[\\/](?:guide|examples)[\\/]/.test(file));
  const entries = Object.entries(engine).filter(([name]) => (
    /^[A-Za-z_$][\w$]*$/.test(name) && !["draw", "console", "default"].includes(name)
  ));
  let checked = 0;

  for (const file of files) {
    const markdown = await fs.readFile(file, "utf8");
    for (const source of studioPrograms(markdown)) {
      let diagram;
      const scope = Object.freeze({
        ...Object.fromEntries(entries),
        draw(value) { diagram = value; return value; },
        console: Object.freeze({ log() {}, info() {}, warn() {}, error() {} }),
      });
      const execute = new AsyncFunction("scope", `with (scope) {\n${source}\n}`);

      await execute(scope);
      assert.ok(diagram?.node, `${path.relative(DOCS_ROOT, file)} should draw a Diagram`);
      const svg = engine.renderSvg(diagram);
      assert.match(svg, /^<svg\b/);
      assert.doesNotMatch(svg, /NaN|Infinity|undefined/);
      checked += 1;
    }
  }

  assert.equal(checked, 56);
});

test("the API reference names every public root export", async () => {
  const files = (await markdownFiles(path.join(DOCS_ROOT, "reference")));
  const reference = (await Promise.all(files.map(file => fs.readFile(file, "utf8")))).join("\n");

  for (const name of Object.keys(engine)) {
    assert.match(reference, new RegExp(`\\b${name}\\b`), `missing public export ${name}`);
  }
});

test("documentation markdown links resolve to local pages", async () => {
  const files = await markdownFiles(DOCS_ROOT);

  for (const file of files) {
    const markdown = await fs.readFile(file, "utf8");
    const links = [...markdown.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1]);

    for (const href of links) {
      if (/^(?:https?:|#|mailto:)/.test(href)) continue;
      const clean = href.split("#", 1)[0].split("?", 1)[0];
      if (!clean || /\.(?:svg|png|jpg|jpeg|webp|gif)$/i.test(clean)) continue;

      let target = clean.startsWith("/")
        ? path.join(DOCS_ROOT, clean)
        : path.resolve(path.dirname(file), clean);
      if (target.endsWith(path.sep)) target = path.join(target, "index.md");
      else if (!path.extname(target)) target += ".md";

      await assert.doesNotReject(
        fs.access(target),
        `${path.relative(DOCS_ROOT, file)} has a broken link to ${href}`,
      );
    }
  }
});
