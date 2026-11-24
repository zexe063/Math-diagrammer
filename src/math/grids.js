import { point } from "../core/geometry.js";
import { line, polygon, rectangle, roundedRect } from "../core/primitives.js";
import { stack } from "../core/layout.js";

const CORNER_ALIASES = Object.freeze({
  nw: "nw",
  northwest: "nw",
  "north-west": "nw",
  topleft: "nw",
  "top-left": "nw",
  ne: "ne",
  northeast: "ne",
  "north-east": "ne",
  topright: "ne",
  "top-right": "ne",
  se: "se",
  southeast: "se",
  "south-east": "se",
  bottomright: "se",
  "bottom-right": "se",
  sw: "sw",
  southwest: "sw",
  "south-west": "sw",
  bottomleft: "sw",
  "bottom-left": "sw",
});

const SIDE_ALIASES = Object.freeze({
  n: "top",
  north: "top",
  top: "top",
  e: "right",
  east: "right",
  right: "right",
  s: "bottom",
  south: "bottom",
  bottom: "bottom",
  w: "left",
  west: "left",
  left: "left",
});

function positiveInteger(value, name) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) {
    throw new RangeError(name + " must be a positive integer.");
  }
  return number;
}

function positiveNumber(value, fallback, name) {
  const number = value == null ? fallback : Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    throw new RangeError(name + " must be a positive number.");
  }
  return number;
}

function nonNegativeNumber(value, fallback, name) {
  const number = value == null ? fallback : Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw new RangeError(name + " must be a non-negative number.");
  }
  return number;
}

function normalizeCorner(value) {
  const key = String(value ?? "").toLowerCase().replaceAll("_", "-").replaceAll(" ", "-");
  const compact = key.replaceAll("-", "");
  const corner = CORNER_ALIASES[key] ?? CORNER_ALIASES[compact];
  if (!corner) {
    throw new RangeError("Triangle corner must be nw, ne, se, or sw.");
  }
  return corner;
}

function normalizeSide(value) {
  const side = SIDE_ALIASES[String(value ?? "").toLowerCase()];
  if (!side) throw new RangeError("Cell side must be top, right, bottom, or left.");
  return side;
}

function normalizeDirection(value) {
  if (value == null || value === false || value === "") return null;
  if (value === "/" || value === "rising") return "/";
  if (value === "\\" || value === "falling") return "\\";
  throw new RangeError('Cell diagonals must use "/", "\\\\", "rising", "falling", or null.');
}

function normalizeDiagonalMatrix(value) {
  if (value == null || typeof value === "function") return value;
  if (!Array.isArray(value) || !value.length) {
    throw new TypeError("cellGrid diagonals must be a non-empty rectangular matrix or a function.");
  }
  if (!value.every(Array.isArray)) {
    throw new TypeError("cellGrid diagonals must be a matrix of rows.");
  }
  const columns = value[0].length;
  if (!columns || value.some((row) => row.length !== columns)) {
    throw new RangeError("cellGrid diagonals must be a non-empty rectangular matrix.");
  }
  return value.map((row) => row.map(normalizeDirection));
}

function inferDimensions(options, diagonals) {
  const matrixRows = Array.isArray(diagonals) ? diagonals.length : null;
  const matrixColumns = Array.isArray(diagonals) ? diagonals[0].length : null;
  const rows = options.rows == null ? matrixRows : positiveInteger(options.rows, "cellGrid rows");
  const columnsValue = options.columns ?? options.cols;
  const columns = columnsValue == null
    ? matrixColumns
    : positiveInteger(columnsValue, "cellGrid columns");

  if (rows == null || columns == null) {
    throw new TypeError("cellGrid requires rows and columns when diagonals do not define them.");
  }
  if (matrixRows != null && (rows !== matrixRows || columns !== matrixColumns)) {
    throw new RangeError("cellGrid rows and columns must match the diagonals matrix.");
  }
  return { rows, columns };
}

function assertCellAddress(column, row, columns, rows) {
  if (!Number.isInteger(column) || !Number.isInteger(row)) {
    throw new TypeError("Cell addresses must use integer column and row values.");
  }
  if (column < 0 || column >= columns || row < 0 || row >= rows) {
    throw new RangeError(
      "Cell [" + column + ", " + row + "] is outside a "
      + columns + "-column by " + rows + "-row grid.",
    );
  }
}

function assertVertexAddress(column, row, columns, rows) {
  if (!Number.isInteger(column) || !Number.isInteger(row)) {
    throw new TypeError("Grid vertices must use integer column and row values.");
  }
  if (column < 0 || column > columns || row < 0 || row > rows) {
    throw new RangeError(
      "Grid vertex [" + column + ", " + row + "] is outside the grid.",
    );
  }
}

