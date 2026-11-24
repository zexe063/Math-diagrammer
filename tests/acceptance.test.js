import test from "node:test";
import assert from "node:assert/strict";
import { gallery, gallerySVG } from "../examples/gallery.js";
import { renderSVG } from "../src/index.js";

test("all required acceptance diagrams produce standalone finite SVG", () => {
  for (const [name, diagram] of Object.entries(gallery)) {
    const svg = renderSVG(diagram, { padding: 20 });
    assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    assert.doesNotMatch(svg, /NaN|Infinity|undefined|<foreignObject|(?:href|src)=["']https?:\/\//);
    assert.ok(svg.length > 250, `${name} should contain meaningful geometry`);
  }
});

test("gallery sheet is deterministic", () => {
  assert.equal(gallerySVG(), gallerySVG());
});
