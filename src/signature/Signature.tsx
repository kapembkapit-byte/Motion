import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {content, photoRect, type Product, type Shot} from '../content';
import {clamp, easeInOut, easeOut, glide, pop, ramp} from '../components/anim';
import {Crop} from '../components/Crop';
import {Logo} from '../components/Logo';
import {Phone} from '../components/Phone';
import {SafeZones} from '../components/SafeZones';
import {Screen} from '../components/Screen';
import {TapRipple} from '../components/TapRipple';
import {COLORS, FONTS, PHONE, SHADOW} from '../theme';
import {SLOGAN} from '../scenes/End';

// Version C « Signature »: kinetic-typography edit in the style of the uploaded reference,
// 55 s, music only. Section starts mirror the reference cuts so every change lands on the
// same musical accent (110 bpm, beat = 0.5455 s).
export const SIG_FPS = 30;
export const SIG_TOTAL = 1650; // 55 s
const T = (s: number) => Math.round(s * SIG_FPS);

// ---------------------------------------------------------------- data
const P = content.categories.flatMap((c) => c.products).filter((p) => p.screenshot);
const byName = (part: string) => P.find((p) => p.name.includes(part)) ?? P[0];
const cat = (name: string) => content.categories.find((c) => c.name === name);
const shotOf = (name: string): Shot | null => cat(name)?.screenshot ?? null;

// ---------------------------------------------------------------- typography
type Word = {w: string; t: number; a?: boolean};
const words = (text: string, t0: number, step: number, accent: number[] = []): Word[] =>
  text.split(' ').map((w, i) => ({w, t: t0 + i * step, a: accent.includes(i)}));

const Line: React.FC<{f: number; items: Word[]; size?: number; weight?: number; align?: 'center' | 'flex-start'; style?: React.CSSProperties}> = ({
  f,
  items,
  size = 88,
  weight = 700,
  align = 'center',
  style,
}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: align, columnGap: size * 0.26, ...style}}>
    {items.map((it, i) => {
      const p = pop(f, T(it.t), 14, 0.55);
      return (
        <span
          key={i}
          style={{
            display: 'inline-block',
            fontFamily: FONTS.sans,
            fontWeight: weight,
            fontSize: size,
            lineHeight: 1.14,
            letterSpacing: '-0.025em',
            color: it.a ? COLORS.blue : COLORS.ink,
            opacity: interpolate(p, [0, 0.35], [0, 1], clamp),
            transform: `translateY(${(1 - p) * 26}px) scale(${0.86 + 0.14 * p})`,
          }}
        >
          {it.w}
        </span>
      );
    })}
  </div>
);

