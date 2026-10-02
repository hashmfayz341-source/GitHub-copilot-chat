import React from 'react';
import {yawProject} from './PatientModel';

/**
 * A plane passing through the body, drawn in the body's own projection so it
 * always sits on the anatomy it cuts.
 *
 * `axis` is which body axis the plane is perpendicular to:
 *   'sagittal'   a vertical surface separating right from left
 *   'coronal'    a vertical surface separating front from back
 *   'transverse' a horizontal surface separating above from below
 *
 * `offset` is its position along that axis in body units, so a sagittal plane
 * can sit anywhere and still be sagittal — which is the whole point of Scene 04.
 */
export const BodyPlane: React.FC<{
  yaw: number;
  axis?: 'sagittal' | 'coronal' | 'transverse';
  offset?: number;
  tint: string;
  opacity?: number;
  /** half-extents of the body box the plane is drawn across */
  halfW?: number;
  halfD?: number;
  top?: number;
  bottom?: number;
}> = ({yaw, axis = 'sagittal', offset = 0, tint, opacity = 1, halfW = 150, halfD = 112, top = -520, bottom = -6}) => {
  const {prj} = yawProject(yaw);

  let corners: {x: number; y: number}[];
  if (axis === 'sagittal') {
    corners = [
      {x: prj(offset, -halfD).x, y: top},
      {x: prj(offset, halfD).x, y: top},
      {x: prj(offset, halfD).x, y: bottom},
      {x: prj(offset, -halfD).x, y: bottom},
    ];
  } else if (axis === 'coronal') {
    corners = [
      {x: prj(-halfW, offset).x, y: top},
      {x: prj(halfW, offset).x, y: top},
      {x: prj(halfW, offset).x, y: bottom},
      {x: prj(-halfW, offset).x, y: bottom},
    ];
  } else {
    /**
     * A horizontal plane is edge-on to a level camera and collapses to a line,
     * which reads as a cut mark rather than a surface. Tilting the view a little
     * for this plane only — the body stays upright — is how every anatomy text
     * draws it, and it is the difference between a surface and a scratch.
     */
    const TILT = 0.3;
    const c0 = prj(-halfW, -halfD);
    const c1 = prj(halfW, -halfD);
    const c2 = prj(halfW, halfD);
    const c3 = prj(-halfW, halfD);
    corners = [
      {x: c0.x, y: offset - c0.z * TILT},
      {x: c1.x, y: offset - c1.z * TILT},
      {x: c2.x, y: offset - c2.z * TILT},
      {x: c3.x, y: offset - c3.z * TILT},
    ];
  }

  const d = `M ${corners.map((c) => `${c.x} ${c.y}`).join(' L ')} Z`;
  return (
    <g opacity={opacity}>
      <path d={d} fill={tint} fillOpacity={0.13} stroke={tint} strokeWidth={3} strokeLinejoin="round" />
      {/* a brighter leading edge so the surface reads as a surface, not a tint */}
      <line x1={corners[0].x} y1={corners[0].y} x2={corners[3].x} y2={corners[3].y} stroke={tint} strokeWidth={5} opacity={0.9} />
    </g>
  );
};