function createGridGeometry(columns, rows, cellWidth, cellHeight) {
  const width = columns * cellWidth;
  const height = rows * cellHeight;
  const minimumX = -width / 2;
  const minimumY = -height / 2;

  function vertex(column, row) {
    assertVertexAddress(column, row, columns, rows);
    return point(minimumX + column * cellWidth, minimumY + row * cellHeight);
  }

  function cell(column, row) {
    assertCellAddress(column, row, columns, rows);
    const corners = Object.freeze({
      nw: vertex(column, row),
      ne: vertex(column + 1, row),
      se: vertex(column + 1, row + 1),
      sw: vertex(column, row + 1),
    });
    const center = point(
      (corners.nw.x + corners.se.x) / 2,
      (corners.nw.y + corners.se.y) / 2,
    );

    function corner(name) {
      return corners[normalizeCorner(name)];
    }

    function triangle(name) {
      const normalized = normalizeCorner(name);
      const points = {
        nw: [corners.nw, corners.ne, corners.sw],
        ne: [corners.nw, corners.ne, corners.se],
        se: [corners.ne, corners.se, corners.sw],
        sw: [corners.nw, corners.se, corners.sw],
      };
      return Object.freeze(points[normalized]);
    }

    function diagonal(direction) {
      const normalized = normalizeDirection(direction);
      if (!normalized) throw new RangeError("A cell diagonal needs a direction.");
      return normalized === "\\"
        ? Object.freeze([corners.nw, corners.se])
        : Object.freeze([corners.ne, corners.sw]);
    }

    function edge(side) {
      const normalized = normalizeSide(side);
      const points = {
        top: [corners.nw, corners.ne],
        right: [corners.ne, corners.se],
        bottom: [corners.sw, corners.se],
        left: [corners.nw, corners.sw],
      };
      return Object.freeze(points[normalized]);
    }

    function place(diagram, sourceAnchor = "center") {
      if (!diagram?.node || !diagram?.bounds || typeof diagram.anchor !== "function") {
        throw new TypeError("cell.place() expects a Diagram.");
      }
      const anchor = diagram.anchor(sourceAnchor);
      return diagram.translate(center.x - anchor.x, center.y - anchor.y);
    }

    return Object.freeze({
      column,
      row,
      width: cellWidth,
      height: cellHeight,
      center,
      corners,
      corner,
      triangle,
      diagonal,
      edge,
      place,
    });
  }

  return Object.freeze({
    rows,
    columns,
    width,
    height,
    cellWidth,
    cellHeight,
    vertex,
    point: vertex,
    center(column, row) {
      return cell(column, row).center;
    },
    corners(column, row) {
      return cell(column, row).corners;
    },
    cell,
    place(column, row, diagram, sourceAnchor = "center") {
      return cell(column, row).place(diagram, sourceAnchor);
    },
  });
}

function paintOptions(value, defaultFill) {
  if (typeof value === "string") return { fill: value, opacity: 1 };
  const opacity = value?.opacity == null ? 1 : Number(value.opacity);
  if (!Number.isFinite(opacity) || opacity < 0 || opacity > 1) {
    throw new RangeError("Grid fill opacity must be between 0 and 1.");
  }
  return {
    fill: value?.fill ?? value?.color ?? defaultFill,
    opacity,
  };
}

function normalizeShadedCells(value, geometry, defaultFill) {
  if (value == null) return [];
  let entries = value;
  if (typeof value === "number") {
    if (!Number.isInteger(value) || value < 0 || value > geometry.rows * geometry.columns) {
      throw new RangeError("Numeric shadedCells must be between 0 and the number of grid cells.");
    }
    entries = Array.from({ length: value }, (_, index) => [
      index % geometry.columns,
      Math.floor(index / geometry.columns),
    ]);
  } else if (typeof value === "function") {
    entries = [];
    for (let row = 0; row < geometry.rows; row += 1) {
      for (let column = 0; column < geometry.columns; column += 1) {
        const result = value(geometry.cell(column, row));
        if (result) entries.push(
          typeof result === "string"
            ? [column, row, result]
            : { column, row, ...(result === true ? {} : result) },
        );
      }
    }
  }
  if (!Array.isArray(entries)) {
    throw new TypeError("shadedCells must be a count, predicate, or cell-address array.");
  }

  return entries.map((entry) => {
    const column = Array.isArray(entry) ? entry[0] : entry?.column;
    const row = Array.isArray(entry) ? entry[1] : entry?.row;
    assertCellAddress(column, row, geometry.columns, geometry.rows);
    const style = paintOptions(
      Array.isArray(entry)
        ? (entry.length > 2 ? entry[2] : null)
        : entry,
      defaultFill,
    );
    return { column, row, ...style };
  });
}

function normalizeShadedTriangles(value, geometry, defaultFill) {
  if (value == null) return [];
  if (!Array.isArray(value)) {
    throw new TypeError("shadedTriangles must be an array of [column, row, corner] entries.");
  }
  return value.map((entry) => {
    const column = Array.isArray(entry) ? entry[0] : entry?.column;
    const row = Array.isArray(entry) ? entry[1] : entry?.row;
    const corner = normalizeCorner(Array.isArray(entry) ? entry[2] : entry?.corner);
    assertCellAddress(column, row, geometry.columns, geometry.rows);
    const style = paintOptions(
      Array.isArray(entry)
        ? (entry.length > 3 ? entry[3] : null)
        : entry,
      defaultFill,
    );
    return { column, row, corner, ...style };
  });
}

