import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {SceneShell} from '../components/SceneShell';
import {Camera} from '../animation/Camera';
import {useBeats} from '../animation/beats';
import {appear, ease, lerp, pop, progress} from '../animation/motion';
import {color, type} from '../design-system/theme';
import {Mannequin} from '../medical/Mannequin';
import {DrawnArrow, DrawnPath, Label, Pulse, SvgText} from '../components/svg';
import {Icon, IconKind} from '../components/icons';
import {Kicker} from '../components/ui';
import {Roadmap} from '../components/Roadmap';
import {Cell, HEART_CENTER, Organs, TissuePattern} from '../medical/Organs';
import {pt} from '../utils/geometry';
import {useSvgId} from '../utils/useSvgId';

/* ───────────────────────── 1 · HOOK ───────────────────────── */

const Stretcher: React.FC<{opacity: number; y?: number}> = ({opacity, y = 0}) => (
  <g opacity={opacity} transform={`translate(0 ${y})`}>
    <rect x={470} y={660} width={1060} height={30} rx={15} fill="#2F4656" stroke="#45657A" strokeWidth={3} />
    <rect x={500} y={650} width={1000} height={16} rx={8} fill="#E8EEF2" opacity={0.9} />
    {[560, 1440].map((x) => (
      <g key={x}>
        <line x1={x} y1={690} x2={x} y2={870} stroke="#45657A" strokeWidth={10} />
        <circle cx={x} cy={890} r={20} fill="#1E2E3A" stroke="#45657A" strokeWidth={5} />
      </g>
    ))}
    <line x1={560} y1={800} x2={1440} y2={800} stroke="#45657A" strokeWidth={8} />
  </g>
);

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats('hook');
  const rise = progress(frame, b('language', 0.2), 60, ease.inOut);
  const turn = progress(frame, b('language', 1.7), 24, ease.inOut);
  const fx = lerp(1420, 610, rise);
  const fy = lerp(600, 975, rise);
  const rot = lerp(-90, 0, rise);
  const sc = lerp(0.95, 0.86, rise);
  const view = turn < 0.5 ? 'side' : 'front';
  const sx = Math.max(0.04, Math.abs(Math.cos(turn * Math.PI)));
  const wound = pt(843, 552);
  const chaos = progress(frame, b('chaos'), 1, ease.out) > 0 && frame < b('language', 0.4);
  const wobble = frame > b('chaos') && frame < b('language') ? Math.sin((frame - b('chaos')) / 9) * 2.5 * progress(frame, b('chaos'), 20) * (1 - progress(frame, b('language', -0.6), 18)) : 0;

  const chaosArrows = [
    [-70, 220, 'up?', color.accent], [200, 190, 'down?', color.sagittal], [160, 230, 'higher?', color.coronal], [-150, 200, 'front?', color.transverse],
    [20, 200, 'right?', color.sagittal], [-30, 240, 'left?', color.axis], [110, 160, 'lower?', color.accent], [250, 180, 'over?', color.coronal],
  ] as const;

  const pillars: Array<{icon: IconKind; title: string; sub: string; at: number}> = [
    {icon: 'figure', title: 'Reference position', sub: 'one fixed starting point', at: b.at('language', 0.28)},
    {icon: 'planes', title: 'Imaginary planes', sub: 'how we section the body', at: b.at('language', 0.55)},
    {icon: 'arrows', title: 'Precise terms', sub: 'direction & movement', at: b.at('language', 0.8)},
  ];
  const quote = appear(frame, b('above'), {out: b('chaos', 1.2)});

  return (
    <SceneShell id="hook" chapter={0}>
      <Camera
        keys={[
          {f: 0, x: 880, y: 560, zoom: 1.75},
          {f: b('patient', 3.2), x: 960, y: 540, zoom: 1.12},
          {f: b('above'), x: 860, y: 480, zoom: 1.25},
          {f: b('chaos'), x: 880, y: 500, zoom: 1.1, rot: 0},
          {f: b('language', 0.3), x: 960, y: 540, zoom: 1},
        ]}
      >
        <svg width={1920} height={1080} style={{position: 'absolute', overflow: 'visible', transform: `rotate(${wobble}deg)`}}>
          <Stretcher opacity={1 - progress(frame, b('language', 0.1), 30)} y={progress(frame, b('language', 0.1), 30, ease.in) * 300} />
          <Mannequin view={view} x={fx} y={fy} scale={sc} rotate={rot} scaleX={sx} shadow={rise > 0.9} />
          {frame < b('language', 0.6) ? (
            <g opacity={1 - progress(frame, b('language', 0), 14)}>
              <circle cx={wound.x} cy={wound.y - 4} r={9} fill={color.danger} opacity={appear(frame, b('patient', 1.4)).opacity} />
              <Pulse c={pt(wound.x, wound.y - 4)} r={22} start={b('patient', 1.6)} out={b('above', 0.2)} stroke={color.danger} />
              <SvgText x={wound.x} y={wound.y - 64} text="wound" start={b('patient', 2.0)} out={b('above')} size={34} fill={color.danger} family="Inter" weight={700} />
              {/* ambiguity: "above" toward ceiling vs toward head */}
              <DrawnArrow d={`M${wound.x} ${wound.y - 30} L${wound.x} ${wound.y - 250}`} start={b.at('above', 0.42)} dur={22} out={b('chaos')} stroke={color.accent} />
              <SvgText x={wound.x} y={wound.y - 300} text="toward the ceiling?" start={b.at('above', 0.5)} out={b('chaos')} size={36} fill={color.accent} />
              <DrawnArrow d={`M${wound.x - 30} ${wound.y - 6} L${wound.x - 290} ${wound.y - 6}`} start={b.at('above', 0.72)} dur={22} out={b('chaos')} stroke={color.coronal} />
              <SvgText x={wound.x - 300} y={wound.y - 60} text="toward the head?" start={b.at('above', 0.78)} out={b('chaos')} size={36} fill={color.coronal} anchor="middle" />
              {chaos
                ? chaosArrows.map(([ang, l, txt, c], i) => {
                    const a = ((ang as number) * Math.PI) / 180;
                    const st = b('chaos', 0.25 + i * 0.28);
                    const end = pt(wound.x + Math.cos(a) * (l as number), wound.y + Math.sin(a) * (l as number));
                    return (
                      <g key={i}>
                        <DrawnArrow d={`M${wound.x + Math.cos(a) * 26} ${wound.y + Math.sin(a) * 26} L${end.x} ${end.y}`} start={st} dur={12} stroke={c as string} width={5} head={20} />
                        <SvgText x={end.x + Math.cos(a) * 46} y={end.y + Math.sin(a) * 34} text={txt as string} start={st + 6} size={28} fill={c as string} />
                      </g>
                    );
                  })
                : null}
            </g>
          ) : null}
        </svg>
      </Camera>
      {/* the written note */}
      <div style={{position: 'absolute', left: 960 - 330, top: 90, width: 660, textAlign: 'center', opacity: quote.opacity, transform: `translateY(${quote.y}px) rotate(-1.5deg)`}}>
        <div style={{display: 'inline-block', background: '#F4F0E6', color: '#22303B', borderRadius: 10, padding: '20px 34px', boxShadow: '0 20px 50px rgba(0,0,0,0.4)', fontFamily: 'Inter', fontSize: 40, fontWeight: 600, fontStyle: 'italic'}}>
          “Wound <span style={{background: 'rgba(255,181,71,0.55)', padding: '0 6px', borderRadius: 4}}>above</span> the navel.”
        </div>
      </div>
      {pillars.map((p, i) => {
        const a = appear(frame, p.at, {dy: 30});
        const glow = frame > b('fluent') ? 0.5 + 0.5 * Math.sin((frame - b('fluent')) / 8 - i) : 0;
        return (
          <div key={i} style={{position: 'absolute', left: 1040, top: 220 + i * 230, width: 720, height: 190, display: 'flex', alignItems: 'center', gap: 34, padding: '0 36px', boxSizing: 'border-box', borderRadius: 26, background: color.panel, border: `3px solid ${glow > 0 ? `rgba(255,181,71,${0.25 + glow * 0.5})` : color.panelLine}`, opacity: a.opacity, transform: `translateX(${(1 - a.p) * 60}px)`}}>
            <Icon kind={p.icon} size={120} />
            <div>
              <div style={{...type.h3, color: color.text}}>{p.title}</div>
              <div style={{...type.body, fontSize: 32, color: color.textDim, marginTop: 6}}>{p.sub}</div>
            </div>
          </div>
        );
      })}
    </SceneShell>
  );
};

