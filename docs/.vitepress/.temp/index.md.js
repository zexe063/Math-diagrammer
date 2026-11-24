import { resolveComponent, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"Math Diagrammer API","description":"Build precise mathematics diagrams from small, composable JavaScript values.","frontmatter":{"layout":"doc","title":"Math Diagrammer API","description":"Build precise mathematics diagrams from small, composable JavaScript values.","aside":false,"pageClass":"api-entry-page"},"headers":[],"relativePath":"index.md","filePath":"index.md","lastUpdated":null}');
const _sfc_main = { name: "index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_DiagramExample = resolveComponent("DiagramExample");
  _push(`<div${ssrRenderAttrs(_attrs)}><div class="api-intro"><p class="api-intro__eyebrow">JavaScript diagram API</p><h1>Math Diagrammer</h1><p class="api-intro__summary">Build precise mathematics diagrams from small, composable values. Start with a primitive, place it with geometry and layout, then render one portable SVG.</p><div class="api-intro__actions"><a class="api-action api-action--primary" href="./reference/primitives">Start with primitives</a><a class="api-action" href="./reference/">Browse the complete API</a></div></div><h2 id="start-with-the-api" tabindex="-1">Start with the API <a class="header-anchor" href="#start-with-the-api" aria-label="Permalink to &quot;Start with the API&quot;">​</a></h2><p>The reference is the learning path. Read it in order when you are new, or jump directly to a function when you know what you need.</p><div class="api-route-grid"><a href="./reference/primitives"><span class="api-route-grid__number">01</span><strong>Primitives</strong><span>Create circles, rectangles, paths, text, and mathematical notation.</span></a><a href="./reference/geometry-foundations"><span class="api-route-grid__number">02</span><strong>Geometry foundations</strong><span>Work with points, vectors, bounds, matrices, paths, and segments.</span></a><a href="./reference/diagram"><span class="api-route-grid__number">03</span><strong>Diagram methods</strong><span>Style, transform, clip, inspect, and reuse every diagram value.</span></a><a href="./reference/layout"><span class="api-route-grid__number">04</span><strong>Composition</strong><span>Arrange diagrams with stacks, rows, columns, grids, and alignment.</span></a></div><h2 id="the-core-pattern" tabindex="-1">The core pattern <a class="header-anchor" href="#the-core-pattern" aria-label="Permalink to &quot;The core pattern&quot;">​</a></h2><p>Every drawing helper returns a <code>Diagram</code>. Methods return new diagrams, so values stay reusable and composition remains predictable.</p>`);
  _push(ssrRenderComponent(_component_DiagramExample, { id: "primitive-composition" }, null, _parent));
  _push(`<h2 id="continue-by-task" tabindex="-1">Continue by task <a class="header-anchor" href="#continue-by-task" aria-label="Permalink to &quot;Continue by task&quot;">​</a></h2><div class="api-link-list"><a href="./reference/annotations"><strong>Annotations</strong><span>Arrows, connectors, labels, and ticks</span></a><a href="./reference/rendering"><strong>Rendering</strong><span>SVG output, downloads, colors, and constants</span></a><a href="./reference/plots"><strong>Plots</strong><span>Number lines, axes, functions, and scatter plots</span></a><a href="./reference/charts"><strong>Charts</strong><span>Fractions, bars, histograms, box plots, and pies</span></a><a href="./reference/math-diagrams"><strong>Math diagrams</strong><span>Sets, probability, triangles, spirals, and recursion</span></a><a href="./reference/cell-grid"><strong>Cell grid</strong><span>Addressable grids with semantic content and shading</span></a></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  index as default
};
