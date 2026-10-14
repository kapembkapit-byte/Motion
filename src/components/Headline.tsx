import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from '../theme';
import {clamp, pop, ramp} from './anim';

export type HeadLine = {text: string; box?: boolean; size?: number; color?: string; keepCase?: boolean};

type Props = {
  lines: HeadLine[];
  at: number;
  stagger?: number;
  out?: number;
  size?: number;
  align?: 'left' | 'center' | 'right';
  from?: 1 | -1; // whip direction: 1 = from the right
  uppercase?: boolean;
  style?: React.CSSProperties;
};

// Reference mechanic: heavy condensed italic titles that whip in with motion blur,
// key words on a highlight block (here brand blue with light text).
export const Headline: React.FC<Props> = ({
  lines,
  at,
  stagger = 8,
  out,
  size = 140,
  align = 'center',
  from = 1,
  uppercase = true,
  style,
}) => {
  const f = useCurrentFrame();
  const exit = out === undefined ? 0 : ramp(f, out, out + 8);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : align === 'left' ? 'flex-start' : 'flex-end',
        gap: 6,
        ...style,
      }}
    >
      {lines.map((l, i) => {
        const p = pop(f, at + i * stagger, 15, 0.6);
        const v = 1 - p; // remaining distance ≈ speed → blur
        const fs = l.size ?? size;
        const ex = exit * (1 + i * 0.15);
        const text = uppercase && !l.keepCase ? l.text.toUpperCase() : l.text;
        const inner = (
          <span
            style={{
              fontFamily: FONTS.punch,
              fontStyle: 'italic',
              fontWeight: 800,
              fontSize: fs,
              lineHeight: 0.98,
              letterSpacing: '-0.005em',
              color: l.box ? COLORS.bg : l.color ?? COLORS.ink,
              whiteSpace: 'nowrap',
            }}
          >
            {text}
          </span>
        );
        return (
          <div
            key={i}
            style={{
              position: 'relative',
              opacity: interpolate(p, [0, 0.35], [0, 1], clamp) * (1 - exit),
              transform: `translateX(${from * v * 520 - ex * 700}px) skewX(${-v * 18}deg) scaleX(${1 + v * 0.25 + ex * 0.2})`,
              filter: v > 0.02 || ex > 0.02 ? `blur(${(v + ex) * 22}px)` : undefined,
            }}
          >
            {l.box ? (
              <div style={{position: 'relative', padding: `${fs * 0.04}px ${fs * 0.16}px ${fs * 0.08}px`}}>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: COLORS.blue,
                    borderRadius: 8,
                    transform: `rotate(-2deg) scaleX(${interpolate(p, [0, 0.8], [0.2, 1], clamp)})`,
                    transformOrigin: from > 0 ? '100% 50%' : '0% 50%',
                  }}
                />
                <div style={{position: 'relative', transform: 'rotate(-2deg)'}}>{inner}</div>
              </div>
            ) : (
              inner
            )}
          </div>
        );
      })}
    </div>
  );
};
