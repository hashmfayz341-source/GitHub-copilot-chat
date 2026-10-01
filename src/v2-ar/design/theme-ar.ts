/**
 * Arabic Saudi V2 — visual identity.
 *
 * Built on the V1 "Lumen" semantic colour code (a colour always means the same
 * thing) and extended with an original Saudi identity for the three characters.
 * The V1 plane/direction semantics are kept deliberately so the 3D teaching
 * system reads identically across both editions:
 *
 *   coronal / anterior-posterior   → blue
 *   sagittal / right-left / medial → coral
 *   transverse / superior-inferior → green
 *   movement & attention           → amber
 *   rotation axes                  → violet
 */
import {color as v1} from '../../design-system/theme';

export const colorAR = {
  ...v1,

  /** Warmer stage than V1 — this edition is a room with people in it, not a lab plate. */
  bg0: '#0B1016',
  bg1: '#141E28',
  bg2: '#1C2B38',

  /** Character identity, taken from the approved reference sheets. */
  rashid: {
    thobe: '#FAFAF7',
    thobeShade: '#DFDFD6',
    coat: '#FFFFFF',
    coatShade: '#E3E6E8',
    ghutra: '#FBFBF8',
    ghutraShade: '#DCDDD6',
    igal: '#161616',
    skin: '#C98A5E',
    skinShade: '#A96F48',
    hair: '#241A14',
    badge: '#2B4A6F',
    tablet: '#22354B',
  },
  salem: {
    shemaghRed: '#C8403C',
    shemaghWhite: '#F6F1EC',
    igal: '#161616',
    scrubs: '#1F6B74',
    scrubsShade: '#17545C',
    coat: '#FFFFFF',
    coatShade: '#E3E6E8',
    skin: '#C4834F',
    skinShade: '#A66B3C',
    hair: '#201711',
    phone: '#1A1A1E',
    phoneGlass: '#9ED7E8',
    shoe: '#2A3550',
  },
  noura: {
    hijab: '#2B3A5C',
    hijabShade: '#1F2B45',
    scrubs: '#8E7490',
    scrubsShade: '#755D77',
    coat: '#FFFFFF',
    coatShade: '#E3E6E8',
    skin: '#D39A6B',
    skinShade: '#B57C50',
    book: '#2E6F74',
    badge: '#2B4A6F',
  },

  /** Group-chat metaphor (Salem's phone). */
  chat: {
    frame: '#15202B',
    screen: '#0E1A24',
    bubbleOut: '#2A6E5E',
    bubbleIn: '#20303D',
    text: '#EAF2F6',
    tick: '#59C3A5',
  },

  /** Patient-right marker — must read as belonging to the BODY, never the camera. */
  patientRight: '#FFB547',
  patientLeft: '#4DA3FF',

  /** The sole of the foot: the only direction reference in inversion/eversion. */
  soleDark: '#8E5F3C',
  soleTread: '#F4E3CF',

  textDim: '#9DB0BE',
} as const;

export const fontAR = {
  /** Cairo carries both Arabic and Latin, so an English medical term inside an
   *  Arabic sentence keeps one typographic voice. */
  ar: 'CairoAR, Inter, sans-serif',
  /** Medical terminology stays Latin and stays in the V1 display face. */
  term: 'Manrope, Inter, sans-serif',
} as const;

export const typeAR = {
  hero: {fontFamily: fontAR.ar, fontWeight: 900, fontSize: 96, lineHeight: 1.25},
  h1: {fontFamily: fontAR.ar, fontWeight: 800, fontSize: 72, lineHeight: 1.3},
  h2: {fontFamily: fontAR.ar, fontWeight: 700, fontSize: 54, lineHeight: 1.35},
  body: {fontFamily: fontAR.ar, fontWeight: 500, fontSize: 40, lineHeight: 1.5},
  /** Subtitles: large enough to read on a phone, never more than two lines. */
  subtitle: {fontFamily: fontAR.ar, fontWeight: 600, fontSize: 44, lineHeight: 1.45},
  speaker: {fontFamily: fontAR.ar, fontWeight: 700, fontSize: 28, lineHeight: 1.2},
  /** English medical term reveal — short, 1–5 words. */
  term: {fontFamily: fontAR.term, fontWeight: 800, fontSize: 64, letterSpacing: -1, lineHeight: 1.05},
  termSmall: {fontFamily: fontAR.term, fontWeight: 750, fontSize: 40, letterSpacing: -0.4},
} as const;

export const layoutAR = {
  width: 1920,
  height: 1080,
  safeX: 120,
  safeY: 90,
  /** Subtitles sit in a reserved band so anatomy is never covered. */
  subtitleBandTop: 880,
  radius: 24,
} as const;

export const FPS_AR = 30;

/** Per-character identity used by subtitles and name tags. */
export const SPEAKERS = {
  Rashid: {ar: 'راشد', color: colorAR.rashid.badge, accent: '#8FB8E0'},
  Salem: {ar: 'سالم', color: colorAR.salem.scrubs, accent: '#64C7D1'},
  Noura: {ar: 'نورة', color: colorAR.noura.hijab, accent: '#B49CC0'},
} as const;

export type SpeakerId = keyof typeof SPEAKERS;
