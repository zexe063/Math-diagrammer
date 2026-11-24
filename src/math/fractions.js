import {
  DEFAULT_PALETTE,
  group,
  integer,
  makeCircle,
  makeRectangle,
  makeSector,
  positiveNumber,
} from "./internal.js";

function fractionArguments(numerator, denominator, options) {
  if (numerator && typeof numerator === "object") {
    return {
      numerator: integer(numerator.numerator, 1, 0),
      denominator: integer(numerator.denominator, 2, 1),
      options: numerator,
    };
  }
  return {
    numerator: integer(numerator, 1, 0),
    denominator: integer(denominator, 2, 1),
    options: options ?? {},
  };
}

export function fractionBar(numerator = 1, denominator = 2, options = {}) {
  ({ numerator, denominator, options } = fractionArguments(numerator, denominator, options));
  const {
    width = 320,
    height = 56,
    gap = 14,
    fill = "#3b82f6",
    emptyFill = "#f8fafc",
    stroke = "#1f2937",
    strokeWidth = 2,
    columns,
  } = options;
  const wholeCount = Math.max(1, Math.ceil(numerator / denominator));
  const columnCount = integer(columns, wholeCount, 1);
  const rowCount = Math.ceil(wholeCount / columnCount);
  const unitWidth = positiveNumber(width, 320);
  const unitHeight = positiveNumber(height, 56);
  const diagrams = [];
  let colored = numerator;

  for (let whole = 0; whole < wholeCount; whole += 1) {
    const column = whole % columnCount;
    const row = Math.floor(whole / columnCount);
    const originX = (column - (Math.min(wholeCount, columnCount) - 1) / 2) * (unitWidth + gap);
    const originY = (row - (rowCount - 1) / 2) * (unitHeight + gap);
    const cellWidth = unitWidth / denominator;
    for (let index = 0; index < denominator; index += 1) {
      const selected = colored > 0;
      diagrams.push(makeRectangle(
        cellWidth,
        unitHeight,
        originX - unitWidth / 2 + cellWidth * (index + 0.5),
        originY,
        { fill: selected ? fill : emptyFill, stroke, strokeWidth },
      ));
      colored -= 1;
    }
  }
  return group(diagrams);
}

function fractionCircleUnit(selected, denominator, centerX, options) {
  const {
    radius = 72,
    fill = "#3b82f6",
    emptyFill = "#f8fafc",
    stroke = "#1f2937",
    strokeWidth = 2,
    palette = null,
    startAngle = -Math.PI / 2,
  } = options;
  const diagrams = [];
  const sweep = Math.PI * 2 / denominator;
  for (let index = 0; index < denominator; index += 1) {
    const sliceFill = index < selected
      ? (palette?.[index % palette.length] ?? fill)
      : emptyFill;
    diagrams.push(denominator === 1
      ? makeCircle(radius, centerX, 0, { fill: sliceFill, stroke, strokeWidth })
      : makeSector(
        radius,
        startAngle + index * sweep,
        startAngle + (index + 1) * sweep,
        centerX,
        0,
        { fill: sliceFill, stroke, strokeWidth },
      ));
  }
  return diagrams;
}

export function fractionCircle(numerator = 1, denominator = 2, options = {}) {
  ({ numerator, denominator, options } = fractionArguments(numerator, denominator, options));
  const radius = positiveNumber(options.radius, 72);
  const gap = positiveNumber(options.gap, 24);
  const wholeCount = Math.max(1, Math.ceil(numerator / denominator));
  const diagrams = [];
  for (let whole = 0; whole < wholeCount; whole += 1) {
    const selected = Math.max(0, Math.min(denominator, numerator - whole * denominator));
    const x = (whole - (wholeCount - 1) / 2) * (radius * 2 + gap);
    diagrams.push(fractionCircleUnit(selected, denominator, x, options));
  }
  return group(diagrams);
}

export function fractionPie(numerator = 1, denominator = 2, options = {}) {
  return fractionCircle(numerator, denominator, {
    ...options,
    palette: options.palette ?? DEFAULT_PALETTE,
  });
}