const Center: React.FC<{children: React.ReactNode; y?: number}> = ({children, y = 860}) => (
  <div style={{position: 'absolute', left: 60, right: 60, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'}}>
    {children}
  </div>
);

const Tile: React.FC<{p: Product; size: number; round?: boolean; style?: React.CSSProperties}> = ({p, size, round, style}) => (
  <div style={{borderRadius: round ? '50%' : size * 0.12, overflow: 'hidden', boxShadow: SHADOW, flexShrink: 0, ...style}}>
    <Crop shot={p.screenshot} rect={photoRect(p)} width={size} />
  </div>
);

// Phone that rises from below (or a side) with a soft spring.
const RisingPhone: React.FC<{f: number; at: number; x: number; y: number; scale?: number; rotate?: number; tiltY?: number; from?: 'bottom' | 'left' | 'right'; children: React.ReactNode}> = ({
  f,
  at,
  x,
  y,
  scale = 0.85,
  rotate = 0,
  tiltY = 0,
  from = 'bottom',
  children,
}) => {
  const g = glide(f, T(at));
  const dx = from === 'left' ? -900 : from === 'right' ? 900 : 0;
  const dy = from === 'bottom' ? 1400 : 0;
  return (
    <Phone x={x + dx * (1 - g)} y={y + dy * (1 - g)} scale={scale} rotate={rotate + (1 - g) * (from === 'right' ? 12 : -12)} tiltY={tiltY}>
      {children}
    </Phone>
  );
};

// ---------------------------------------------------------------- sections
type Sec = {from: number; to: number; C: React.FC<{f: number}>};

// 0 – 3.03 s · two rows of real products scrolling + « Ce que tu aimes, ce qui te ressemble »
const S1: React.FC<{f: number}> = ({f}) => {
  const row = [...P, ...P, ...P];
  const R: React.FC<{y: number; dir: 1 | -1}> = ({y, dir}) => (
    <div style={{position: 'absolute', top: y, left: 0, display: 'flex', gap: 24, transform: `translateX(${dir > 0 ? -f * 7 : -1800 + f * 7}px)`}}>
      {row.map((p, i) => (
        <Tile key={i} p={p} size={250} />
      ))}
    </div>
  );
  return (
    <>
      <R y={360} dir={1} />
      <R y={1240} dir={-1} />
      <Center y={850}>
        {f < T(1.73) ? (
          <Line f={f} items={words('Ce que tu aimes,', 0.1, 0.273, [3])} />
        ) : (
          <Line f={f} items={words('ce qui te ressemble', 1.73, 0.273, [3])} />
        )}
      </Center>
    </>
  );
};

// 3.03 – 4.7 s · ring of products around « Tout est au même endroit. »
const S2: React.FC<{f: number}> = ({f}) => {
  const ring = P.slice(0, 10);
  return (
    <>
      {ring.map((p, i) => {
        const a = (i / ring.length) * Math.PI * 2 - Math.PI / 2 + (f - T(3.03)) * 0.006;
        const k = pop(f, T(3.03) + i * 2, 13);
        return (
          <div key={i} style={{position: 'absolute', left: 540 + Math.cos(a) * 430 - 105, top: 930 + Math.sin(a) * 560 - 105, transform: `scale(${k}) rotate(${(i % 2 ? 6 : -6) * k}deg)`}}>
            <Tile p={p} size={210} />
          </div>
        );
      })}
      <Center y={860}>
        <Line f={f} items={words('Tout est au même endroit.', 3.13, 0.273, [3, 4])} size={76} style={{maxWidth: 540}} />
      </Center>
    </>
  );
};

// 4.7 – 6.0 s · giant word crossing the frame
const S3: React.FC<{f: number}> = ({f}) => {
  const p = ramp(f, T(4.7), T(6.0), easeInOut);
  return (
    <div
      style={{
        position: 'absolute',
        top: 640,
        left: 0,
        whiteSpace: 'nowrap',
        fontFamily: FONTS.sans,
        fontWeight: 800,
        fontSize: 620,
        letterSpacing: '-0.05em',
        lineHeight: 1,
        color: COLORS.blue,
        transform: `translateX(${1150 - p * 3300}px)`,
      }}
    >
      voici
    </div>
  );
};

// 6.0 – 8.0 s · logo reveal
const S4: React.FC<{f: number}> = ({f}) => {
  const p = pop(f, T(6.05), 12, 0.8);
  return (
    <>
      <div style={{position: 'absolute', top: 760, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${0.4 + 0.6 * p})`, opacity: interpolate(p, [0, 0.3], [0, 1], clamp)}}>
        <Logo width={720} />
      </div>
      <Center y={1040}>
        <Line f={f} items={words('Kinshasa', 6.9, 0.2)} size={44} weight={600} />
      </Center>
    </>
  );
};

// 8.0 – 9.37 s · « Une nouvelle façon d'acheter en ligne » + phone
const S5: React.FC<{f: number}> = ({f}) => (
  <>
    <Center y={300}>
      <Line f={f} items={words('Une nouvelle façon', 8.05, 0.15)} size={80} />
      <Line f={f} items={words("d'acheter en ligne", 8.6, 0.16, [0, 1, 2])} size={80} />
    </Center>
    <RisingPhone f={f} at={8.0} x={560} y={1150} rotate={-9} tiltY={14} from="left">
      <Screen shot={content.screens.home} label="accueil" />
    </RisingPhone>
  </>
);

// Category « word + product » beat (used by S6 and S16)
const CatBeat: React.FC<{f: number; at: number; name: string; p?: Product; extra?: Product[]}> = ({f, at, name, p, extra}) => {
  const k = pop(f, T(at), 13);
  return (
    <>
      {p && (
        <div style={{position: 'absolute', top: 470, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${k}) translateY(${(1 - k) * 60}px)`}}>
          <Tile p={p} size={340} round />
        </div>
      )}
      {extra && (
        <div style={{position: 'absolute', top: 520, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 30}}>
          {extra.map((e, i) => {
            const kk = pop(f, T(at) + i * 3, 13);
            return <Tile key={i} p={e} size={220} round style={{transform: `scale(${kk}) translateY(${(1 - kk) * 60}px)`}} />;
          })}
        </div>
      )}
      <Center y={900}>
        <Line f={f} items={words(name, at, 0.137, name.split(' ').map((_, i) => i))} size={name.length > 18 ? 76 : 96} weight={800} />
      </Center>
    </>
  );
};

