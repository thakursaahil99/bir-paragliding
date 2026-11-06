/** Deterministic pseudo-random + mountain ridge SVG path builder (shared by SVG silhouettes). */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Builds a closed ridge silhouette path in a W×H box. Peaks are made from
 * a few summed sines + jitter so they look like the jagged Dhauladhar.
 */
export function ridgePath(seed: number, { w = 1440, h = 320, base = 0.55, amp = 0.35, peaks = 7, jag = 0.06, steps = 90 } = {}) {
  const r = rng(seed);
  const phases = Array.from({ length: 4 }, () => r() * Math.PI * 2);
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * w;
    const t = i / steps;
    let y =
      Math.sin(t * Math.PI * peaks * 0.5 + phases[0]) * 0.5 +
      Math.sin(t * Math.PI * peaks * 1.1 + phases[1]) * 0.3 +
      Math.sin(t * Math.PI * peaks * 2.3 + phases[2]) * 0.15 +
      Math.abs(Math.sin(t * Math.PI * peaks * 4.1 + phases[3])) * 0.12;
    y += (r() - 0.5) * jag * 2;
    const py = h * (base - y * amp);
    pts.push(`${x.toFixed(1)},${Math.max(2, py).toFixed(1)}`);
  }
  return `M0,${h} L${pts.join(' L')} L${w},${h} Z`;
}

/** Same ridge as ridgePath but only the crest line (no closing edges) — for strokes like snow caps. */
export function ridgeCrest(seed: number, opts: Parameters<typeof ridgePath>[1] = {}) {
  const d = ridgePath(seed, opts);
  return d.replace(/^M0,[\d.]+ L/, 'M').replace(/ L[\d.]+,[\d.]+ Z$/, '');
}
