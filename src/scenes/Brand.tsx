import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, pop, ramp} from '../components/anim';
import {Kinetic} from '../components/Kinetic';
import {Logo} from '../components/Logo';
import {COLORS} from '../theme';

// 2 – 4.7 s · Brand reveal: logo tile pops in, positioning line, tapes sweep in (global layer).
export const Brand: React.FC = () => {
  const f = useCurrentFrame();
  const p = pop(f, 2, 12, 0.8);
  const exit = ramp(f, 70, 80);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: 470,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: interpolate(p, [0, 0.4], [0, 1], clamp) * (1 - exit),
          transform: `translateY(${-exit * 160}px) scale(${0.45 + 0.55 * p}) rotate(${(1 - p) * -10}deg)`,
          filter: p < 0.97 || exit > 0 ? `blur(${(1 - p) * 16 + exit * 16}px)` : undefined,
        }}
      >
        <Logo width={700} />
      </div>
      <div style={{position: 'absolute', top: 780, left: 0, right: 0, textAlign: 'center'}}>
        <Kinetic text="Ta boutique en ligne" at={12} out={68} size={66} />
        <Kinetic text="ici même, à Kinshasa" at={18} out={70} size={84} serif color={COLORS.blue} />
      </div>
    </AbsoluteFill>
  );
};