/* ───────────────────────── 2 · TITLE & OBJECTIVES ───────────────────────── */

export const Objectives: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats('objectives');
  const t = appear(frame, b('title'), {dur: 24, dy: 40});
  const move = progress(frame, b('o1', -0.2), 26, ease.inOut);
  const rows: Array<{icon: IconKind; text: string; beat: string}> = [
    {icon: 'figure', text: 'Define the standard anatomical position', beat: 'o1'},
    {icon: 'planes', text: 'Describe anatomical planes & body sections', beat: 'o2'},
    {icon: 'arrows', text: 'Identify terms of position & direction', beat: 'o3'},
    {icon: 'move', text: 'Describe basic movements with correct terms', beat: 'o4'},
    {icon: 'case', text: 'Apply them to clinical & anatomical examples', beat: 'o5'},
  ];
  const current = rows.reduce((acc, r, i) => (frame >= b(r.beat) ? i : acc), -1);
  return (
    <SceneShell id="objectives" chapter={0}>
      <div style={{position: 'absolute', left: lerp(160, 200, move), top: lerp(330, 80, move), opacity: t.opacity, transform: `translateY(${t.y}px) scale(${lerp(1, 0.44, move)})`, transformOrigin: '0 0'}}>
        <Kicker style={{fontSize: 30}}>Lecture 1 · Anatomy &amp; Embryology</Kicker>
        <div style={{...type.hero, fontSize: 150, color: color.text, marginTop: 24}}>
          Introduction
          <br />
          to Anatomy
        </div>
        <div style={{height: 10, width: 260 * progress(frame, b('title', 0.3), 30, ease.out), background: color.accent, borderRadius: 6, marginTop: 34}} />
      </div>
      <div style={{position: 'absolute', left: 200, top: 345, opacity: appear(frame, b('o1', -0.1)).opacity}}>
        <Kicker color={color.textDim} style={{marginBottom: 30}}>By the end of this lecture you can</Kicker>
        {rows.map((r, i) => {
          const s = pop(frame, b(r.beat));
          const a = appear(frame, b(r.beat), {dy: 24});
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 36, height: 120, opacity: a.opacity * (i === current ? 1 : 0.5), transform: `translateY(${a.y}px)`}}>
              <div style={{width: 104, height: 104, borderRadius: 26, background: i === current ? 'rgba(255,181,71,0.12)' : color.panel, border: `3px solid ${i === current ? color.accent : color.panelLine}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.7 + s * 0.3})`}}>
                <Icon kind={r.icon} size={78} />
              </div>
              <div style={{...type.h3, fontSize: 50, color: color.text}}>{r.text}</div>
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
};

/* ───────────────────────── 3 · WHAT IS ANATOMY ───────────────────────── */

const FIG = {x: 960, y: 1010, s: 1};
const heartStage = pt(FIG.x + HEART_CENTER.x * FIG.s, FIG.y + HEART_CENTER.y * FIG.s);

export const WhatIsAnatomy: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats('whatIsAnatomy');
  const clipId = useSvgId('wia');
  // word
  const wordA = appear(frame, b('word', 0.1), {out: b('began', 0.2), dy: 30});
  const slice = progress(frame, b.at('word', 0.38), 18, ease.inOut);
  const split = progress(frame, b.at('word', 0.38) + 14, 22, ease.out);
  const chips = appear(frame, b.at('word', 0.55));
  const dissect = appear(frame, b.at('word', 0.82));
  // body
  const bodyA = appear(frame, b('began', 0.3), {dur: 24, dy: 40});
  const open = progress(frame, b('began', 2.4), 34, ease.inOut);
  const lensIn = progress(frame, b.at('micro', 0.45), 22, ease.out);
  const lensOut = progress(frame, b('stay'), 20, ease.in);
  const toCell = progress(frame, b('cyto', -0.1), 30, ease.inOut);
  const lens = lensIn * (1 - lensOut);
  const scaleText = frame < b('micro') ? '≈ 30 cm' : frame < b.at('micro', 0.45) ? '≈ 1 cm' : frame < b('cyto') ? '≈ 100 µm' : frame < b('stay') ? '≈ 10 µm' : '≈ 30 cm';
  const scaleA = appear(frame, b('gross'), {out: b.end('stay', 0.4)});
  return (
    <SceneShell id="whatIsAnatomy" chapter={0}>
      {/* the word, sliced */}
      {wordA.opacity > 0 ? (
        <AbsoluteFill style={{opacity: wordA.opacity}}>
          <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center'}}>
            {[0, 1].map((half) => (
              <div key={half} style={{position: half ? 'absolute' : 'relative', top: 0, left: 0, right: 0, ...type.hero, fontSize: 230, letterSpacing: 6, color: color.text, clipPath: half === 0 ? 'inset(0 0 50% 0)' : 'inset(50% 0 0 0)', transform: `translate(${(half ? 1 : -1) * split * 26}px, ${(half ? 1 : -1) * split * 22}px)`}}>
                ANATOMY
              </div>
            ))}
            <svg width={1920} height={300} style={{position: 'absolute', top: 0, left: 0}}>
              <line x1={300} y1={128} x2={300 + 1320 * slice} y2={128} stroke={color.danger} strokeWidth={5} strokeLinecap="round" opacity={1 - split * 0.7} />
              <path d={`M${300 + 1320 * slice} 128 l-60 -14 l-10 14 z`} fill="#D7E1E8" opacity={slice > 0 && slice < 1 ? 1 : 0} />
            </svg>
          </div>
          <div style={{position: 'absolute', top: 610, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 60, opacity: chips.opacity, transform: `translateY(${chips.y}px)`}}>
            {[['ana', 'up'], ['tomē', 'cutting']].map(([g, e]) => (
              <div key={g} style={{padding: '22px 40px', borderRadius: 22, background: color.panel, border: `3px solid ${color.panelLine}`, textAlign: 'center'}}>
                <div style={{...type.h2, color: color.accent, fontStyle: 'italic'}}>{g}</div>
                <div style={{...type.body, color: color.textDim}}>“{e}”</div>
              </div>
            ))}
          </div>
          <div style={{position: 'absolute', top: 820, left: 0, right: 0, textAlign: 'center', ...type.h2, color: color.text, opacity: dissect.opacity, transform: `translateY(${dissect.y}px)`}}>
            cutting up <span style={{color: color.accent}}>=</span> dissection
          </div>
        </AbsoluteFill>
      ) : null}

      {/* the body, opened, and the dive to microscopic scale */}
      <Camera
        keys={[
          {f: b('began'), x: 960, y: 560, zoom: 1.0},
          {f: b('began', 1.8), x: 960, y: 470, zoom: 1.55},
          {f: b('gross', 0.5), x: 960, y: 470, zoom: 1.55},
          {f: b('micro', 0.2), x: heartStage.x, y: heartStage.y, zoom: 1.6},
          {f: b.at('micro', 0.5), x: heartStage.x, y: heartStage.y, zoom: 5.5},
          {f: b('stay', 0.1), x: heartStage.x, y: heartStage.y, zoom: 5.5},
          {f: b('stay', 1.2), x: 960, y: 560, zoom: 1.0},
        ]}
      >
        <svg width={1920} height={1080} style={{position: 'absolute', overflow: 'visible', opacity: bodyA.opacity}}>
          <defs>
            <clipPath id={clipId}>
              <rect x={FIG.x - 95 * open} y={FIG.y - 730} width={190 * open} height={310} rx={20 * open} />
            </clipPath>
          </defs>
          <Mannequin view="front" x={FIG.x} y={FIG.y} scale={FIG.s} />
          <g clipPath={`url(#${clipId})`}>
            <rect x={FIG.x - 95} y={FIG.y - 730} width={190} height={310} fill="#5A2E2A" />
            <g transform={`translate(${FIG.x} ${FIG.y}) scale(${FIG.s})`}>
              <Organs highlight={frame > b('micro') ? 'heart' : undefined} />
            </g>
          </g>
          <DrawnPath d={`M${FIG.x} ${FIG.y - 728} L${FIG.x} ${FIG.y - 430}`} start={b('began', 1.2)} dur={30} out={b('began', 2.6)} stroke={color.danger} width={4} dash={10} />
          {open > 0.95 ? (
            <g>
              <Label anchor={pt(heartStage.x, heartStage.y)} at={pt(heartStage.x + 170, heartStage.y - 90)} text="Heart" start={b.at('gross', 0.55)} out={b('micro', 0.4)} size={30} />
              <Label anchor={pt(FIG.x - 60, FIG.y - 640)} at={pt(FIG.x - 230, FIG.y - 700)} text="Lung" start={b.at('gross', 0.4)} out={b('micro', 0.4)} size={30} />
              <Label anchor={pt(FIG.x - 50, FIG.y - 540)} at={pt(FIG.x - 230, FIG.y - 520)} text="Liver" start={b.at('gross', 0.62)} out={b('micro', 0.4)} size={30} />
              <Label anchor={pt(FIG.x + 50, FIG.y - 535)} at={pt(FIG.x + 230, FIG.y - 500)} text="Stomach" start={b.at('gross', 0.7)} out={b('micro', 0.4)} size={30} />
            </g>
          ) : null}
        </svg>
      </Camera>

      {/* gross anatomy tag */}
      <TagCard icon="figure" title="Gross anatomy" sub="macroscopic · naked eye" start={b.at('gross', 0.5)} out={b('micro', 0.3)} x={120} y={200} />
      {/* microscope lens */}
      {lens > 0 ? (
        <div style={{position: 'absolute', left: 960 - 330, top: 540 - 330, width: 660, height: 660, borderRadius: 330, overflow: 'hidden', border: `10px solid ${color.text}`, boxShadow: '0 0 0 14px rgba(0,0,0,0.35), 0 40px 100px rgba(0,0,0,0.5)', transform: `scale(${lens})`, opacity: Math.min(1, lens * 1.4)}}>
          <div style={{position: 'absolute', inset: 0, transform: `scale(${1 + toCell * 2.5})`, opacity: 1 - toCell}}>
            <TissuePattern size={660} />
          </div>
          <div style={{position: 'absolute', inset: 0, transform: `scale(${0.4 + toCell * 0.6})`, opacity: toCell}}>
            <Cell size={660} />
          </div>
        </div>
      ) : null}
      <TagCard icon="microscope" title="Microscopic anatomy" sub="needs a microscope" start={b.at('micro', 0.6)} out={b('stay')} x={120} y={150} />
      <TagCard icon="microscope" title="Histology" sub="the study of tissues" start={b('histo', 0.2)} out={b('stay')} x={1300} y={300} accent={frame >= b('cyto') ? color.textFaint : color.accent} />
      <TagCard icon="microscope" title="Cytology" sub="the study of cells" start={b('cyto', 0.2)} out={b('stay')} x={1300} y={560} />
      <TagCard icon="figure" title="Our level: gross" sub="what we can see & dissect" start={b('stay', 1.2)} x={1240} y={420} />
      {/* scale bar */}
      <div style={{position: 'absolute', left: 1520, top: 960, width: 320, textAlign: 'center', opacity: scaleA.opacity}}>
        <div style={{height: 6, background: color.text, borderRadius: 3, margin: '0 60px'}} />
        <div style={{...type.small, color: color.textDim, marginTop: 10}}>{scaleText}</div>
      </div>
    </SceneShell>
  );
};

