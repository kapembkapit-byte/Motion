import React from 'react';
import {useCurrentFrame} from 'remotion';
import {easeIn, easeOut, ramp} from '../components/anim';
import {COLORS, FONTS} from '../theme';

// Editorial building blocks: masked line reveals, outline marquee, hairlines, wipes.

export const INK_SOFT = 'rgba(26,26,26,0.14)';

export const serif = (size: number, color: string = COLORS.ink, italic = true): React.CSSProperties => ({
  fontFamily: FONTS.serif,
  fontStyle: italic ? 'italic' : 'normal',
  fontWeight: 400,
  fontSize: size,
  lineHeight: 1.0,
  letterSpacing: '-0.015em',
  color,
  whiteSpace: 'nowrap',
});

export const caps = (size: number, color: string = COLORS.ink, weight = 700): React.CSSProperties => ({
  fontFamily: FONTS.sans,
  fontWeight: weight,
  fontSize: size,
  letterSpacing: '0.24em',
  textTransform: 'uppercase',
  color,
  whiteSpace: 'nowrap',
});

// A line that rises from behind an invisible baseline (and leaves upwards).
export const Reveal: React.FC<{at: number; out?: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  at,
  out,
  dur = 12,
  children,
  style,
}) => {
  const f = useCurrentFrame();
  const p = ramp(f, at, at + dur, easeOut);
  const o = out === undefined ? 0 : ramp(f, out, out + 9, easeIn);
  return (
    <div style={{overflow: 'hidden', paddingBottom: '0.08em', ...style}}>
      <div style={{transform: `translateY(${(1 - p) * 115 - o * 115}%) rotate(${(1 - p) * 3}deg)`, transformOrigin: '0% 100%'}}>{children}</div>
    </div>
  );
};

// Hairline that draws itself.
export const Rule: React.FC<{at: number; x: number; y: number; length: number; vertical?: boolean; dur?: number}> = ({
  at,
  x,
  y,
  length,
  vertical = false,
  dur = 16,
}) => {
  const p = ramp(useCurrentFrame(), at, at + dur, easeOut);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: vertical ? 2 : length * p,
        height: vertical ? length * p : 2,
        background: COLORS.ink,
        opacity: 0.35,
      }}
    />
  );
};

// Giant outlined text drifting behind the content.
export const OutlineMarquee: React.FC<{text: string; y: number; size?: number; speed?: number; opacity?: number}> = ({
  text,
  y,
  size = 360,
  speed = 7,
  opacity = 0.16,
}) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: 0,
        whiteSpace: 'nowrap',
        fontFamily: FONTS.punch,
        fontStyle: 'italic',
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1,
        color: 'transparent',
        WebkitTextStroke: `3px ${COLORS.ink}`,
        opacity,
        transform: `translateX(${200 - f * speed}px)`,
      }}
    >
      {Array.from({length: 4}, () => text).join('   ')}
    </div>
  );
};

// Act transition: blue then ink diagonal panels sweep across, the cut happens under cover.
export const Wipe: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const panel = (delay: number, color: string, z: number) => {
    const p = ramp(f, at - 8 + delay, at + 8 + delay, (t) => t);
    if (p <= 0 || p >= 1) return null;
    const x = -3200 + p * 4600; // fully covers the frame at p = 0.5 (the cut)
    return (
      <div
        key={color}
        style={{
          position: 'absolute',
          top: -600,
          left: x,
          width: 3000,
          height: 3200,
          background: color,
          transform: 'skewX(-18deg)',
          zIndex: z,
        }}
      />
    );
  };
  return (
    <>
      {panel(0, COLORS.blue, 1)}
      {panel(3, COLORS.ink, 2)}
    </>
  );
};
