import React from 'react';
import {useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from '../theme';
import {clamp, pop, ramp} from './anim';
import {interpolate} from 'remotion';

type Props = {
  text: string;
  at: number; // frame (relative to the parent Sequence) where the line starts
  out?: number; // frame where it leaves
  size: number;
  color?: string;
  serif?: boolean;
  weight?: number;
  stagger?: number; // frames between words
  style?: React.CSSProperties;
  mode?: 'rise' | 'slam' | 'whip';
};

// Word-by-word text animation (rise / slam / whip) + clean exit upwards.
export const Kinetic: React.FC<Props> = ({
  text,
  at,
  out,
  size,
  color = COLORS.ink,
  serif = false,
  weight = 800,
  stagger = 3,
  style,
  mode = 'rise',
}) => {
  const frame = useCurrentFrame();
  const words = text.split(' ');
  const exit = out === undefined ? 0 : ramp(frame, out, out + 8);
  return (
    <div
      style={{
        fontFamily: serif ? FONTS.serif : FONTS.sans,
        fontStyle: serif ? 'italic' : 'normal',
        fontWeight: serif ? 400 : weight,
        fontSize: size,
        lineHeight: 1.04,
        letterSpacing: serif ? '-0.01em' : '-0.035em',
        color,
        opacity: 1 - exit,
        transform: `translateY(${-50 * exit}px)`,
        filter: exit > 0 ? `blur(${exit * 8}px)` : undefined,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const p = pop(frame, at + i * stagger);
        const o = interpolate(p, [0, 0.6], [0, 1], clamp);
        let t = '';
        if (mode === 'rise') t = `translateY(${(1 - p) * size * 0.6}px)`;
        if (mode === 'slam') t = `scale(${1.7 - 0.7 * p})`;
        if (mode === 'whip') t = `translateX(${(1 - p) * 220}px) skewX(${(1 - p) * -14}deg)`;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              whiteSpace: 'pre',
              opacity: o,
              transform: t,
              filter: p < 0.98 ? `blur(${(1 - p) * 10}px)` : undefined,
            }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </div>
  );
};
