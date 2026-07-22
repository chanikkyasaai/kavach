/** Deterministic pseudo-random in [0,1) — used instead of Math.random() for
 *  any placement computed during render/useMemo, so scattered detail is
 *  stable across re-renders instead of popping, and doesn't trip the
 *  "no impure calls during render" rule. */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function seededRange(seed: number, min: number, max: number): number {
  return min + seededRandom(seed) * (max - min);
}
