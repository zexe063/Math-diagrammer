import { EPSILON } from './numeric.js';
import { Point } from './point.js';
import { LineSegment } from './segments.js';

function segmentLike(value) {
  return value && typeof value === 'object' && 'start' in value && 'end' in value;
}

function tolerance(value) {
  const result = Number(value);
  return Number.isFinite(result) && result >= 0 ? result : EPSILON;
}

function resolveTwoLines(firstStart, firstEnd, secondStart, secondEnd, epsilon) {
  if (segmentLike(firstStart) && segmentLike(firstEnd)) {
    return {
      firstStart: Point.from(firstStart.start),
      firstEnd: Point.from(firstStart.end),
      secondStart: Point.from(firstEnd.start),
      secondEnd: Point.from(firstEnd.end),
      epsilon: tolerance(secondStart ?? EPSILON),
    };
  }

  return {
    firstStart: Point.from(firstStart),
    firstEnd: Point.from(firstEnd),
    secondStart: Point.from(secondStart),
    secondEnd: Point.from(secondEnd),
    epsilon: tolerance(epsilon),
  };
}

function resolveLine(startOrSegment, endOrOptions, maybeOptions) {
  if (segmentLike(startOrSegment)) {
    return {
      start: Point.from(startOrSegment.start),
      end: Point.from(startOrSegment.end),
      options: endOrOptions ?? {},
    };
  }

  return {
    start: Point.from(startOrSegment),
    end: Point.from(endOrOptions),
    options: maybeOptions ?? {},
  };
}

function crossTolerance(first, second, epsilon) {
  return epsilon * Math.max(1, first.magnitude() * second.magnitude());
}

function pointOnSegment(value, start, end, epsilon) {
  const direction = end.subtract(start);
  const offset = value.subtract(start);
  if (Math.abs(direction.cross(offset)) > crossTolerance(direction, offset, epsilon)) return false;
  const dot = offset.dot(direction);
  return dot >= -epsilon && dot <= direction.magnitudeSquared() + epsilon;
}

/** Returns the unique intersection of two infinite lines, or null for parallel/coincident lines. */
export function lineIntersection(firstStart, firstEnd, secondStart, secondEnd, epsilon = EPSILON) {
  const values = resolveTwoLines(firstStart, firstEnd, secondStart, secondEnd, epsilon);
  const firstDirection = values.firstEnd.subtract(values.firstStart);
  const secondDirection = values.secondEnd.subtract(values.secondStart);
  if (firstDirection.isZero(values.epsilon) || secondDirection.isZero(values.epsilon)) return null;

  const denominator = firstDirection.cross(secondDirection);
  if (Math.abs(denominator) <= crossTolerance(firstDirection, secondDirection, values.epsilon)) return null;

  const offset = values.secondStart.subtract(values.firstStart);
  const parameter = offset.cross(secondDirection) / denominator;
  return values.firstStart.add(firstDirection.scale(parameter));
}

