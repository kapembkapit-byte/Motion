import React from 'react';
import {useCurrentFrame} from 'remotion';
import {VOICEOVER} from '../script';
import {COLORS, FONTS} from '../theme';
import {SAFE_BOTTOM} from '../timing';
import {pop, ramp} from './anim';

// Burned-in French subtitles: ink pill, light text, kept above the bottom safe zone.
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const line = VOICEOVER.find((l) => l.caption && frame >= l.from && frame < l.to);
  if (!line) return null;
  const p = pop(frame, line.from, 18);
  const out = ramp(frame, line.to - 4, line.to);
  return (
    <div
      style={{
        position: 'absolute',
        left: 90,
        right: 90,
        bottom: 1920 - SAFE_BOTTOM + 36,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: COLORS.ink,
          color: COLORS.bg,
          fontFamily: FONTS.sans,
          fontWeight: 700,
          fontSize: 40,
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
          textAlign: 'center',
          padding: '16px 30px',
          borderRadius: 22,
          opacity: p * (1 - out),
          transform: `translateY(${(1 - p) * 24}px) scale(${0.94 + 0.06 * p})`,
        }}
      >
        {line.text}
      </div>
    </div>
  );
};
