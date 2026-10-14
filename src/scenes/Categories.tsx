import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {content, photoRect, type Category, type Product} from '../content';
import {clamp, easeOut, glide, mix, pop, ramp} from '../components/anim';
import {Crop} from '../components/Crop';
import {screenRectToCanvas, shotToScreen, type Pose} from '../components/geometry';
import {Headline} from '../components/Headline';
import {MissingAsset} from '../components/MissingAsset';
import {Phone} from '../components/Phone';
import {Screen} from '../components/Screen';
import {TapRipple} from '../components/TapRipple';
import {COLORS, FONTS, PHONE, SHADOW} from '../theme';
import {CATS, len} from '../timing';
import {JOURNEY_END_POSE} from './Journey';

const PHONE_Y = 1085;
const PHONE_SCALE = 0.8;

export const catPose = (i: number) =>
  i % 2 === 0 ? {x: 300, rotate: -3, tiltY: 14, cardX: 770} : {x: 780, rotate: 3, tiltY: -14, cardX: 310};

// Product photo lifts out of the phone, then name + real price tag (reference mechanic).
const ProductColumn: React.FC<{p: Product; at: number; out: number; pose: Pose; cardX: number; dir: 1 | -1; top: number; cardW: number}> = ({
  p,
  at,
  out,
  pose,
  cardX,
  dir,
  top,
  cardW: CARD_W,
}) => {
  const f = useCurrentFrame();
  if (f < at || !p.screenshot) return null;
  const rect = photoRect(p);
  const start = screenRectToCanvas(pose, p.screenshot, rect);
  const lift = glide(f, at);
  const exit = ramp(f, out, out + 7);
  const cx = mix(start.x + start.w / 2, cardX, lift);
  const cy = mix(start.y + start.h / 2, top + CARD_W / 2, lift) - exit * 260;
  const k = mix(start.w / CARD_W, 1, lift);
  const tag = pop(f, at + 9, 13);
  const name = pop(f, at + 13, 16);
  const tilt = dir * mix(0, 4, lift);
  return (
    <div style={{opacity: 1 - exit, filter: exit > 0 ? `blur(${exit * 18}px)` : undefined}}>
      <div
        style={{
          position: 'absolute',
          left: cx - CARD_W / 2,
          top: cy - CARD_W / 2,
          transform: `scale(${k}) rotate(${tilt}deg)`,
          borderRadius: 36,
          boxShadow: SHADOW,
          overflow: 'hidden',
        }}
      >
        <Crop shot={p.screenshot} rect={rect} width={CARD_W} radius={36} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: cardX - 250,
          width: 500,
          top: top + CARD_W - 46 - exit * 260,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 18,
            opacity: interpolate(tag, [0, 0.4], [0, 1], clamp),
            transform: `scale(${0.6 + 0.4 * tag}) rotate(-4deg)`,
          }}
        >
          <div
            style={{
              background: COLORS.blue,
              color: COLORS.bg,
              fontFamily: FONTS.punch,
              fontStyle: 'italic',
              fontWeight: 800,
              fontSize: (p.price.length > 8 ? 60 : 78) * (CARD_W < 350 ? 0.82 : 1),
              lineHeight: 1,
              padding: '10px 24px 12px',
              borderRadius: 10,
              boxShadow: SHADOW,
              whiteSpace: 'nowrap',
            }}
          >
            {p.price}
          </div>
          {p.oldPrice && (
            <div style={{fontFamily: FONTS.sans, fontWeight: 600, fontSize: 32, color: COLORS.ink, opacity: 0.55, textDecoration: 'line-through'}}>
              {p.oldPrice}
            </div>
          )}
        </div>
        <div
          style={{
            marginTop: CARD_W < 350 ? 14 : 22,
            fontFamily: FONTS.sans,
            fontWeight: 700,
            fontSize: (p.name.length > 40 ? 28 : 32) * (CARD_W < 350 ? 0.9 : 1),
            lineHeight: 1.22,
            color: COLORS.ink,
            opacity: interpolate(name, [0, 0.5], [0, 1], clamp),
            transform: `translateY(${(1 - name) * 30}px)`,
          }}
        >
          {p.name}
        </div>
      </div>
    </div>
  );
};

