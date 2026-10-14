import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {content, photoRect} from '../content';
import {easeOut, pop, ramp} from '../components/anim';
import {Crop} from '../components/Crop';
import {COLORS, SHADOW} from '../theme';
import {Reveal, Rule, caps, serif} from './parts';

// 4.5 – 6.8 s · Editorial statement, left-aligned serif, drawn underline, product dots.
export const EStatement: React.FC = () => {
  const f = useCurrentFrame();
  const underline = ramp(f, 24, 38, easeOut);
  const dots = content.categories.map((c) => c.products[0]).filter((p) => p?.screenshot).slice(0, 5);
  return (
    <AbsoluteFill>
      <Rule at={0} x={990} y={420} length={980} vertical />
      <div style={{position: 'absolute', right: 30, top: 900, transform: 'rotate(90deg)', transformOrigin: '100% 0%'}}>
        <div style={caps(22)}>kuwej.com</div>
      </div>
      <div style={{position: 'absolute', left: 90, top: 440}}>
        <Reveal at={2} out={58}>
          <div style={serif(168, COLORS.ink, false)}>Ton shopping,</div>
        </Reveal>
        <Reveal at={8} out={59}>
          <div style={serif(168, COLORS.ink, false)}>en un seul</div>
        </Reveal>
        <Reveal at={14} out={60}>
          <div style={{...serif(250, COLORS.blue), position: 'relative'}}>
            geste.
            <div style={{position: 'absolute', left: 6, bottom: 18, height: 8, width: `${underline * 92}%`, background: COLORS.ink, borderRadius: 4}} />
          </div>
        </Reveal>
      </div>
      <div style={{position: 'absolute', left: 90, top: 1240, display: 'flex', gap: 22}}>
        {dots.map((p, i) => {
          const k = pop(f, 18 + i * 3, 14);
          return (
            <div key={i} style={{borderRadius: '50%', overflow: 'hidden', boxShadow: SHADOW, transform: `scale(${k}) translateY(${(1 - k) * 60}px)`}}>
              <Crop shot={p.screenshot} rect={photoRect(p)} width={150} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
