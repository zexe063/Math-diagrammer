const STYLE_DEFAULTS = Object.freeze({
  fill: "none",
  stroke: "#1f2937",
  strokeWidth: 2,
  opacity: 1,
  fillOpacity: 1,
  strokeOpacity: 1,
  dashArray: null,
  dashOffset: 0,
  lineCap: "round",
  lineJoin: "round",
  miterLimit: 4,
  fillRule: "nonzero",
  fontFamily: "\"CoFo Sans\", ui-sans-serif, system-ui, sans-serif",
  fontSize: 18,
  fontWeight: 500,
  fontStyle: "normal",
  textAnchor: "middle",
  dominantBaseline: "middle",
  color: "#111827",
});

export function style(overrides = {}) {
  return Object.freeze({ ...STYLE_DEFAULTS, ...overrides });
}

export function mergeStyle(base, overrides) {
  return Object.freeze({ ...base, ...overrides });
}

export { STYLE_DEFAULTS };