const TagCard: React.FC<{icon: IconKind; title: string; sub: string; start: number; out?: number; x: number; y: number; accent?: string}> = ({icon, title, sub, start, out, x, y, accent = color.accent}) => {
  const frame = useCurrentFrame();
  const a = appear(frame, start, {out, dy: 24});
  if (a.opacity <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 26, padding: '22px 34px 22px 24px', borderRadius: 24, background: color.panel, border: `3px solid ${accent}`, opacity: a.opacity, transform: `translateY(${a.y}px)`}}>
      <Icon kind={icon} size={84} tint={accent} />
      <div>
        <div style={{...type.h3, fontSize: 46, color: color.text}}>{title}</div>
        <div style={{...type.body, fontSize: 30, color: color.textDim}}>{sub}</div>
      </div>
    </div>
  );
};

/* ───────────────────────── 4 · ROADMAP ───────────────────────── */

export const RoadmapScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats('roadmap');
  const head = appear(frame, b('route'), {dy: 20});
  return (
    <SceneShell id="roadmap" chapter={0}>
      <div style={{position: 'absolute', top: 170, left: 0, right: 0, textAlign: 'center', opacity: head.opacity, transform: `translateY(${head.y}px)`}}>
        <Kicker>The route</Kicker>
        <div style={{...type.h1, color: color.text, marginTop: 14}}>A shared language, in five stops</div>
      </div>
      <Roadmap reveal={[b('s1'), b('s2'), b('s3'), b('s4'), b('s5')]} drawStart={b('route', 0.2)} active={undefined} />
    </SceneShell>
  );
};
