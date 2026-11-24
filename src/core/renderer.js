import { Matrix } from "./geometry.js";
import { mergeStyle } from "./style.js";

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function number(value) {
  if (!Number.isFinite(value)) return "0";
  return String(Math.round(value * 1e6) / 1e6);
}

function styleAttributes(style) {
  const attributes = {
    fill: style.fill,
    stroke: style.stroke,
    "stroke-width": style.strokeWidth,
    opacity: style.opacity,
    "fill-opacity": style.fillOpacity,
    "stroke-opacity": style.strokeOpacity,
    "stroke-linecap": style.lineCap,
    "stroke-linejoin": style.lineJoin,
    "stroke-miterlimit": style.miterLimit,
    "fill-rule": style.fillRule,
  };
  if (style.dashArray?.length) attributes["stroke-dasharray"] = style.dashArray.join(" ");
  if (style.dashOffset) attributes["stroke-dashoffset"] = style.dashOffset;
  return Object.entries(attributes)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}="${escapeXml(value)}"`)
    .join(" ");
}

class SVGRenderer {
  constructor(options = {}) {
    this.options = options;
    this.defs = [];
    this.nextId = 1;
  }

  render(diagram) {
    const padding = Number(this.options.padding ?? 24);
    const bounds = diagram.bounds.isEmpty
      ? { minX: 0, minY: 0, width: 100, height: 100 }
      : diagram.bounds;
    const minX = bounds.minX - padding;
    const minY = bounds.minY - padding;
    const width = Math.max(1, bounds.width + padding * 2);
    const height = Math.max(1, bounds.height + padding * 2);
    const body = this.renderDiagram(diagram, { forcedStyle: null });
    const defs = this.defs.length ? `<defs>${this.defs.join("")}</defs>` : "";
    const background = this.options.background
      ? `<rect x="${number(minX)}" y="${number(minY)}" width="${number(width)}" height="${number(height)}" fill="${escapeXml(this.options.background)}"/>`
      : "";
    const widthAttribute = this.options.width === undefined ? "100%" : escapeXml(this.options.width);
    const heightAttribute = this.options.height === undefined ? "100%" : escapeXml(this.options.height);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${number(minX)} ${number(minY)} ${number(width)} ${number(height)}" width="${widthAttribute}" height="${heightAttribute}" role="img" aria-label="${escapeXml(this.options.ariaLabel ?? "Mathematics diagram")}" stroke-linecap="round" stroke-linejoin="round">${defs}${background}${body}</svg>`;
  }

  renderDiagram(diagram, context) {
    const node = diagram.node;
    switch (node.type) {
      case "empty": return "";
      case "style": {
        const forcedStyle = context.forcedStyle
          ? mergeStyle(node.style, context.forcedStyle)
          : node.style;
        return this.renderDiagram(node.diagram, { ...context, forcedStyle });
      }
      case "bounds": return this.renderDiagram(node.diagram, context);
      case "transform": {
        const content = this.renderDiagram(node.diagram, context);
        return `<g transform="${node.matrix.toSVG()}">${content}</g>`;
      }
      case "group": return node.diagrams.map((child) => this.renderDiagram(child, context)).join("");
      case "clip": {
        const id = `md-clip-${this.nextId++}`;
        const mask = this.renderDiagram(node.mask, { forcedStyle: {
          ...node.mask.styleValue,
          fill: "#fff",
          stroke: "none",
          strokeWidth: 0,
        } });
        this.defs.push(`<clipPath id="${id}">${mask}</clipPath>`);
        return `<g clip-path="url(#${id})">${this.renderDiagram(node.diagram, context)}</g>`;
      }
      default: return this.renderPrimitive(diagram, context.forcedStyle ?? diagram.styleValue);
    }
  }

  renderPrimitive(diagram, style) {
    const node = diagram.node;
    const attributes = styleAttributes(style);
    switch (node.type) {
      case "path": return `<path d="${escapeXml(node.path.toSVGPath())}" ${attributes}/>`;
      case "rect": return `<rect x="${number(node.x)}" y="${number(node.y)}" width="${number(node.width)}" height="${number(node.height)}" rx="${number(node.radius)}" ry="${number(node.radius)}" ${attributes}/>`;
      case "ellipse": return `<ellipse cx="${number(node.cx)}" cy="${number(node.cy)}" rx="${number(node.rx)}" ry="${number(node.ry)}" ${attributes}/>`;
      case "text": {
        const textColor = style.fill && style.fill !== "none" ? style.fill : style.color;
        const fontAttributes = [
          `font-family="${escapeXml(style.fontFamily)}"`,
          `font-size="${number(style.fontSize ?? node.size)}"`,
          `font-weight="${escapeXml(style.fontWeight)}"`,
          `font-style="${escapeXml(style.fontStyle)}"`,
          `text-anchor="${escapeXml(style.textAnchor)}"`,
          `dominant-baseline="${escapeXml(style.dominantBaseline)}"`,
          `fill="${escapeXml(textColor ?? "#111827")}"`,
          `opacity="${number(style.opacity)}"`,
        ].join(" ");
        const value = node.value.startsWith("$") && node.value.endsWith("$")
          ? node.value.slice(1, -1)
          : node.value;
        return `<text x="0" y="0" ${fontAttributes}>${escapeXml(value)}</text>`;
      }
      case "math": {
        const mathColor = style.fill && style.fill !== "none" ? style.fill : style.color;
        const body = node.body.replaceAll("currentColor", escapeXml(mathColor ?? "#111827"));
        return `<g color="${escapeXml(mathColor ?? "#111827")}" opacity="${number(style.opacity)}" transform="translate(${number(-node.width / 2)} ${number(-node.height / 2)})"><svg xmlns="http://www.w3.org/2000/svg" width="${number(node.width)}" height="${number(node.height)}" viewBox="${escapeXml(node.viewBox)}" role="img" aria-label="${escapeXml(node.source)}">${body}</svg></g>`;
      }
      default: return "";
    }
  }
}

export function renderSvg(diagram, options = {}) {
  if (!diagram?.node || !diagram?.bounds) throw new TypeError("renderSvg() expects a Diagram.");
  return new SVGRenderer(options).render(diagram);
}

export const renderSVG = renderSvg;
export const toSVG = renderSvg;

export function svgDataUri(diagram, options = {}) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(renderSvg(diagram, options))}`;
}

export function downloadSvg(diagram, filename = "diagram.svg", options = {}) {
  if (typeof document === "undefined") throw new Error("downloadSvg() requires a browser.");
  const blob = new Blob([renderSvg(diagram, options)], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
