import React from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {content, photoRect, type Category, type Product} from '../content';
import {clamp, easeIn, easeOut, pop, ramp} from '../components/anim';
import {Crop} from '../components/Crop';
import {COLORS, FONTS, SHADOW} from '../theme';
import {CATS, catBounds} from '../timing';
import {OutlineMarquee, Reveal, caps, serif} from './parts';

type Slot = {x: number; y: number; rot: number; w: number};
const slots = (n: number): Slot[] =>
  n > 1
    ? [
        {x: 300, y: 1010, rot: -7, w: 350},
        {x: 780, y: 1050, rot: 6, w: 350},
      ]
    : [{x: 740, y: 1010, rot: 4, w: 420}];

const ProductCard: React.FC<{p: Product; s: Slot; at: number; out: number}> = ({p, s, at, out}) => {
  const f = useCurrentFrame();
  const flip = pop(f, at, 15, 0.7);
  const sticker = pop(f, at + 6, 11, 0.6);
  const name = ramp(f, at + 7, at + 15, easeOut);
  const o = ramp(f, out, out + 6, easeIn);
  return (
    <div
      style={{
        position: 'absolute',
        left: s.x - s.w / 2 - o * 900,
        top: s.y - s.w / 2,
        width: s.w,
        opacity: 1 - o,
        filter: o > 0 ? `blur(${o * 16}px)` : undefined,
        transform: `perspective(1600px) rotateY(${(1 - flip) * 80}deg) rotate(${s.rot}deg)`,
      }}
    >
      <div style={{borderRadius: 32, overflow: 'hidden', boxShadow: SHADOW}}>
        <Crop shot={p.screenshot} rect={photoRect(p)} width={s.w} />
      </div>
      <div
        style={{
          position: 'absolute',
          right: -26,
          top: -30,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          transform: `scale(${sticker}) rotate(${-10 + (1 - sticker) * -40}deg)`,
        }}
      >
        <div
          style={{
            background: COLORS.blue,
            color: COLORS.bg,
            fontFamily: FONTS.punch,
            fontStyle: 'italic',
            fontWeight: 800,
            fontSize: p.price.length > 8 ? 46 : 58,
            lineHeight: 1,
            padding: '14px 24px',
            borderRadius: 999,
            boxShadow: SHADOW,
            whiteSpace: 'nowrap',
          }}
        >
          {p.price}
        </div>
        {p.oldPrice && (
          <div style={{marginTop: 6, marginRight: 14, fontFamily: FONTS.sans, fontWeight: 700, fontSize: 26, color: COLORS.ink, opacity: 0.55, textDecoration: 'line-through'}}>
            {p.oldPrice}
          </div>
        )}
      </div>
      <div
        style={{
          marginTop: 22,
          textAlign: 'center',
          fontFamily: FONTS.sans,
          fontWeight: 700,
          fontSize: p.name.length > 40 ? 24 : 27,
          lineHeight: 1.22,
          color: COLORS.ink,
          opacity: name,
          transform: `translateY(${(1 - name) * 20}px) rotate(${-s.rot}deg)`,
        }}
      >
        {p.name}
      </div>
    </div>
  );
};

const Segment: React.FC<{c: Category; i: number; n: number; seg: number}> = ({c, i, n, seg}) => {
  const f = useCurrentFrame();
  const fast = seg < 60;
  const out = seg - (fast ? 6 : 7);
  const sheet = pop(f, 0, 16, 0.7);
  const sheetOut = ramp(f, out, out + 6, easeIn);
  const products = c.products.slice(0, 2);
  const s = slots(products.length);
  const starts = products.length > 1 ? (fast ? [3, 7] : [6, 13]) : [fast ? 4 : 8];
  return (
    <AbsoluteFill>
      <OutlineMarquee text={c.name} y={1300} size={280} speed={14} opacity={0.12} />
      <div style={{position: 'absolute', left: 80, top: 262, display: 'flex', alignItems: 'flex-end', gap: 28}}>
        <Reveal at={0} out={out} dur={8}>
          <div style={{...serif(170, COLORS.blue), lineHeight: 0.9}}>{String(i + 1).padStart(2, '0')}</div>
        </Reveal>
        <div style={{paddingBottom: 14, maxWidth: 660}}>
          <Reveal at={2} out={out} dur={8}>
            <div style={caps(22)}>Catégorie {i + 1} / {n}</div>
          </Reveal>
          <Reveal at={3} out={out} dur={9}>
            <div style={{fontFamily: FONTS.sans, fontWeight: 800, fontSize: c.name.length > 18 ? 54 : 66, lineHeight: 1.04, letterSpacing: '-0.02em', color: COLORS.ink, whiteSpace: 'normal'}}>
              {c.name}
            </div>
          </Reveal>
        </div>
      </div>
      {c.screenshot && (
        <div
          style={{
            position: 'absolute',
            left: 540 - 150 + (1 - sheet) * 700 - sheetOut * 900,
            top: 540,
            width: 300,
            borderRadius: 30,
            overflow: 'hidden',
            boxShadow: SHADOW,
            opacity: interpolate(sheet, [0, 0.3], [0, 1], clamp) * (1 - sheetOut),
            transform: `perspective(1600px) rotateY(${(1 - sheet) * -50}deg) rotate(-4deg)`,
          }}
        >
          <Img src={staticFile(c.screenshot.src)} style={{width: 300, display: 'block'}} />
        </div>
      )}
      {products.map((p, j) => (
        <ProductCard key={j} p={p} s={s[j]} at={starts[j]} out={out} />
      ))}
    </AbsoluteFill>
  );
};

// 9.7 – 21.8 s · Collage per category: real category page + product cards flipping in
// with price stickers; outlined category name drifting behind.
export const ECats: React.FC = () => {
  const cats = content.categories;
  const bounds = catBounds(cats.length);
  return (
    <AbsoluteFill>
      {cats.map((c, i) => (
        <Sequence key={c.name} from={bounds[i]} durationInFrames={bounds[i + 1] - bounds[i]} layout="none">
          <Segment c={c} i={i} n={cats.length} seg={bounds[i + 1] - bounds[i]} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const CATS_FROM = CATS.from;
