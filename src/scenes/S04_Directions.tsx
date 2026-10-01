import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SceneShell} from '../components/SceneShell';
import {Camera} from '../animation/Camera';
import {useBeats} from '../animation/beats';
import {appear, ease, pop, progress} from '../animation/motion';
import {color, type} from '../design-system/theme';
import {ANATOMICAL, Mannequin, rig, toStage} from '../medical/Mannequin';
import {Bracket, DrawnArrow, DrawnPath, Label, Midline, SvgText} from '../components/svg';
import {Kicker} from '../components/ui';
import {pt} from '../utils/geometry';

const FX = 700, FY = 1010, FS = 0.95;
const S = (x: number, y: number) => toStage(pt(x, y), FX, FY, FS);

/** 2.5D turn between two views: returns the view to draw and the horizontal squash. */
export const turnState = <A extends string, B extends string>(t: number, a: A, b: B) => ({view: (t < 0.5 ? a : b) as A | B, sx: Math.max(0.04, Math.abs(Math.cos(t * Math.PI)))});

export const Directions: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats('directions');
  const t1 = progress(frame, b('ant', -0.7), 22, ease.inOut);
  const t2 = progress(frame, b('medial', -0.6), 22, ease.inOut);
  const st = t2 > 0 ? turnState(t2, 'side', 'front') : turnState(t1, 'front', 'side');
  const R = rig('front', ANATOMICAL);
  const head = S(0, -842);
  const faceZoom = 3.0;
  const medExA = b('medEx'), medExMid = b.at('medEx', 0.5);

  const pairs = [
    {a: 'Anterior', c: 'Posterior', tone: color.coronal, from: b('ant'), to: b('medial')},
    {a: 'Medial', c: 'Lateral', tone: color.sagittal, from: b('medial'), to: b('sup')},
    {a: 'Superior', c: 'Inferior', tone: color.transverse, from: b('sup'), to: b('compare')},
  ];
  const compareA = progress(frame, b('compare', -0.2), 20);

  return (
    <SceneShell id="directions" chapter={3}>
      <Camera
        keys={[
          {f: 0, x: 960, y: 540, zoom: 1},
          {f: medExA - 6, x: 960, y: 540, zoom: 1},
          {f: medExA + 16, x: head.x, y: head.y + 10, zoom: faceZoom},
          {f: medExMid - 4, x: head.x, y: head.y + 10, zoom: faceZoom},
          {f: medExMid + 18, x: 960, y: 540, zoom: 1},
        ]}
      >
        <svg width={1920} height={1080} style={{position: 'absolute', overflow: 'visible'}}>
          <g opacity={1 - compareA * 0.65}>
            <Mannequin
              view={st.view}
              x={FX}
              y={FY}
              scale={FS}
              scaleX={st.sx}
              highlight={{
                ...(frame > b.at('medEx', 0.55) && frame < b('lr') ? {rArm: color.sagittal, lArm: color.sagittal, torso: color.textDim} : {}),
                ...(frame > b('supEx') && frame < b('compare') ? {head: color.transverse} : {}),
              }}
            />
          </g>

          {/* ── anterior / posterior (side view) ── */}
          <DrawnPath d={`M${FX - 2} ${FY - 900} L${FX - 2} ${FY + 10}`} start={b('ant', 0.2)} dur={26} out={b('medial', -0.8)} stroke={color.coronal} width={3} dash={10} opacity={0.6} />
          <DrawnArrow d={`M${FX + 75} ${FY - 620} L${FX + 330} ${FY - 620}`} start={b('ant', 0.4)} dur={18} out={b('medial', -0.8)} stroke={color.coronal} width={9} head={30} />
          <SvgText x={FX + 210} y={FY - 730} text="ANTERIOR" start={b('ant', 0.8)} out={b('medial', -0.8)} size={46} fill={color.coronal} />
          <SvgText x={FX + 210} y={FY - 682} text="ventral · toward the front" start={b('ant', 1.1)} out={b('medial', -0.8)} size={27} fill={color.textDim} family="Inter" weight={600} />
          <DrawnArrow d={`M${FX - 70} ${FY - 620} L${FX - 325} ${FY - 620}`} start={b('post', 0.3)} dur={18} out={b('medial', -0.8)} stroke={color.coronal} width={9} head={30} />
          <SvgText x={FX - 200} y={FY - 730} text="POSTERIOR" start={b('post', 0.7)} out={b('medial', -0.8)} size={46} fill={color.coronal} />
          <SvgText x={FX - 200} y={FY - 682} text="dorsal · toward the back" start={b('post', 1.0)} out={b('medial', -0.8)} size={27} fill={color.textDim} family="Inter" weight={600} />

          {/* ── medial / lateral (front view) ── */}
          <Midline x={FX} y0={FY - 900 * FS - 20} y1={FY + 10} start={b('medial', 0.1)} out={b('sup', -0.4)} label={false} />
          <SvgText x={FX} y={FY - 900 * FS - 50} text="MIDLINE" start={b('medial', 0.4)} out={b('medEx', -0.1)} size={28} fill={color.sagittal} family="Inter" />
          {(() => {
            const sh = toStage(R.l.E, FX, FY, FS);
            return (
              <g>
                <DrawnArrow d={`M${sh.x - 10} ${sh.y - 80} L${FX + 30} ${sh.y - 80}`} start={b.at('medial', 0.12)} dur={18} out={b('medEx', -0.2)} stroke={color.sagittal} width={8} head={26} />
                <SvgText x={(sh.x + FX) / 2 + 10} y={sh.y - 130} text="MEDIAL" start={b.at('medial', 0.2)} out={b('medEx', -0.2)} size={40} fill={color.sagittal} />
                <DrawnArrow d={`M${sh.x + 30} ${sh.y + 40} L${sh.x + 280} ${sh.y + 40}`} start={b.at('medial', 0.6)} dur={18} out={b('medEx', -0.2)} stroke={color.sagittal} width={8} head={26} />
                <SvgText x={sh.x + 160} y={sh.y - 6} text="LATERAL" start={b.at('medial', 0.66)} out={b('medEx', -0.2)} size={40} fill={color.sagittal} />
              </g>
            );
          })()}
          {/* face close-up: nose on the midline, eyes lateral to it */}
          {frame > medExA && frame < medExMid + 20 ? (
            <g opacity={appear(frame, medExA + 14, {out: medExMid - 2, dy: 0}).opacity}>
              <circle cx={head.x} cy={head.y + 22 * FS} r={4} fill={color.accent} />
              <circle cx={head.x - 17} cy={head.y + 2} r={4} fill={color.text} />
              <circle cx={head.x + 17} cy={head.y + 2} r={4} fill={color.text} />
              <line x1={head.x} y1={head.y + 2} x2={head.x - 17} y2={head.y + 2} stroke={color.text} strokeWidth={1.2} strokeDasharray="2 2" />
              <line x1={head.x} y1={head.y + 2} x2={head.x + 17} y2={head.y + 2} stroke={color.text} strokeWidth={1.2} strokeDasharray="2 2" />
              <line x1={head.x + 3} y1={head.y + 23} x2={head.x + 40} y2={head.y + 44} stroke={color.accent} strokeWidth={1.2} />
              <text x={head.x + 43} y={head.y + 48} fontFamily="Manrope" fontWeight={800} fontSize={14} fill={color.accent}>nose</text>
              <text x={head.x - 70} y={head.y - 22} fontFamily="Manrope" fontWeight={800} fontSize={13} fill={color.text}>eyes</text>
              <text x={head.x} y={head.y + 70} fontFamily="Manrope" fontWeight={800} fontSize={14} fill={color.sagittal} textAnchor="middle" stroke={color.bg0} strokeWidth={3} style={{paintOrder: 'stroke'}}>
                nose is MEDIAL to the eyes
              </text>
            </g>
          ) : null}
          <SvgText x={FX - 190} y={FY - 640} text="arms are LATERAL" start={medExMid + 22} out={b('lr', -0.1)} size={36} fill={color.sagittal} anchor="end" />
          <SvgText x={FX - 190} y={FY - 596} text="to the chest" start={medExMid + 28} out={b('lr', -0.1)} size={36} fill={color.text} anchor="end" />

          {/* patient's right / left */}
          {(() => {
            const a = appear(frame, b('lr', 0.2), {out: b('sup', -0.3), dy: 0});
            if (a.opacity <= 0) return null;
            const s1 = pop(frame, b('lr', 0.2)), s2 = pop(frame, b('lr', 0.6));
            return (
              <g opacity={a.opacity}>
                <g transform={`translate(${FX - 300} ${FY - 560}) scale(${s1})`}>
                  <circle r={58} fill={color.sagittal} />
                  <text y={4} textAnchor="middle" dominantBaseline="middle" fontFamily="Manrope" fontWeight={800} fontSize={64} fill={color.bg0}>R</text>
                </g>
                <text x={FX - 300} y={FY - 460} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={28} fill={color.text}>patient’s right</text>
                <g transform={`translate(${FX + 300} ${FY - 560}) scale(${s2})`}>
                  <circle r={58} fill="none" stroke={color.sagittal} strokeWidth={6} />
                  <text y={4} textAnchor="middle" dominantBaseline="middle" fontFamily="Manrope" fontWeight={800} fontSize={64} fill={color.sagittal}>L</text>
                </g>
                <text x={FX + 300} y={FY - 460} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={28} fill={color.text}>patient’s left</text>
              </g>
            );
          })()}

          {/* superior / inferior */}
          <DrawnArrow d={`M${FX + 270} ${FY - 520} L${FX + 270} ${FY - 880}`} start={b('sup', 0.3)} dur={20} out={b('compare', -0.3)} stroke={color.transverse} width={9} head={30} />
          <SvgText x={FX + 300} y={FY - 900} text="SUPERIOR" start={b('sup', 0.6)} out={b('compare', -0.3)} size={44} fill={color.transverse} anchor="start" />
          <SvgText x={FX + 300} y={FY - 852} text="toward the head" start={b('sup', 1.0)} out={b('compare', -0.3)} size={28} fill={color.textDim} anchor="start" family="Inter" weight={600} />
          <DrawnArrow d={`M${FX + 270} ${FY - 400} L${FX + 270} ${FY - 40}`} start={b('inf', 0.3)} dur={20} out={b('compare', -0.3)} stroke={color.transverse} width={9} head={30} />
          <SvgText x={FX + 300} y={FY - 70} text="INFERIOR" start={b('inf', 0.6)} out={b('compare', -0.3)} size={44} fill={color.transverse} anchor="start" />
          <SvgText x={FX + 300} y={FY - 22} text="toward the feet" start={b('inf', 1.0)} out={b('compare', -0.3)} size={28} fill={color.textDim} anchor="start" family="Inter" weight={600} />
          <Bracket a={S(-130, -842)} b={S(-130, -700)} side={-60} start={b('supEx', 0.4)} out={b('compare', -0.3)} stroke={color.transverse} />
          <SvgText x={FX - 300} y={S(0, -780).y - 30} text="head" start={b('supEx', 0.6)} out={b('compare', -0.3)} size={34} fill={color.transverse} anchor="end" />
          <SvgText x={FX - 300} y={S(0, -780).y + 14} text="SUPERIOR to" start={b('supEx', 0.9)} out={b('compare', -0.3)} size={30} fill={color.text} anchor="end" family="Inter" weight={700} />
          <SvgText x={FX - 300} y={S(0, -780).y + 56} text="the shoulders" start={b('supEx', 1.2)} out={b('compare', -0.3)} size={34} fill={color.text} anchor="end" />
        </svg>
      </Camera>

      {/* pair cards */}
      <div style={{position: 'absolute', left: 1300, top: 250, opacity: appear(frame, b('intro', 1.0), {out: b('compare', -0.4)}).opacity}}>
        <Kicker>Three major pairs</Kicker>
        {pairs.map((p, i) => {
          const a = appear(frame, b.at('intro', 0.35 + i * 0.12), {dy: 20});
          const active = frame >= p.from && frame < p.to;
          const dim = frame >= b('ant') && !active ? 0.4 : 1;
          return (
            <div key={i} style={{marginTop: 28, width: 520, padding: '24px 30px', borderRadius: 22, background: active ? 'rgba(255,255,255,0.06)' : color.panel, border: `3px solid ${active ? p.tone : color.panelLine}`, opacity: a.opacity * dim, transform: `translateY(${a.y}px) scale(${active ? 1.03 : 1})`}}>
              <div style={{...type.h3, fontSize: 46, color: p.tone}}>
                {p.a} <span style={{color: color.textFaint}}>↔</span> {p.c}
              </div>
            </div>
          );
        })}
      </div>
      {/* relational rule */}
      {compareA > 0 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', opacity: compareA}}>
          <div style={{...type.h1, fontSize: 92, color: color.text}}>
            A is medial <span style={{color: color.accent, borderBottom: `8px solid ${color.accent}`}}>to</span> B
          </div>
          <div style={{...type.body, color: color.textDim, marginTop: 30, opacity: appear(frame, b.at('compare', 0.5)).opacity}}>
            every directional term is a comparison
          </div>
        </div>
      ) : null}
    </SceneShell>
  );
};