// 9.37 – 13.9 s · categories one by one
const S6: React.FC<{f: number}> = ({f}) => {
  const beats = [
    {at: 9.46, name: 'Casques Bluetooth', p: byName('OpenLoop')},
    {at: 10.55, name: 'Montres Connectées', p: byName('Smart Watch')},
    {at: 11.64, name: 'Téléphones', p: byName('IPhone')},
  ];
  if (f >= T(12.73)) {
    return (
      <>
        <CatBeat f={f} at={12.73} name="et bien plus encore" extra={[byName('Boom'), byName('Apple One'), byName('Coque Airpods Pro')]} />
        <Center y={1060}>
          <Line f={f} items={words('ici, à Kinshasa', 13.3, 0.137, [2])} size={56} weight={600} />
        </Center>
      </>
    );
  }
  const b = [...beats].reverse().find((x) => f >= T(x.at)) ?? beats[0];
  return <CatBeat key={b.name} f={f} at={b.at} name={b.name} p={b.p} />;
};

// 13.9 – 16.7 s · search + browse a real category page
const S7: React.FC<{f: number}> = ({f}) => {
  const home = content.screens.home;
  const sw = ramp(f, T(15.07), T(15.07) + 8, easeOut);
  const lift = ramp(f, T(15.07), T(15.6), easeInOut);
  return (
    <>
      {f < T(15.07) && (
        <Center y={300}>
          <Line f={f} items={words('Cherche ce que tu veux', 13.96, 0.2, [0])} size={80} />
        </Center>
      )}
      <Phone x={540} y={1250 - lift * 230 + (1 - glide(f, T(14.05))) * 1300} scale={0.95 + lift * 0.05}>
        <Screen shot={home} label="accueil" opacity={1 - sw} />
        {f >= T(15.07) && <Screen shot={shotOf('Casques Bluetooth')} label="Casques Bluetooth" y={PHONE.screenH * (1 - sw)} />}
        {home && <TapRipple x={PHONE.screenW * 0.42} y={(95 * PHONE.screenW) / 780} at={T(14.6)} size={80} />}
      </Phone>
    </>
  );
};

// 16.7 – 18.7 s · « Découvre les nouveautés » + tilted phone
const S8: React.FC<{f: number}> = ({f}) => (
  <>
    <div style={{position: 'absolute', left: 70, top: 320}}>
      <Line f={f} items={words('Découvre', 16.75, 0.2)} size={92} align="flex-start" />
      <Line f={f} items={words('les nouveautés', 17.02, 0.2, [0, 1])} size={92} align="flex-start" />
    </div>
    <RisingPhone f={f} at={16.75} x={640} y={1150} rotate={10} tiltY={-16} from="right">
      <Screen shot={shotOf('Accessoires Oraimo')} label="Accessoires Oraimo" />
    </RisingPhone>
  </>
);

