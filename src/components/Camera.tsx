import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CATS, catBounds} from '../timing';
import {content} from '../content';

// "Camera" punch-ins (and a short shake on the two big impacts), on the same
// frames as the impact / hit sound effects (scripts/audio/make_audio.py).
export type Hit = {f: number; a: number; shake?: number};
export const HITS_A: Hit[] = [
  {f: 2, a: 0.03}, // « ENVIE » slam
  {f: 50, a: 0.035, shake: 9}, // logo impact
  {f: 151, a: 0.025}, // « GESTE. »
  {f: 236, a: 0.02}, // « CE N'EST PAS KUWEJ. »
  ...catBounds(content.categories.length)
    .slice(0, -1)
    .map((b) => ({f: CATS.from + b, a: 0.012})), // each category beat
  {f: 664, a: 0.02}, // « AU-DELÀ DE 50.00$ »
  {f: 738, a: 0.035, shake: 9}, // end card impact
  {f: 752, a: 0.015}, // « kuwej.com »
  {f: 843, a: 0.018}, // slogan / final chord
];

export const Camera: React.FC<{children: React.ReactNode; hits?: Hit[]}> = ({children, hits = HITS_A}) => {
  const frame = useCurrentFrame();
  let s = 1;
  let x = 0;
  let y = 0;
  for (const h of hits) {
    const d = frame - h.f;
    if (d < 0 || d > 24) continue;
    const k = d < 2 ? d / 2 : Math.exp(-(d - 2) / 5);
    s += h.a * k;
    if (h.shake) {
      const e = Math.exp(-d / 4);
      x += Math.sin(d * 2.3) * h.shake * e;
      y += Math.cos(d * 1.9) * h.shake * 0.7 * e;
    }
  }
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translate(${x}px, ${y}px) scale(${s})`, transformOrigin: '50% 45%'}}>
      {children}
    </div>
  );
};
