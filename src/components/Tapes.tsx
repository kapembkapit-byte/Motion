import React from 'react';
import {useCurrentFrame} from 'remotion';
import {content} from '../content';
import {COLORS, FONTS} from '../theme';
import {glide, ramp} from './anim';

const Tape: React.FC<{text: string; y: number; rotate: number; bg: string; speed: number; enter: number; dir: 1 | -1; exit: number}> = ({
  text,
  y,
  rotate,
  bg,
  speed,
  enter,
  dir,
  exit,
}) => {
  const f = useCurrentFrame();
  const run = Array.from({length: 10}, () => text).join('  •  ');
  return (
    <div
      style={{
        position: 'absolute',
        left: -400,
        width: 1880,
        top: y,
        height: 86,
        background: bg,
        transform: `rotate(${rotate}deg) translateX(${dir * (1 - enter) * 1900}px) translateY(${exit * 500}px)`,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 20px 40px -20px rgba(26,26,26,0.4)',
      }}
    >
      <div
        style={{
          whiteSpace: 'nowrap',
          fontFamily: FONTS.punch,
          fontStyle: 'italic',
          fontWeight: 800,
          fontSize: 50,
          letterSpacing: '0.01em',
          color: COLORS.bg,
          transform: `translateX(${-(f * speed) - (dir > 0 ? 0 : 1200)}px)`,
        }}
      >
        {run}
      </div>
    </div>
  );
};

// Reference mechanic: two crossing ticker tapes scrolling in opposite directions.
export const Tapes: React.FC<{y: number; out: number}> = ({y, out}) => {
  const f = useCurrentFrame();
  const exit = ramp(f, out, out + 10);
  return (
    <>
      <Tape text="KUWEJ.COM  •  KINSHASA" y={y} rotate={-7} bg={COLORS.blue} speed={7} enter={glide(f, 0)} dir={1} exit={exit} />
      <Tape
        text={content.categories.map((c) => c.name.toUpperCase()).join('  •  ') || 'KUWEJ.COM'}
        y={y + 70}
        rotate={5}
        bg={COLORS.ink}
        speed={-6}
        enter={glide(f, 4)}
        dir={-1}
        exit={exit}
      />
    </>
  );
};