/** Returns a unique segment intersection. Collinear overlap returns null because it is not one point. */
export function segmentIntersection(firstStart, firstEnd, secondStart, secondEnd, epsilon = EPSILON) {
  const values = resolveTwoLines(firstStart, firstEnd, secondStart, secondEnd, epsilon);
  const firstDirection = values.firstEnd.subtract(values.firstStart);
  const secondDirection = values.secondEnd.subtract(values.secondStart);
  const firstIsPoint = firstDirection.isZero(values.epsilon);
  const secondIsPoint = secondDirection.isZero(values.epsilon);

  if (firstIsPoint && secondIsPoint) {
    return values.firstStart.equals(values.secondStart, values.epsilon) ? values.firstStart : null;
  }
  if (firstIsPoint) {
    return pointOnSegment(values.firstStart, values.secondStart, values.secondEnd, values.epsilon)
      ? values.firstStart
      : null;
  }
  if (secondIsPoint) {
    return pointOnSegment(values.secondStart, values.firstStart, values.firstEnd, values.epsilon)
      ? values.secondStart
      : null;
  }

  const denominator = firstDirection.cross(secondDirection);
  const offset = values.secondStart.subtract(values.firstStart);
  const parallel = Math.abs(denominator) <= crossTolerance(firstDirection, secondDirection, values.epsilon);
  if (parallel) {
    if (Math.abs(offset.cross(firstDirection)) > crossTolerance(offset, firstDirection, values.epsilon)) return null;

    const lengthSquared = firstDirection.magnitudeSquared();
    const firstParameter = offset.dot(firstDirection) / lengthSquared;
    const secondParameter = values.secondEnd.subtract(values.firstStart).dot(firstDirection) / lengthSquared;
    const overlapStart = Math.max(0, Math.min(firstParameter, secondParameter));
    const overlapEnd = Math.min(1, Math.max(firstParameter, secondParameter));
    if (overlapEnd < overlapStart - values.epsilon) return null;
    if (Math.abs(overlapEnd - overlapStart) <= values.epsilon) {
      return values.firstStart.add(firstDirection.scale((overlapStart + overlapEnd) / 2));
    }
    return null;
  }

  const firstParameter = offset.cross(secondDirection) / denominator;
  const secondParameter = offset.cross(firstDirection) / denominator;
  if (firstParameter < -values.epsilon || firstParameter > 1 + values.epsilon
    || secondParameter < -values.epsilon || secondParameter > 1 + values.epsilon) return null;

  return values.firstStart.add(firstDirection.scale(Math.max(0, Math.min(1, firstParameter))));
}

/** Projects a point onto an infinite line. Set { clamp: true } to stay on the segment. */
export function projectPoint(value, startOrSegment, endOrOptions, maybeOptions) {
  const point = Point.from(value);
  const { start, end, options } = resolveLine(startOrSegment, endOrOptions, maybeOptions);
  const direction = end.subtract(start);
  const lengthSquared = direction.magnitudeSquared();
  if (lengthSquared <= EPSILON * EPSILON) {
    throw new RangeError('projectPoint() needs two distinct line points.');
  }

  let parameter = point.subtract(start).dot(direction) / lengthSquared;
  if (options.clamp) parameter = Math.max(0, Math.min(1, parameter));
  return start.add(direction.scale(parameter));
}

export const projectPointToLine = projectPoint;

export function projectPointToSegment(value, startOrSegment, end) {
  if (segmentLike(startOrSegment)) return projectPoint(value, startOrSegment, { clamp: true });
  return projectPoint(value, startOrSegment, end, { clamp: true });
}

function lineThrough(value, startOrSegment, endOrOptions, maybeOptions, perpendicular) {
  const through = Point.from(value);
  const { start, end, options } = resolveLine(startOrSegment, endOrOptions, maybeOptions);
  const reference = end.subtract(start);
  const referenceLength = reference.magnitude();
  if (referenceLength <= EPSILON) {
    throw new RangeError('A through-line needs two distinct reference points.');
  }

  const length = options.length == null ? referenceLength : Number(options.length);
  if (!Number.isFinite(length) || length <= 0) {
    throw new RangeError('length must be a positive finite number.');
  }

  const direction = (perpendicular ? reference.perpendicular() : reference).normalized();
  const half = direction.scale(length / 2);
  return new LineSegment(through.add(half.negate()), through.add(half));
}

/** Constructs a finite parallel line segment centered on a point. */
export function parallelThrough(value, startOrSegment, endOrOptions, maybeOptions) {
  return lineThrough(value, startOrSegment, endOrOptions, maybeOptions, false);
}

/** Constructs a finite perpendicular line segment centered on a point. */
export function perpendicularThrough(value, startOrSegment, endOrOptions, maybeOptions) {
  return lineThrough(value, startOrSegment, endOrOptions, maybeOptions, true);
}