function flattenContent(value) {
  if (value == null) return [];
  const items = Array.isArray(value) ? value.flat(Infinity).filter(Boolean) : [value];
  for (const item of items) {
    if (!item?.node || !item?.bounds) {
      throw new TypeError("cellGrid content() must return Diagram values.");
    }
  }
  return items;
}

export function cellGrid(options = {}) {
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    throw new TypeError("cellGrid expects an options object.");
  }

  const diagonals = normalizeDiagonalMatrix(options.diagonals);
  const { rows, columns } = inferDimensions(options, diagonals);
  const sharedCellSize = options.cellSize;
  const cellWidth = positiveNumber(options.cellWidth ?? sharedCellSize, 56, "cellGrid cellWidth");
  const cellHeight = positiveNumber(options.cellHeight ?? sharedCellSize, 56, "cellGrid cellHeight");
  const geometry = createGridGeometry(columns, rows, cellWidth, cellHeight);

  const background = options.background ?? options.fill ?? "#ffffff";
  const highlightFill = options.highlightFill ?? options.accent ?? "#a97aee";
  const stroke = options.stroke ?? "#171717";
  const strokeWidth = nonNegativeNumber(options.strokeWidth, 2, "cellGrid strokeWidth");
  const gridStroke = options.gridStroke ?? stroke;
  const gridWidth = nonNegativeNumber(options.gridWidth, strokeWidth, "cellGrid gridWidth");
  const diagonalStroke = options.diagonalStroke ?? stroke;
  const diagonalWidth = nonNegativeNumber(options.diagonalWidth, strokeWidth, "cellGrid diagonalWidth");
  const borderStroke = options.borderStroke ?? stroke;
  const borderWidth = nonNegativeNumber(
    options.borderWidth,
    Math.max(3, strokeWidth),
    "cellGrid borderWidth",
  );
  const borderRadius = nonNegativeNumber(options.borderRadius, 0, "cellGrid borderRadius");

  const backgroundShape = (borderRadius > 0
    ? roundedRect(geometry.width, geometry.height, borderRadius)
    : rectangle(geometry.width, geometry.height))
    .fill(background)
    .stroke("none", 0);

  const shadedCells = normalizeShadedCells(options.shadedCells, geometry, highlightFill)
    .map(({ column, row, fill, opacity }) => (
      rectangle(cellWidth, cellHeight)
        .fill(fill)
        .stroke("none", 0)
        .opacity(opacity)
        .translate(geometry.center(column, row))
    ));

  const shadedTriangles = normalizeShadedTriangles(
    options.shadedTriangles,
    geometry,
    highlightFill,
  ).map(({ column, row, corner, fill, opacity }) => (
    polygon(geometry.cell(column, row).triangle(corner))
      .fill(fill)
      .stroke("none", 0)
      .opacity(opacity)
  ));

  const gridLines = [];
  if (options.gridLines !== false && gridWidth > 0) {
    for (let column = 1; column < columns; column += 1) {
      gridLines.push(
        line(geometry.vertex(column, 0), geometry.vertex(column, rows))
          .stroke(gridStroke, gridWidth),
      );
    }
    for (let row = 1; row < rows; row += 1) {
      gridLines.push(
        line(geometry.vertex(0, row), geometry.vertex(columns, row))
          .stroke(gridStroke, gridWidth),
      );
    }
  }

  const diagonalLines = [];
  if (diagonals && diagonalWidth > 0) {
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const direction = typeof diagonals === "function"
          ? normalizeDirection(diagonals(geometry.cell(column, row)))
          : diagonals[row][column];
        if (!direction) continue;
        const [from, to] = geometry.cell(column, row).diagonal(direction);
        diagonalLines.push(line(from, to).stroke(diagonalStroke, diagonalWidth));
      }
    }
  }

  const content = typeof options.content === "function"
    ? flattenContent(options.content(geometry))
    : flattenContent(options.content);

  const mask = (borderRadius > 0
    ? roundedRect(geometry.width, geometry.height, borderRadius)
    : rectangle(geometry.width, geometry.height))
    .fill("#ffffff")
    .stroke("none", 0);

  let builtInLayers = stack([
    backgroundShape,
    ...shadedCells,
    ...shadedTriangles,
    ...gridLines,
    ...diagonalLines,
  ]);
  if (borderRadius > 0) builtInLayers = builtInLayers.clip(mask);

  let contentLayers = stack(content);
  const shouldClipContent = options.clipContent === true
    || (borderRadius > 0 && options.clipContent !== false);
  if (content.length && shouldClipContent) {
    contentLayers = contentLayers.clip(mask);
  }

  const interior = stack([builtInLayers, contentLayers]);
  if (options.border === false || borderWidth === 0) return interior;
  const border = (borderRadius > 0
    ? roundedRect(geometry.width, geometry.height, borderRadius)
    : rectangle(geometry.width, geometry.height))
    .fill("none")
    .stroke(borderStroke, borderWidth);
  return stack([interior, border]);
}
