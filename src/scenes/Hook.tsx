import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {content, photoRect, type Product} from '../content';
import {clamp, easeInOut, glide, mix} from '../components/anim';
import {Crop} from '../components/Crop';
import {Headline} from '../components/Headline';
import {SHADOW} from '../theme';

// Bubble paths: start off-canvas → resting spot (kept clear of the title band).
const BUBBLES = [
  {from: [-300, 200], to: [200, 470], size: 290, delay: 0},
  {from: [1400, 300], to: [880, 520], size: 250, delay: 3},
  {from: [-300, 1500], to: [170, 1330], size: 270, delay: 6},
  {from: [1400, 1700], to: [900, 1340], size: 300, delay: 2},
  {from: [600, 2300], to: [560, 1450], size: 190, delay: 8},
  {from: [700, -300], to: [640, 330], size: 170, delay: 5},
];

const Bubble: React.FC<{p: Product; i: number}> = ({p, i}) => {
  const f = useCurrentFrame();
  const b = BUBBLES[i];
  const t = glide(f, b.delay);
  const tPrev = glide(f - 1, b.delay);
  const implode = interpolate(f, [42, 56], [0, 1], {...clamp, easing: easeInOut});
  const x = mix(mix(b.from[0], b.to[0], t), 540, implode);
  const y = mix(mix(b.from[1], b.to[1], t), 900, implode);
  const speed = Math.abs(t - tPrev) * 900 + implode * (1 - implode) * 60;
  const drift = Math.sin((f + i * 9) / 9) * 10;
  const scale = (1 - implode) * (0.9 + 0.1 * t);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - b.size / 2,
        top: y - b.size / 2 + drift,
        transform: `scale(${scale}) rotate(${(1 - t) * (i % 2 ? 30 : -30)}deg)`,
        filter: speed > 1 ? `blur(${Math.min(18, speed * 0.5)}px)` : undefined,
        borderRadius: '50%',
        boxShadow: SHADOW,
        overflow: 'hidden',
      }}
    >
      <Crop shot={p.screenshot} rect={photoRect(p)} width={b.size} radius={b.size / 2} />
    </div>
  );
};

// 0 – 2 s · Hook: real products fly in with motion blur, title slams, then implodes.
export const Hook: React.FC = () => {
  const products = content.categories.map((c) => c.products[0]).filter(Boolean).slice(0, BUBBLES.length);
  return (
    <AbsoluteFill>
      {products.map((p, i) => (
        <Bubble key={i} p={p} i={i} />
      ))}
      <div style={{position: 'absolute', top: 760, left: 0, right: 0}}>
        <Headline lines={[{text: 'Envie', size: 200}, {text: "d'élégance ?", box: true, size: 150}]} at={2} stagger={10} out={44} />
      </div>
    </AbsoluteFill>
  );
};
