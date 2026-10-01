/**
 * Medical Motion Design System — visual tokens.
 *
 * Identity: "Lumen" — a calm slate stage, ivory capsule-mannequin, and a strict
 * semantic colour code so that a colour always means the same thing:
 *   coronal / anterior-posterior   → blue
 *   sagittal / right-left / medial → coral
 *   transverse / superior-inferior → green
 *   movement & attention           → amber
 *   rotation axes                  → violet
 */
export const color = {
  bg0: '#0A131B',
  bg1: '#112230',
  bg2: '#18303F',
  panel: 'rgba(20, 40, 54, 0.72)',
  panelLine: 'rgba(160, 196, 220, 0.16)',
  grid: 'rgba(150, 190, 215, 0.07)',

  text: '#F1F5F8',
  textDim: '#A9BBC9',
  textFaint: '#6D8496',

  skin: '#EADFD0',
  skinLight: '#F6EEE3',
  skinShade: '#CDBCA6',
  skinLine: '#9C8770',
  joint: '#D9C8B2',

  bone: '#F3EBDD',
  boneShade: '#D7C9B1',
  boneLine: '#8E7C62',

  coronal: '#4DA3FF',
  sagittal: '#FF6B5E',
  transverse: '#3DDC97',
  accent: '#FFB547',
  axis: '#A98BFF',
  danger: '#FF5D73',
  correct: '#3DDC97',

  // anatomical layer palette (superficial → deep)
  layerSkin: '#E9C9AE',
  layerFat: '#F2C861',
  layerFascia: '#E8E1D4',
  layerMuscle: '#C9473F',
  layerNV: '#7A5BD6',
  layerBone: '#EFE6D4',
  layerBrain: '#E7A9A6',
} as const;

export const font = {
  display: 'Manrope, Inter, sans-serif',
  body: 'Inter, sans-serif',
} as const;

export const type = {
  hero: {fontFamily: font.display, fontWeight: 800, fontSize: 112, letterSpacing: -3, lineHeight: 1.0},
  h1: {fontFamily: font.display, fontWeight: 800, fontSize: 84, letterSpacing: -2, lineHeight: 1.04},
  h2: {fontFamily: font.display, fontWeight: 750, fontSize: 60, letterSpacing: -1.2, lineHeight: 1.1},
  h3: {fontFamily: font.display, fontWeight: 700, fontSize: 44, letterSpacing: -0.6, lineHeight: 1.15},
  body: {fontFamily: font.body, fontWeight: 500, fontSize: 38, lineHeight: 1.35},
  label: {fontFamily: font.body, fontWeight: 650, fontSize: 34, letterSpacing: 0.2},
  kicker: {fontFamily: font.body, fontWeight: 700, fontSize: 26, letterSpacing: 5, textTransform: 'uppercase' as const},
  small: {fontFamily: font.body, fontWeight: 600, fontSize: 28},
} as const;

export const layout = {
  width: 1920,
  height: 1080,
  /** Title-safe margin (≈ 5% + a little) — nothing important leaves this box. */
  safeX: 120,
  safeY: 90,
  radius: 22,
} as const;

export const FPS = 30;
