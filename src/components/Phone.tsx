import React from 'react';
import {COLORS, PHONE} from '../theme';

type Props = {
  x: number; // centre x
  y: number; // centre y
  scale?: number;
  rotate?: number; // deg, Z
  tiltY?: number; // deg, 3D yaw
  tiltX?: number; // deg, 3D pitch
  opacity?: number;
  children: React.ReactNode;
};

// Neutral smartphone mockup drawn in the brand ink colour.
export const Phone: React.FC<Props> = ({x, y, scale = 1, rotate = 0, tiltY = 0, tiltX = 0, opacity = 1, children}) => (
  <div
    style={{
      position: 'absolute',
      left: x - PHONE.w / 2,
      top: y - PHONE.h / 2,
      width: PHONE.w,
      height: PHONE.h,
      opacity,
      transform: `perspective(2200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotate(${rotate}deg) scale(${scale})`,
      borderRadius: PHONE.radius,
      background: COLORS.ink,
      boxShadow: '0 60px 90px -30px rgba(26,26,26,0.45), 0 20px 40px -20px rgba(26,26,26,0.35)',
      padding: PHONE.bezel,
      boxSizing: 'border-box',
    }}
  >
    <div
      style={{
        position: 'relative',
        width: PHONE.screenW,
        height: PHONE.screenH,
        borderRadius: PHONE.radius - PHONE.bezel,
        overflow: 'hidden',
        background: COLORS.bg,
      }}
    >
      {children}
      {/* Dynamic island */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: '50%',
          width: 120,
          height: 34,
          marginLeft: -60,
          borderRadius: 17,
          background: COLORS.ink,
        }}
      />
    </div>
  </div>
);
