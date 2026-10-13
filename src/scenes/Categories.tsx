import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {content, type Category, type Shot} from '../content';
import {clamp, easeOut, glide, mix, pop, ramp} from '../components/anim';
import {Kinetic} from '../components/Kinetic';
import {MissingAsset} from '../components/MissingAsset';
import {Phone} from '../components/Phone';
import {Screen} from '../components/Screen';
import {COLORS, FONTS, PHONE, PHONE_Y} from '../theme';
import {CATS, SAFE_TOP, len} from '../timing';
import {STORE_END_PHONE_X} from './Store';

const LEFT = {x: 395, rot: -3, tilt: 8};
const RIGHT = {x: 685, rot: 3, tilt: -8};
export const catPose = (i: number) => (i % 2 === 0 ? LEFT : RIGHT);

type Step = {shot: Shot | null; label: string; scrollTo: number};

const stepsFor = (c: Category, seg: number): Step[] => {
  const steps: Step[] = [];
  // Show the category page first only when the segment is long enough to read it.
  if (c.screenshot && (seg >= 110 || c.products.length === 0)) {
    steps.push({shot: c.screenshot, label: c.name, scrollTo: 0.25});
  }
  for (const p of c.products.slice(0, 2)) {
    steps.push({shot: p.screenshot, label: p.name, scrollTo: 0.05});
  }
  if (steps.length === 0) steps.push({shot: null, label: c.name, scrollTo: 0});
  return steps;
};

const ProductCard: React.FC<{name: string; price: string; at: number; out: number; fromLeft: boolean}> = ({
  name,
  price,
  at,
  out,
  fromLeft,
}) => {
  const f = useCurrentFrame();
  const p = pop(f, at, 15);
  const o = ramp(f, out, out + 6);
  const dir = fromLeft ? -1 : 1;
  return (
    <div
      style={{
        background: COLORS.ink,
        borderRadius: 30,
        padding: '26px 28px 28px',
        marginBottom: 22,
        boxShadow: '0 30px 60px -25px rgba(26,26,26,0.55)',
        opacity: interpolate(p, [0, 0.5], [0, 1], clamp) * (1 - o),
        transform: `translateX(${dir * ((1 - p) * 180 + o * 140)}px) rotate(${dir * (1 - p) * 4}deg)`,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.sans,
          fontWeight: 600,
          fontSize: 30,
          lineHeight: 1.18,
          color: COLORS.bg,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {name}
      </div>
      <div
        style={{
          display: 'inline-block',
          marginTop: 16,
          padding: '8px 18px',
          borderRadius: 14,
          background: COLORS.blue,
          color: COLORS.bg,
          fontFamily: FONTS.sans,
          fontWeight: 800,
          fontSize: 40,
          letterSpacing: '-0.02em',
        }}
      >
        {price}
      </div>
    </div>
  );
};

const CategorySegment: React.FC<{c: Category; i: number; n: number; seg: number; prevShot: Shot | null}> = ({
  c,
  i,
  n,
  seg,
  prevShot,
}) => {
  const t = useCurrentFrame();
  const pose = catPose(i);
  const prev = i === 0 ? {x: STORE_END_PHONE_X, rot: -3, tilt: 8} : catPose(i - 1);
  const move = glide(t, 0);
  const steps = stepsFor(c, seg);
  const stepLen = seg / steps.length;
  const dir = i % 2 === 0 ? 1 : -1; // horizontal push direction between categories
  const enter = ramp(t, 0, 12, easeOut);
  const phoneOnLeft = pose === LEFT;
  const idx = `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
  const nameSize = Math.min(104, Math.floor(960 / Math.max(1, c.name.length * 0.56)));

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: SAFE_TOP + 24, left: 70, right: 70, textAlign: phoneOnLeft ? 'left' : 'right'}}>
        <Kinetic text={idx} at={0} out={seg - 8} size={34} weight={700} color={COLORS.blue} mode="whip" style={{letterSpacing: '0.12em', marginBottom: 14}} />
        <Kinetic text={c.name} at={2} out={seg - 8} size={nameSize} mode="whip" stagger={2} />
      </div>

      <Phone
        x={mix(prev.x, pose.x, move)}
        y={PHONE_Y}
        rotate={mix(prev.rot, pose.rot, move)}
        tiltY={mix(prev.tilt, pose.tilt, move)}
        scale={interpolate(t, [0, seg], [1, 1.03], clamp)}
      >
        {prevShot && t < 12 && <Screen shot={prevShot} label="" x={-dir * PHONE.screenW * enter} />}
        {steps.map((st, k) => {
          const start = k * stepLen;
          if (t < start) return null;
          const inP = k === 0 ? enter : ramp(t, start, start + 10, easeOut);
          const scroll = interpolate(t, [start + 8, start + stepLen], [0, st.scrollTo], clamp);
          return (
            <Screen
              key={k}
              shot={st.shot}
              label={st.label}
              scroll={scroll}
              x={k === 0 ? dir * PHONE.screenW * (1 - inP) : 0}
              y={k === 0 ? 0 : PHONE.screenH * (1 - inP)}
            />
          );
        })}
      </Phone>

      <div style={{position: 'absolute', top: 1000, width: 440, left: phoneOnLeft ? 585 : 55}}>
        {c.products.slice(0, 2).map((p, j) => {
          const k = steps.findIndex((st) => st.label === p.name && st.shot === p.screenshot);
          return (
            <ProductCard
              key={j}
              name={p.name}
              price={p.price}
              at={Math.max(0, k) * stepLen + 6}
              out={seg - 7}
              fromLeft={!phoneOnLeft}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// 10 – 24 s · One segment per real category, 1–2 real products with real prices.
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
  const bounds = cats.map((_, i) => Math.round((i * total) / n));
  bounds.push(total);
  return (
    <AbsoluteFill>
      {cats.map((c, i) => {
        const prevCat = cats[i - 1];
        const prevSteps = prevCat ? stepsFor(prevCat, bounds[i] - bounds[i - 1]) : null;
        const prevShot = i === 0 ? content.screens.menu : prevSteps ? prevSteps[prevSteps.length - 1].shot : null;
        return (
          <Sequence key={c.name} from={bounds[i]} durationInFrames={bounds[i + 1] - bounds[i]} layout="none">
            <CategorySegment c={c} i={i} n={n} seg={bounds[i + 1] - bounds[i]} prevShot={prevShot} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
