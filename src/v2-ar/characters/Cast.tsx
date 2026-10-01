import React from 'react';
import {colorAR} from '../design/theme-ar';
import {Beard} from './Face';
import {CharacterBase} from './CharacterBase';
import type {RigProps} from './rig';

/**
 * The three locked characters, built from the approved V2 reference sheets.
 * Identity is carried by head covering + outfit palette; the rig underneath is
 * shared, so a gesture or expression behaves identically for all three.
 */

/** White ghutra with the black igal — Rashid. */
const GhutraDrape: React.FC<{cloth: string; shade: string}> = ({cloth, shade}) => (
  <>
    {/* cloth falling behind the shoulders */}
    <path d="M -64 -30 Q -92 46 -80 112 L -40 112 Q -54 34 -48 -30 Z" fill={cloth} stroke={shade} strokeWidth={2} />
    <path d="M 64 -30 Q 92 46 80 112 L 40 112 Q 54 34 48 -30 Z" fill={cloth} stroke={shade} strokeWidth={2} />
  </>
);

/** Crown + igal, drawn OVER the skull so no bare scalp shows. */
const GhutraCrown: React.FC<{cloth: string; shade: string; igal: string}> = ({cloth, shade, igal}) => (
  <>
    <path d="M -66 -16 Q -70 -74 0 -76 Q 70 -74 66 -16 Q 44 -44 0 -44 Q -44 -44 -66 -16 Z" fill={cloth} stroke={shade} strokeWidth={2} />
    <ellipse cy={-50} rx={64} ry={14} fill="none" stroke={igal} strokeWidth={12} />
    <ellipse cy={-38} rx={62} ry={12} fill="none" stroke={igal} strokeWidth={9} />
  </>
);

/** Red-and-white checked shemagh — Salem. */
const ShemaghDrape: React.FC<{red: string; white: string}> = ({red, white}) => {
  const check = (
    <pattern id="salem-check" width="14" height="14" patternUnits="userSpaceOnUse">
      <rect width="14" height="14" fill={white} />
      <rect width="7" height="7" fill={red} opacity={0.92} />
      <rect x="7" y="7" width="7" height="7" fill={red} opacity={0.92} />
    </pattern>
  );
  return (
    <>
      <defs>{check}</defs>
      <path d="M -64 -30 Q -94 50 -82 116 L -40 116 Q -56 36 -48 -30 Z" fill="url(#salem-check)" stroke={red} strokeWidth={2} />
      <path d="M 64 -30 Q 94 50 82 116 L 40 116 Q 56 36 48 -30 Z" fill="url(#salem-check)" stroke={red} strokeWidth={2} />
    </>
  );
};

const ShemaghCrown: React.FC<{red: string; igal: string}> = ({red, igal}) => (
  <>
    <path d="M -66 -16 Q -70 -74 0 -76 Q 70 -74 66 -16 Q 44 -44 0 -44 Q -44 -44 -66 -16 Z" fill="url(#salem-check)" stroke={red} strokeWidth={2} />
    <ellipse cy={-50} rx={64} ry={14} fill="none" stroke={igal} strokeWidth={12} />
    <ellipse cy={-38} rx={62} ry={12} fill="none" stroke={igal} strokeWidth={9} />
  </>
);

/** Navy hijab — Noura. Covers hair and frames the face. */
const Hijab: React.FC<{color: string; shade: string}> = ({color, shade}) => (
  <>
    <path d="M -70 -20 Q -74 70 -58 126 L 58 126 Q 74 70 70 -20 Q 70 -84 0 -86 Q -70 -84 -70 -20 Z" fill={color} stroke={shade} strokeWidth={2} />
    {/* draped fold over the shoulder */}
    <path d="M 40 60 Q 76 86 70 126 L 30 126 Q 34 90 26 64 Z" fill={shade} opacity={0.9} />
  </>
);

/** The face opening of the hijab, drawn over the face edge. */
const HijabFront: React.FC<{color: string; shade: string}> = ({color, shade}) => (
  <path
    d="M -58 -10 Q -58 -70 0 -72 Q 58 -70 58 -10 Q 58 24 50 44 Q 38 -16 0 -16 Q -38 -16 -50 44 Q -58 24 -58 -10 Z"
    fill={color}
    stroke={shade}
    strokeWidth={2}
  />
);

export const Rashid: React.FC<RigProps> = (p) => {
  const c = colorAR.rashid;
  return (
    <CharacterBase
      {...p}
      id={{
        skin: c.skin, skinShade: c.skinShade, hair: c.hair,
        coat: c.coat, coatShade: c.coatShade,
        inner: c.thobe, innerShade: c.thobeShade,
        legs: 'thobe', legColor: c.thobe, legShade: c.thobeShade,
        shoe: '#6B4A2F',
        badge: c.badge,
        headwearBack: <GhutraDrape cloth={c.ghutra} shade={c.ghutraShade} />,
        headwearFront: <GhutraCrown cloth={c.ghutra} shade={c.ghutraShade} igal={c.igal} />,
        beard: <Beard color={c.hair} />,
      }}
    />
  );
};

export const Salem: React.FC<RigProps> = (p) => {
  const c = colorAR.salem;
  return (
    <CharacterBase
      {...p}
      id={{
        skin: c.skin, skinShade: c.skinShade, hair: c.hair,
        coat: c.coat, coatShade: c.coatShade,
        inner: c.scrubs, innerShade: c.scrubsShade,
        legs: 'trousers', legColor: c.scrubs, legShade: c.scrubsShade,
        shoe: c.shoe,
        headwearBack: <ShemaghDrape red={c.shemaghRed} white={c.shemaghWhite} />,
        headwearFront: <ShemaghCrown red={c.shemaghRed} igal={c.igal} />,
        beard: <Beard color={c.hair} />,
      }}
    />
  );
};

export const Noura: React.FC<RigProps> = (p) => {
  const c = colorAR.noura;
  return (
    <CharacterBase
      {...p}
      id={{
        skin: c.skin, skinShade: c.skinShade, hair: c.hijabShade,
        coat: c.coat, coatShade: c.coatShade,
        inner: c.scrubs, innerShade: c.scrubsShade,
        legs: 'trousers', legColor: c.scrubs, legShade: c.scrubsShade,
        shoe: '#2A3550',
        badge: c.badge,
        lash: true,
        headwearBack: <Hijab color={c.hijab} shade={c.hijabShade} />,
        headwearFront: <HijabFront color={c.hijab} shade={c.hijabShade} />,
      }}
    />
  );
};

export const CAST = {Rashid, Salem, Noura} as const;
