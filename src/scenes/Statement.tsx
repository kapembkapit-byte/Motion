import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ramp} from '../components/anim';
import {Headline} from '../components/Headline';
import {COLORS} from '../theme';

// 4.7 – 7 s · Statement: stacked kinetic title + rotating arc (reference mechanic).
export const Statement: React.FC = () => {
  const f = useCurrentFrame();
  const arcIn = ramp(f, 0, 20);
  const exit = ramp(f, 59, 69);
  const r = 360;
  const c = 2 * Math.PI * r;
  return (
    <AbsoluteFill>
      <svg
        width={r * 2 + 20}
        height={r * 2 + 20}
        style={{position: 'absolute', left: 540 - r - 10, top: 760 - r - 10, transform: `rotate(${f * 2.2 - 90}deg)`, opacity: 1 - exit}}
      >
        <circle cx={r + 10} cy={r + 10} r={r} fill="none" stroke={COLORS.blue} strokeWidth={6} strokeLinecap="round" strokeDasharray={`${c * 0.62 * arcIn} ${c}`} />
      </svg>
      <div style={{position: 'absolute', top: 470, left: 0, right: 0}}>
        <Headline
          lines={[{text: 'Ton shopping,'}, {text: 'en un seul'}, {text: 'geste.', box: true, size: 190}]}
          at={2}
          stagger={7}
          out={59}
          size={150}
          from={-1}
        />
      </div>
    </AbsoluteFill>
  );
};