// 18.7 – 20.2 s · statement
const S9: React.FC<{f: number}> = ({f}) => (
  <Center y={880}>
    <Line f={f} items={words('Un coup de cœur ?', 18.79, 0.273, [3, 4])} size={100} />
  </Center>
);

// 20.2 – 24.8 s · product page → added to the real cart
const S10: React.FC<{f: number}> = ({f}) => {
  const up = ramp(f, T(21.2), T(21.7), easeInOut);
  const push = ramp(f, T(22.5), T(22.5) + 9, easeOut);
  const watch = byName('Smart Watch');
  return (
    <>
      <div style={{position: 'absolute', left: 60, right: 60, top: 880 - up * 590, display: 'flex', justifyContent: 'center'}}>
        <Line f={f} items={words('Ajoute-le au panier', 20.24, 0.273, [1, 2])} size={88} />
      </div>
      {f >= T(21.1) && (
        <RisingPhone f={f} at={21.2} x={540} y={1130} scale={0.9}>
          <Screen shot={watch.screenshot} label={watch.name} />
          {f >= T(22.5) && <Screen shot={content.screens.cart} label="panier" x={PHONE.screenW * (1 - push)} />}
          <TapRipple x={PHONE.screenW * 0.5} y={PHONE.screenH * 0.62} at={T(22.2)} size={90} />
        </RisingPhone>
      )}
    </>
  );
};

