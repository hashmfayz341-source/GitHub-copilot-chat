/**
 * Anterior view of the RIGHT forearm and hand (elbow at top), x-ray style.
 * `palm` = 0 → supinated (palm forward, radius ∥ ulna); 180 → pronated (palm backward,
 * radius crossed over the ulna). Patient's right side: lateral (thumb/radius) is screen-left.
 */
import React from 'react';
import {color} from '../design-system/theme';
import {capsulePath, pt} from '../utils/geometry';
import {handPath} from './Mannequin';

export const FOREARM = {elbowY: 270, wristY: 690, cx: 760};

export const ForearmXray: React.FC<{palm: number; x?: number; y?: number; scale?: number; radiusGlow?: boolean; ulnaGlow?: boolean; boneOpacity?: number}> = ({
  palm, x = 0, y = 0, scale = 1, radiusGlow, ulnaGlow, boneOpacity = 1,
}) => {
  const {cx, elbowY, wristY} = FOREARM;
  const a = (palm * Math.PI) / 180;
  const radDistX = cx - 46 * Math.cos(a);
  const radDistY = wristY - 6 * Math.sin(a);
  const hand = handPath(pt(0, 0), pt(0, 1), palm, -1, false, 0, 1);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* humerus end */}
      <path d={`${capsulePath(pt(cx, 60), 26, pt(cx, 240), 24)}`} fill={color.bone} stroke={color.boneLine} strokeWidth={3} opacity={boneOpacity} />
      <ellipse cx={cx} cy={elbowY - 6} rx={64} ry={26} fill={color.bone} stroke={color.boneLine} strokeWidth={3} opacity={boneOpacity} />
      {/* skin */}
      <path d={capsulePath(pt(cx, 150), 92, pt(cx, wristY + 10), 62)} fill={color.skin} fillOpacity={0.22} stroke={color.skinLine} strokeWidth={3} />
      {/* ulna (medial, fixed) */}
      <path d={capsulePath(pt(cx + 40, elbowY + 20), 17, pt(cx + 40, wristY - 4), 10)} fill={color.bone} stroke={ulnaGlow ? color.text : color.boneLine} strokeWidth={ulnaGlow ? 5 : 3} opacity={boneOpacity} />
      {/* radius (lateral at the elbow, swings across distally) */}
      <path d={capsulePath(pt(cx - 42, elbowY + 26), 12, pt(radDistX, radDistY), 19)} fill="#F7D9A0" stroke={radiusGlow ? color.accent : color.boneLine} strokeWidth={radiusGlow ? 5 : 3} opacity={boneOpacity} />
      {/* hand */}
      <g transform={`translate(${cx} ${wristY + 18}) scale(3.1)`}>
        {!hand.thumbInFront ? <path d={hand.thumb} fill={color.skin} stroke={color.skinLine} strokeWidth={1} /> : null}
        <path d={hand.outline} fill={hand.palmVisible ? '#F3D3C2' : color.skin} stroke={color.skinLine} strokeWidth={1} />
        {hand.fingerLines.map(([p0, p1], i) => (
          <line key={i} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke="rgba(156,135,112,0.6)" strokeWidth={0.8} />
        ))}
        {hand.thumbInFront ? <path d={hand.thumb} fill={color.skin} stroke={color.skinLine} strokeWidth={1} /> : null}
      </g>
    </g>
  );
};
