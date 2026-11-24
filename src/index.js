export * from "./core/geometry.js";
export { PathData, path as pathData } from "./core/path.js";
export * from "./core/diagram.js";
export * from "./core/primitives.js";
export * from "./core/layout.js";
export * from "./core/label-placement.js";
export * from "./core/annotations.js";
export * from "./geometry/constructions.js";
export * from "./core/renderer.js";
export * from "./math/index.js";
import { renderSvg } from "./core/renderer.js";

export const none = "none";
export const black = "#111827";
export const white = "#ffffff";
export const gray = "#64748b";
export const red = "#ef4444";
export const orange = "#f59e0b";
export const yellow = "#eab308";
export const green = "#22c55e";
export const blue = "#3b82f6";
export const indigo = "#6366f1";
export const violet = "#8b5cf6";
export const pink = "#ec4899";
export const cyan = "#06b6d4";
export const tau = Math.PI * 2;
export const degrees = (value) => value * Math.PI / 180;

export function draw(diagram, target, options = {}) {
  globalThis.__MATH_DIAGRAM_LAST__ = diagram;
  if (!target || typeof document === "undefined") return diagram;
  const element = typeof target === "string" ? document.querySelector(target) : target;
  if (!element) throw new Error("draw() could not find the target element.");
  element.innerHTML = renderSvg(diagram, options);
  return diagram;
}