const CategorySegment: React.FC<{c: Category; i: number; n: number; seg: number}> = ({c, i, n, seg}) => {
  const t = useCurrentFrame();
  const pose = catPose(i);
  const prev = i === 0 ? JOURNEY_END_POSE : {...catPose(i - 1), y: PHONE_Y, scale: PHONE_SCALE};
  const move = glide(t, 0);
  const phonePose = {x: pose.x, y: PHONE_Y, scale: PHONE_SCALE};
  const products = c.products.slice(0, 2);
  // Two products: both cards stay up together (readable), the phone shows each page in turn.
  const two = products.length > 1;
  const starts = two ? [8, 15] : [10];
  const screenAt = two ? [8, 30] : [10];
  const dir = i % 2 === 0 ? 1 : -1;
  const catIn = ramp(t, 0, 9, easeOut);
  const idx = `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
  const nameSize = Math.min(150, Math.floor(980 / Math.max(1, c.name.length * 0.44)));
  const gridTap = c.screenshot ? shotToScreen(c.screenshot, 150, 900) : {x: 90, y: 520};

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 268, left: 50, right: 50}}>
        <Headline lines={[{text: idx, size: 40, color: COLORS.blue}]} at={0} out={seg - 8} from={dir as 1 | -1} />
        <Headline lines={[{text: c.name, size: nameSize}]} at={2} out={seg - 8} from={dir as 1 | -1} uppercase={false} />
      </div>

      <Phone
        x={mix(prev.x, pose.x, move)}
        y={mix(prev.y ?? PHONE_Y, PHONE_Y, move) + Math.sin(t / 9) * 6}
        scale={mix(prev.scale ?? PHONE_SCALE, PHONE_SCALE, move)}
        rotate={mix(prev.rotate, pose.rotate, move)}
        tiltY={mix(prev.tiltY, pose.tiltY, move)}
        tiltX={6}
      >
        <Screen
          shot={c.screenshot}
          label={c.name}
          y={PHONE.screenH * 0.7 * (1 - catIn)}
          opacity={interpolate(catIn, [0, 0.3], [0, 1], clamp)}
        />
        {products.map((p, j) => {
          const s0 = screenAt[j];
          if (t < s0) return null;
          const inP = ramp(t, s0, s0 + 8, easeOut);
          return <Screen key={j} shot={p.screenshot} label={p.name} x={dir * PHONE.screenW * (1 - inP)} />;
        })}
        <TapRipple x={gridTap.x} y={gridTap.y} at={screenAt[0] - 6} />
      </Phone>

      {products.map((p, j) => (
        <ProductColumn
          key={j}
          p={p}
          at={starts[j]}
          out={seg - 7}
          pose={phonePose}
          cardX={pose.cardX}
          dir={dir as 1 | -1}
          top={two ? [540, 1000][j] : 560}
          cardW={two ? 290 : 400}
        />
      ))}
    </AbsoluteFill>
  );
};

// 10 – 24 s · One 2 s beat per real category (Ordinateurs & Mode excluded), real products & prices.
export const Categories: React.FC = () => {
  const cats = content.categories;
  const total = len(CATS);
  if (cats.length === 0) {
    return (
      <AbsoluteFill>
        <Phone x={540} y={PHONE_Y}>
          <MissingAsset label="catégories & produits (video-content.json)" />
        </Phone>
      </AbsoluteFill>
    );
  }
  const n = cats.length;
  const bounds = cats.map((_, i) => Math.round((i * total) / n)).concat(total);
  return (
    <AbsoluteFill>
      {cats.map((c, i) => (
        <Sequence key={c.name} from={bounds[i]} durationInFrames={bounds[i + 1] - bounds[i]} layout="none">
          <CategorySegment c={c} i={i} n={n} seg={bounds[i + 1] - bounds[i]} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