/** Constructs the internal or external bisector of two rays. */
export function angleBisector(vertex, firstRayPoint, secondRayPoint, options = {}) {
  const origin = Point.from(vertex);
  const first = Point.from(firstRayPoint).subtract(origin);
  const second = Point.from(secondRayPoint).subtract(origin);
  const firstLength = first.magnitude();
  const secondLength = second.magnitude();
  if (firstLength <= EPSILON || secondLength <= EPSILON) {
    throw new RangeError('angleBisector() needs two non-zero rays.');
  }

  const aliases = { interior: 'internal', minor: 'internal', exterior: 'external', major: 'external' };
  const requestedMode = options.mode ?? (options.external ? 'external' : 'internal');
  const mode = aliases[requestedMode] ?? requestedMode;
  if (mode !== 'internal' && mode !== 'external') {
    throw new RangeError(`Unknown angle bisector mode: ${requestedMode}.`);
  }

  const direction = (mode === 'internal'
    ? first.normalized().add(second.normalized())
    : first.normalized().subtract(second.normalized())).normalized();
  if (direction.isZero()) {
    throw new RangeError(`The ${mode} bisector is undefined for these rays.`);
  }

  const length = options.length == null ? Math.min(firstLength, secondLength) : Number(options.length);
  if (!Number.isFinite(length) || length <= 0) {
    throw new RangeError('length must be a positive finite number.');
  }
  return new LineSegment(origin, origin.add(direction.scale(length)));
}

function triangleValues(first, second, third) {
  return [Point.from(first), Point.from(second), Point.from(third)];
}

function triangleIsDegenerate(first, second, third, epsilon = EPSILON) {
  const ab = second.subtract(first);
  const ac = third.subtract(first);
  return Math.abs(ab.cross(ac)) <= crossTolerance(ab, ac, epsilon);
}

export function triangleCentroid(first, second, third) {
  const [a, b, c] = triangleValues(first, second, third);
  return new Point((a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3);
}

export function triangleIncenter(first, second, third) {
  const [a, b, c] = triangleValues(first, second, third);
  if (triangleIsDegenerate(a, b, c)) return null;
  const oppositeA = b.distanceTo(c);
  const oppositeB = c.distanceTo(a);
  const oppositeC = a.distanceTo(b);
  const perimeter = oppositeA + oppositeB + oppositeC;
  if (perimeter <= EPSILON) return null;
  return new Point(
    (oppositeA * a.x + oppositeB * b.x + oppositeC * c.x) / perimeter,
    (oppositeA * a.y + oppositeB * b.y + oppositeC * c.y) / perimeter,
  );
}

export function triangleCircumcenter(first, second, third) {
  const [a, b, c] = triangleValues(first, second, third);
  const ab = b.subtract(a);
  const ac = c.subtract(a);
  const denominator = 2 * ab.cross(ac);
  if (Math.abs(denominator) <= 2 * crossTolerance(ab, ac, EPSILON)) return null;
  const abSquared = ab.magnitudeSquared();
  const acSquared = ac.magnitudeSquared();
  return new Point(
    a.x + (abSquared * ac.y - acSquared * ab.y) / denominator,
    a.y + (ab.x * acSquared - ac.x * abSquared) / denominator,
  );
}

export function triangleOrthocenter(first, second, third) {
  const [a, b, c] = triangleValues(first, second, third);
  const circumcenter = triangleCircumcenter(a, b, c);
  if (!circumcenter) return null;
  return new Point(
    a.x + b.x + c.x - 2 * circumcenter.x,
    a.y + b.y + c.y - 2 * circumcenter.y,
  );
}

export function triangleCenters(first, second, third) {
  const [a, b, c] = triangleValues(first, second, third);
  return Object.freeze({
    centroid: triangleCentroid(a, b, c),
    incenter: triangleIncenter(a, b, c),
    circumcenter: triangleCircumcenter(a, b, c),
    orthocenter: triangleOrthocenter(a, b, c),
  });
}

export const centroid = triangleCentroid;
export const incenter = triangleIncenter;
export const circumcenter = triangleCircumcenter;
export const orthocenter = triangleOrthocenter;
