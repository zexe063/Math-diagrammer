export const EPSILON = 1e-9;

export function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

export function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function nearlyEqual(a, b, epsilon = EPSILON) {
  const scale = Math.max(1, Math.abs(a), Math.abs(b));
  return Math.abs(a - b) <= epsilon * scale;
}

export function solveLinear(a, b, epsilon = EPSILON) {
  return Math.abs(a) <= epsilon ? [] : [-b / a];
}

export function normalizeAngle(angle) {
  const tau = Math.PI * 2;
  const normalized = angle % tau;
  return normalized < 0 ? normalized + tau : normalized;
}

export function angleDelta(from, to) {
  const tau = Math.PI * 2;
  let delta = positiveModulo(to - from + Math.PI, tau) - Math.PI;
  if (delta === -Math.PI) delta = Math.PI;
  return delta;
}

export function angleOnSweep(angle, startAngle, sweepAngle, epsilon = EPSILON) {
  const tau = Math.PI * 2;
  if (Math.abs(sweepAngle) >= tau - epsilon) return true;
  if (sweepAngle >= 0) {
    return positiveModulo(angle - startAngle, tau) <= sweepAngle + epsilon;
  }
  return positiveModulo(startAngle - angle, tau) <= -sweepAngle + epsilon;
}

export function positiveModulo(value, modulus) {
  const remainder = value % modulus;
  return remainder < 0 ? remainder + modulus : remainder;
}

export function quadraticRoots(a, b, c, epsilon = EPSILON) {
  if (Math.abs(a) <= epsilon) {
    if (Math.abs(b) <= epsilon) return [];
    return [-c / b];
  }

  const discriminant = b * b - 4 * a * c;
  if (discriminant < -epsilon) return [];
  if (Math.abs(discriminant) <= epsilon) return [-b / (2 * a)];

  // This form avoids unnecessary cancellation when b and sqrt(discriminant)
  // have similar magnitudes.
  const root = Math.sqrt(Math.max(0, discriminant));
  const q = -0.5 * (b + Math.sign(b || 1) * root);
  const first = q / a;
  const second = c / q;
  return first <= second ? [first, second] : [second, first];
}

export const solveQuadratic = quadraticRoots;

export function cubicRoots(a, b, c, d, epsilon = EPSILON) {
  if (Math.abs(a) <= epsilon) return quadraticRoots(b, c, d, epsilon);

  const invA = 1 / a;
  const bb = b * invA;
  const cc = c * invA;
  const dd = d * invA;
  const p = cc - (bb * bb) / 3;
  const q = (2 * bb * bb * bb) / 27 - (bb * cc) / 3 + dd;
  const discriminant = (q * q) / 4 + (p * p * p) / 27;
  const offset = bb / 3;

  if (discriminant > epsilon) {
    const sqrtD = Math.sqrt(discriminant);
    const u = Math.cbrt(-q / 2 + sqrtD);
    const v = Math.cbrt(-q / 2 - sqrtD);
    return [u + v - offset];
  }

  if (Math.abs(discriminant) <= epsilon) {
    const u = Math.cbrt(-q / 2);
    const roots = [2 * u - offset, -u - offset];
    return roots[0] <= roots[1] ? roots : [roots[1], roots[0]];
  }

  const radius = 2 * Math.sqrt(-p / 3);
  const argument = clamp((-q / 2) / Math.sqrt(-(p * p * p) / 27), -1, 1);
  const phase = Math.acos(argument) / 3;
  const roots = [
    radius * Math.cos(phase) - offset,
    radius * Math.cos(phase - (2 * Math.PI) / 3) - offset,
    radius * Math.cos(phase - (4 * Math.PI) / 3) - offset,
  ];
  return roots.sort((x, y) => x - y);
}

export function finiteOr(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}
