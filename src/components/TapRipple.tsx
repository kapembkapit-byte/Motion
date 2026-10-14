import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {COLORS} from '../theme';
import {clamp} from './anim';

// Reference mechanic: a finger tap shown as a dot + expanding ring.
export const TapRipple: React.FC<{x: number; y: number; at: number; size?: number}> = ({x, y, at, size = 70}) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > 18) return null;
  const dot = interpolate(f, [0, 3, 10, 16], [0, 1, 1, 0], clamp);
  const ring = interpolate(f, [0, 16], [0.4, 1.8], clamp);
  const ringO = interpolate(f, [0, 4, 16], [0, 0.9, 0], clamp);
  return (
    <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', border: `5px solid ${COLORS.blue}`, opacity: ringO, transform: `scale(${ring})`}} />
      <div style={{position: 'absolute', inset: size * 0.22, borderRadius: '50%', background: COLORS.blue, opacity: dot * 0.55, transform: `scale(${0.6 + dot * 0.4})`}} />
    </div>
  );
};
