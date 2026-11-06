export type PaletteName = 'dawn' | 'day' | 'golden' | 'night';

export type Palette = {
  label: string;
  top: string;
  horizon: string;
  sun: string;
  fog: string;
  light: string;
  cloud: string;
  hemiSky: string;
  hemiGround: string;
  stars: number;
  lightIntensity: number;
};

/** Time-of-day lighting — the hero sky follows the visitor's real local clock. */
export const palettes: Record<PaletteName, Palette> = {
  dawn: { label: 'Dawn', top: '#1b326b', horizon: '#ff9f68', sun: '#ffd6a8', fog: '#d99a80', light: '#ffb98a', cloud: '#ffe6d4', hemiSky: '#a9b9ff', hemiGround: '#3a2a24', stars: 0.12, lightIntensity: 2.4 },
  day: { label: 'Midday', top: '#0f56d4', horizon: '#c4e4ff', sun: '#fff7e0', fog: '#a8cbef', light: '#fff2da', cloud: '#ffffff', hemiSky: '#d4e8ff', hemiGround: '#2c3a2a', stars: 0, lightIntensity: 2.8 },
  golden: { label: 'Golden hour', top: '#26306c', horizon: '#ffad5a', sun: '#ffd37a', fog: '#d4936a', light: '#ffbf78', cloud: '#ffe1c2', hemiSky: '#b0a8e8', hemiGround: '#3a2a1c', stars: 0.05, lightIntensity: 2.5 },
  night: { label: 'Night', top: '#02050f', horizon: '#1b2d58', sun: '#cfe0ff', fog: '#14234a', light: '#8aa4dc', cloud: '#7c8fb8', hemiSky: '#3a5088', hemiGround: '#080b12', stars: 1, lightIntensity: 1.1 },
};

export const paletteOrder: PaletteName[] = ['dawn', 'day', 'golden', 'night'];

export function paletteForHour(h: number): PaletteName {
  if (h >= 5 && h < 8) return 'dawn';
  if (h >= 8 && h < 16) return 'day';
  if (h >= 16 && h < 19) return 'golden';
  return 'night';
}