// 24.8 – 29.37 s · « Tu l'adores ? … Profite des promos » with real prices
const S11: React.FC<{f: number}> = ({f}) => {
  if (f < T(26.45)) {
    return (
      <Center y={880}>
        {f < T(25.6) ? (
          <Line f={f} items={words("Tu l'adores ?", 24.9, 0.273, [1])} size={100} />
        ) : (
          <Line f={f} items={words('Et le prix aussi.', 25.6, 0.2, [2])} size={100} />
        )}
      </Center>
    );
  }
  const deals = [byName('Smart Watch'), byName('OpenLoop'), byName('Boom')];
  return (
    <>
      <Center y={300}>
        <Line f={f} items={words('Profite des promos', 26.5, 0.2, [2])} size={88} />
      </Center>
      <RisingPhone f={f} at={26.5} x={300} y={1080} scale={0.72} rotate={-6} tiltY={14} from="left">
        <Screen shot={shotOf('Montres Connectées')} label="Montres Connectées" />
      </RisingPhone>
      {deals.map((p, i) => {
        const k = pop(f, T(27.1 + i * 0.55), 13);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 560,
              top: 560 + i * 300,
              width: 460,
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              padding: 18,
              borderRadius: 30,
              background: COLORS.bg,
              boxShadow: SHADOW,
              opacity: interpolate(k, [0, 0.3], [0, 1], clamp),
              transform: `translateX(${(1 - k) * 300}px) rotate(${(1 - k) * 8}deg)`,
            }}
          >
            <Tile p={p} size={130} />
            <div>
              <div style={{fontFamily: FONTS.sans, fontWeight: 800, fontSize: 52, color: COLORS.blue, letterSpacing: '-0.02em', lineHeight: 1}}>{p.price}</div>
              {p.oldPrice && (
                <div style={{fontFamily: FONTS.sans, fontWeight: 600, fontSize: 30, color: COLORS.ink, opacity: 0.5, textDecoration: 'line-through', marginTop: 6}}>{p.oldPrice}</div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};

// 29.37 – 30.7 s · statement
const S12: React.FC<{f: number}> = ({f}) => (
  <Center y={880}>
    <Line f={f} items={words('Prêt à commander ?', 29.46, 0.273, [2, 3])} size={100} />
  </Center>
);

// 30.7 – 34.7 s · real checkout page + free delivery (site banner)
const S13: React.FC<{f: number}> = ({f}) => {
  const {cart, cartOffer, checkout} = content.screens;
  const card = glide(f, T(33.25));
  return (
    <>
      <div style={{position: 'absolute', left: 70, top: 300}}>
        <Line f={f} items={words('Valide ta commande', 30.79, 0.2, [2])} size={80} align="flex-start" />
        {f >= T(32.2) && (
          <>
            <Line f={f} items={words('Livraison gratuite', 32.25, 0.2, [0, 1])} size={80} align="flex-start" />
            <Line f={f} items={words('au-delà de 50.00$', 32.75, 0.2)} size={56} weight={600} align="flex-start" />
          </>
        )}
      </div>
      <RisingPhone f={f} at={31.3} x={660} y={1170} scale={0.82} rotate={7} tiltY={-12} from="right">
        <Screen shot={checkout ?? null} label="paiement" />
      </RisingPhone>
      {cart && cartOffer && f >= T(33.25) && (
        <div style={{position: 'absolute', left: 50, top: 1180 + (1 - card) * 600, transform: `rotate(${-3 + (1 - card) * -8}deg)`, borderRadius: 26, boxShadow: SHADOW, opacity: interpolate(card, [0, 0.3], [0, 1], clamp)}}>
          <Crop shot={cart} rect={cartOffer} width={760} radius={26} />
        </div>
      )}
    </>
  );
};

const WhatsAppCta: React.FC<{f: number; at: number; tapAt: number}> = ({f, at, tapAt}) => {
  const b = pop(f, T(at), 14);
  const c = pop(f, T(at + 0.5), 14);
  const press = interpolate(f, [T(tapAt), T(tapAt) + 3, T(tapAt) + 8], [1, 0.94, 1], clamp);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{position: 'relative', transform: `scale(${b * press})`, opacity: b}}>
        <div style={{background: COLORS.blue, color: COLORS.bg, fontFamily: FONTS.sans, fontWeight: 800, fontSize: 46, padding: '26px 58px', borderRadius: 999, boxShadow: SHADOW}}>
          Commander sur WhatsApp
        </div>
        <TapRipple x={520} y={52} at={T(tapAt)} size={96} />
      </div>
      <div style={{marginTop: 26, transform: `scale(${c})`, opacity: c, padding: '12px 36px', borderRadius: 999, border: `3px solid ${COLORS.ink}`, fontFamily: FONTS.sans, fontWeight: 800, fontSize: 46, color: COLORS.ink}}>
        {content.whatsapp ?? 'numéro manquant'}
      </div>
    </div>
  );
};

// 34.7 – 40.27 s · customer service on WhatsApp (real official number)
const S14: React.FC<{f: number}> = ({f}) => {
  if (f < T(37.2)) {
    return (
      <Center y={880}>
        {f < T(36.1) ? (
          <Line f={f} items={words('Une question ?', 34.79, 0.273, [1, 2])} size={100} />
        ) : (
          <Line f={f} items={words('Le service client Kuwej', 36.15, 0.2, [3])} size={92} />
        )}
      </Center>
    );
  }
  return (
    <Center y={620}>
      <Line f={f} items={words('te répond sur WhatsApp', 37.25, 0.2, [3])} size={84} />
      <div style={{height: 70}} />
      <WhatsAppCta f={f} at={37.9} tapAt={38.9} />
    </Center>
  );
};

// 40.27 – 43.87 s · the other categories, quick-fire
const S15: React.FC<{f: number}> = ({f}) => {
  const beats = [
    {at: 40.36, name: 'Accessoires Oraimo', p: byName('PowerBox')},
    {at: 41.23, name: 'Gadgets & Accessoires', p: byName('Lumière')},
    {at: 42.1, name: 'Abonnement & streaming', p: byName('Apple One')},
    {at: 42.96, name: 'kuwej Brand', p: byName('Coque Airpods 3')},
  ];
  const b = [...beats].reverse().find((x) => f >= T(x.at)) ?? beats[0];
  return <CatBeat key={b.name} f={f} at={b.at} name={b.name} p={b.p} />;
};

// 43.87 – 48.13 s · « Du coup de cœur… à la livraison, tout se passe sur kuwej.com »
const S16: React.FC<{f: number}> = ({f}) => {
  const lines = [
    {at: 43.96, text: 'Du coup de cœur', acc: [3]},
    {at: 44.96, text: 'à la commande', acc: [2]},
    {at: 45.96, text: 'à la livraison', acc: [2]},
  ];
  if (f >= T(46.9)) {
    return (
      <Center y={830}>
        <Line f={f} items={words('tout se passe sur', 46.95, 0.16)} size={84} />
        <Line f={f} items={words('kuwej.com', 47.6, 0.2, [0])} size={130} weight={800} />
      </Center>
    );
  }
  const l = [...lines].reverse().find((x) => f >= T(x.at)) ?? lines[0];
  return (
    <Center y={880}>
      <Line key={l.text} f={f} items={words(l.text, l.at, 0.2, l.acc)} size={100} />
    </Center>
  );
};

// 48.13 – 55 s · end card
const S17: React.FC<{f: number}> = ({f}) => {
  const logo = pop(f, T(48.2), 12, 0.8);
  const slogan = ramp(f, T(50.3), T(50.9), easeOut);
  return (
    <Center y={460}>
      <div style={{transform: `scale(${0.5 + 0.5 * logo})`, opacity: interpolate(logo, [0, 0.3], [0, 1], clamp)}}>
        <Logo width={620} />
      </div>
      <div style={{height: 50}} />
      <Line f={f} items={[...words('Commande sur', 48.75, 0.18), {w: 'kuwej.com', t: 49.1, a: true}]} size={70} />
      <div style={{height: 50}} />
      <WhatsAppCta f={f} at={49.5} tapAt={51.2} />
      <div style={{marginTop: 60, clipPath: `inset(0 ${(1 - slogan) * 100}% 0 0)`, fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 104, color: COLORS.blue, whiteSpace: 'nowrap'}}>
        {SLOGAN}
      </div>
    </Center>
  );
};

const SECTIONS: Sec[] = [
  {from: 0, to: 3.03, C: S1},
  {from: 3.03, to: 4.7, C: S2},
  {from: 4.7, to: 6.0, C: S3},
  {from: 6.0, to: 8.0, C: S4},
  {from: 8.0, to: 9.37, C: S5},
  {from: 9.37, to: 13.9, C: S6},
  {from: 13.9, to: 16.7, C: S7},
  {from: 16.7, to: 18.7, C: S8},
  {from: 18.7, to: 20.2, C: S9},
  {from: 20.2, to: 24.8, C: S10},
  {from: 24.8, to: 29.37, C: S11},
  {from: 29.37, to: 30.7, C: S12},
  {from: 30.7, to: 34.7, C: S13},
  {from: 34.7, to: 40.27, C: S14},
  {from: 40.27, to: 43.87, C: S15},
  {from: 43.87, to: 48.13, C: S16},
  {from: 48.13, to: 55.1, C: S17},
].map((s) => ({...s, from: T(s.from), to: T(s.to)}));

export const SignatureAd: React.FC<{showSafeZones: boolean}> = ({showSafeZones}) => {
  const f = useCurrentFrame();
  const sec = SECTIONS.find((s) => f >= s.from && f < s.to) ?? SECTIONS[SECTIONS.length - 1];
  const fadeOut = interpolate(f, [SIG_TOTAL - 20, SIG_TOTAL - 1], [1, 0], clamp);
  return (
    <AbsoluteFill style={{background: COLORS.bg, overflow: 'hidden'}}>
      <AbsoluteFill style={{opacity: fadeOut}}>
        <sec.C f={f} />
      </AbsoluteFill>
      <Audio src={staticFile('audio/music-signature.wav')} />
      {showSafeZones && <SafeZones />}
    </AbsoluteFill>
  );
};
