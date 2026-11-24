import { mathjax } from "mathjax-full/js/mathjax.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { SVG } from "mathjax-full/js/output/svg.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const input = new TeX({ packages: ["base", "ams", "newcommand", "autoload"] });
const output = new SVG({
  fontCache: "none",
  mtextFont: "CoFo Sans",
  merrorFont: "CoFo Sans",
});
const document = mathjax.document("", { InputJax: input, OutputJax: output });
const cache = new Map();

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function exDimension(value, fontSize) {
  const match = String(value ?? "").match(/^([\d.+-]+)(ex|em|px)?$/);
  if (!match) return 0;
  const amount = Number(match[1]);
  if (match[2] === "px") return amount;
  if (match[2] === "em") return amount * fontSize;
  return amount * fontSize * 0.5;
}

export function typesetMath(tex, options = {}) {
  const source = String(tex).replace(/^\$|\$$/g, "");
  const fontSize = Number(options.fontSize ?? 20);
  const key = `${fontSize}\u0000${source}`;
  if (cache.has(key)) return cache.get(key);

  let node;
  try {
    node = document.convert(source, { display: false });
  } catch {
    const width = Math.max(fontSize, source.length * fontSize * 0.58);
    const result = {
      source,
      body: `<text x="0" y="0" font-size="${fontSize}" dominant-baseline="middle">${escapeXml(source)}</text>`,
      width,
      height: fontSize * 1.25,
      viewBox: `0 0 ${Math.max(1, width)} ${Math.max(1, fontSize * 1.25)}`,
    };
    cache.set(key, result);
    return result;
  }

  const outer = adaptor.outerHTML(node);
  const svgMatch = outer.match(/<svg\b(?<attrs>[^>]*)>(?<body>[\s\S]*)<\/svg>/i);
  if (!svgMatch) throw new Error("MathJax did not produce SVG output.");
  const attrs = svgMatch.groups.attrs;
  const width = exDimension(attrs.match(/\bwidth="([^"]+)"/)?.[1], fontSize) || fontSize;
  const height = exDimension(attrs.match(/\bheight="([^"]+)"/)?.[1], fontSize) || fontSize * 1.25;
  const result = {
    source,
    body: svgMatch.groups.body,
    width,
    height,
    viewBox: attrs.match(/\bviewBox="([^"]+)"/)?.[1] ?? "0 -1000 1000 1250",
  };
  cache.set(key, result);
  return result;
}
