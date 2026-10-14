import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {content, photoRect} from '../content';
import {clamp, easeIn, easeOut, pop, ramp} from '../components/anim';
import {Crop} from '../components/Crop';
import {COLORS, SHADOW} from '../theme';
import {Reveal, serif} from './parts';

const TILE = 280;
const GAP = 26;
const ORDER = [4, 1, 5, 7, 3, 0, 2, 8, 6]; // centre first, then spiral

// 0 – 1.6 s · Mosaic of real products (circles morphing into squares) + blue band title.
export const EHook: React.FC = () => {
  const f = useCurrentFrame();
  const products = content.categories.flatMap((c) => c.products).filter((p) => p.screenshot).slice(0, 9);
  const band = ramp(f, 8, 18, easeOut);
  const explode = ramp(f, 34, 47, easeIn);
  const left = (1080 - (3 * TILE + 2 * GAP)) / 2;
  return (
    <AbsoluteFill>
      {products.map((p, i) => {
        const r = Math.floor(i / 3);
        const c = i % 3;
        const x = left + c * (TILE + GAP);
        const y = 480 + r * (TILE + GAP);
        const k = pop(f, 1 + ORDER.indexOf(i) * 2, 14);
        const dx = (c - 1) * 700 * explode;
        const dy = (r - 1) * 900 * explode;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x + dx,
              top: y + dy,
              transform: `scale(${interpolate(k, [0, 1], [0.3, 1])}) rotate(${(1 - k) * (i % 2 ? 14 : -14) + explode * (i % 2 ? 20 : -20)}deg)`,
              opacity: interpolate(k, [0, 0.3], [0, 1], clamp),
              filter: explode > 0 ? `blur(${explode * 14}px)` : undefined,
              boxShadow: SHADOW,
              borderRadius: interpolate(k, [0, 1], [TILE / 2, 30], clamp),
              overflow: 'hidden',
            }}
          >
            <Crop shot={p.screenshot} rect={photoRect(p)} width={TILE} />
          </div>
        );
      })}

      <div
        style={{
          position: 'absolute',
          left: -60,
          right: -60,
          top: 820,
          height: 220,
          background: COLORS.blue,
          transform: `rotate(-4deg) scaleX(${band})`,
          transformOrigin: '0% 50%',
          boxShadow: SHADOW,
        }}
      />
      <div style={{position: 'absolute', left: 0, right: 0, top: 850, display: 'flex', justifyContent: 'center', transform: 'rotate(-4deg)'}}>
        <Reveal at={12} out={38}>
          <div style={serif(132, COLORS.bg)}>Envie d'élégance ?</div>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};
