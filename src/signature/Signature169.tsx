import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {content, photoRect, type Product, type Shot} from '../content';
import {clamp, easeInOut, easeOut, glide, pop, ramp} from '../components/anim';
import {Crop} from '../components/Crop';
import {Logo} from '../components/Logo';
import {MissingAsset} from '../components/MissingAsset';
import {Phone} from '../components/Phone';
import {COLORS, FONTS, PHONE, SHADOW} from '../theme';
import {SLOGAN} from '../scenes/End';

// Version C « Signature » 16:9 — a shot-for-shot rebuild of the uploaded reference ad
// (same 55 s track, same cut points, same text mechanics), with Kuwej content and colours:
// reference dark-purple scenes → Kuwej blue (#0746C0, text #EDEDED, key words in bold),
// reference light scenes → #EDEDED (text in Kuwej blue like the reference's purple, key words in #1A1A1A).
export const S169_W = 1920;
export const S169_H = 1080;
export const S169_FPS = 30;
export const S169_TOTAL = 1650;
const T = (s: number) => Math.round(s * S169_FPS);

const P = content.categories.flatMap((c) => c.products).filter((p) => p.screenshot);
const byName = (part: string) => P.find((p) => p.name.includes(part)) ?? P[0];
const shotOf = (name: string): Shot | null => content.categories.find((c) => c.name === name)?.screenshot ?? null;

type Tone = 'dark' | 'light';
const BG: Record<Tone, string> = {dark: COLORS.blue, light: COLORS.bg};
const INK: Record<Tone, string> = {dark: COLORS.bg, light: COLORS.blue};
const ACCENT: Record<Tone, string> = {dark: COLORS.bg, light: COLORS.ink};

// ---------------------------------------------------------------- reference text mechanic
// Words arrive one by one at their own time, widely spaced and slightly offset, then the
// line tightens once the last word has landed; the whole line drifts upwards slowly.
type Word = {w: string; t: number; a?: boolean};
const W = (text: string, t0: number, step: number, accent: number[] = []): Word[] =>
  text.split(' ').map((w, i) => ({w, t: t0 + i * step, a: accent.includes(i)}));

const Line: React.FC<{
  f: number;
  tone: Tone;
  items: Word[];
  size?: number;
  from: number; // scene start (s) — drift reference
  align?: 'center' | 'left';
  typed?: boolean; // letter-by-letter typing instead of word pops
  style?: React.CSSProperties;
}> = ({f, tone, items, size = 88, from, align = 'center', typed = false, style}) => {
  const last = items[items.length - 1].t;
  const settle = ramp(f, T(last), T(last) + 10, easeOut);
  const drift = (f - T(from)) * -0.35;
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        alignItems: 'baseline',
        columnGap: size * (0.62 - 0.36 * settle),
        transform: `translateY(${drift}px)`,
        ...style,
      }}
    >
      {items.map((it, i) => {
        const start = T(it.t);
        const color = it.a ? ACCENT[tone] : INK[tone];
        const weight = it.a ? (tone === 'dark' ? 800 : 700) : 600;
        if (typed) {
          const chars = Math.max(0, Math.min(it.w.length, Math.floor((f - start) / 1.4) + 1));
          if (f < start) return <span key={i} style={{fontSize: size, opacity: 0}}>{it.w}</span>;
          return (
            <span key={i} style={{fontFamily: FONTS.sans, fontWeight: weight, fontSize: size, color, letterSpacing: '-0.01em', position: 'relative'}}>
              <span>{it.w.slice(0, chars)}</span>
              <span style={{opacity: 0}}>{it.w.slice(chars)}</span>
            </span>
          );
        }
        const p = pop(f, start, 16, 0.5);
        const jitter = (i % 2 ? 1 : -1) * size * 0.18 * (1 - settle);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              fontFamily: FONTS.sans,
              fontWeight: weight,
              fontSize: size,
              letterSpacing: '-0.01em',
              color,
              opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
              transform: `translateY(${(1 - p) * 14 + jitter}px)`,
            }}
          >
            {it.w}
          </span>
        );
      })}
    </div>
  );
};

const Mid: React.FC<{y?: number; children: React.ReactNode}> = ({y = 500, children}) => (
  <div style={{position: 'absolute', left: 120, right: 120, top: y}}>{children}</div>
);

const Tile: React.FC<{p: Product; size: number; style?: React.CSSProperties}> = ({p, size, style}) => (
  <div style={{borderRadius: 18, overflow: 'hidden', flexShrink: 0, boxShadow: '0 18px 40px -22px rgba(26,26,26,0.45)', ...style}}>
    <Crop shot={p.screenshot} rect={photoRect(p)} width={size} />
  </div>
);

// Large phone, cropped by the frame like in the reference.
const BigPhone: React.FC<{x: number; y: number; scale?: number; rotate?: number; children: React.ReactNode}> = ({x, y, scale = 1.8, rotate = 0, children}) => (
  <Phone x={x} y={y} scale={scale} rotate={rotate}>
    {children}
  </Phone>
);

// Screenshot inside the phone, optionally zoomed on its top (search-bar close-up) and scrolled.
const ScreenImg: React.FC<{shot: Shot | null; label: string; zoom?: number; y?: number; x?: number; opacity?: number}> = ({shot, label, zoom = 1, y = 0, x = 0, opacity = 1}) => (
  <div style={{position: 'absolute', inset: 0, overflow: 'hidden', opacity, transform: `translate(${x}px, ${y}px)`}}>
    {shot ? (
      <Img src={staticFile(shot.src)} style={{width: PHONE.screenW, display: 'block', transformOrigin: '50% 0%', transform: `scale(${zoom})`}} />
    ) : (
      <MissingAsset label={label} />
    )}
  </div>
);

// ---------------------------------------------------------------- scenes (times = reference cuts)
type Scene = {from: number; to: number; tone: Tone; C: React.FC<{f: number}>};

// 0 – 3.03 · two rows of products sliding in opposite directions + typed lines
const S1: React.FC<{f: number}> = ({f}) => {
  const row = [...P, ...P, ...P, ...P];
  const Row: React.FC<{y: number; dir: 1 | -1}> = ({y, dir}) => (
    <div style={{position: 'absolute', top: y, left: 0, display: 'flex', gap: 30, transform: `translateX(${dir > 0 ? -60 - f * 8.5 : -1500 + f * 8.5}px)`}}>
      {row.map((p, i) => (
        <Tile key={i} p={p} size={300} />
      ))}
    </div>
  );
  return (
    <>
      <Row y={40} dir={1} />
      <Row y={750} dir={-1} />
      <Mid y={490}>
        {f < T(1.2) ? (
          <Line f={f} tone="light" from={0} items={W('Ce que tu aimes', 0.0, 0.2)} />
        ) : (
          <Line f={f} tone="light" from={1.2} items={W('Ce que tu cherches depuis toujours', 1.2, 0.16, [3, 4])} />
        )}
      </Mid>
    </>
  );
};

// 3.03 – 4.7 · irregular ring of products around a typed line, zooming out at the end
const S2: React.FC<{f: number}> = ({f}) => {
  const ring = [...P, ...P].slice(0, 14);
  const out = ramp(f, T(4.35), T(4.7), easeInOut);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${1 - out * 0.32}) rotate(${(f - T(3.03)) * 0.05}deg)`}}>
        {ring.map((p, i) => {
          const a = (i / ring.length) * Math.PI * 2 + 0.2;
          const r = 1 + 0.08 * Math.sin(i * 2.3);
          const k = pop(f, T(3.03) + (i % 5), 14);
          const size = 270 + (i % 3) * 45;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 960 + Math.cos(a) * 760 * r - size / 2,
                top: 540 + Math.sin(a) * 360 * r - size / 2,
                transform: `scale(${k}) rotate(${((i * 37) % 24) - 12}deg)`,
              }}
            >
              <Tile p={p} size={size} />
            </div>
          );
        })}
      </div>
      <Mid y={505}>
        <Line f={f} tone="light" from={3.03} typed items={W('Tout est réuni au même endroit', 3.1, 0.17, [3, 4, 5])} size={66} />
      </Mid>
    </>
  );
};

// 4.7 – 5.9 · giant word sliding left and shrinking (« meet » → « voici »)
const S3: React.FC<{f: number}> = ({f}) => {
  const p = ramp(f, T(4.7), T(5.75), easeInOut);
  const size = interpolate(p, [0, 1], [720, 300]);
  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div
        style={{
          fontFamily: FONTS.sans,
          fontWeight: 800,
          fontSize: size,
          letterSpacing: '-0.045em',
          lineHeight: 1,
          color: COLORS.bg,
          whiteSpace: 'nowrap',
          transform: `translateX(${(1 - p) * 820}px)`,
        }}
      >
        voici
      </div>
    </div>
  );
};

// 5.9 – 8.0 · logo zooms down to size, then « kuwej.com » is typed
const S4: React.FC<{f: number}> = ({f}) => {
  const z = ramp(f, T(5.9), T(6.8), easeOut);
  const drift = (f - T(5.9)) * -0.25;
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 380 + drift, display: 'flex', justifyContent: 'center', transform: `scale(${2.2 - 1.2 * z})`}}>
        <Logo width={620} />
      </div>
      {f >= T(6.9) && (
        <Mid y={620 + drift}>
          <Line f={f} tone="dark" from={6.9} typed items={W('kuwej.com', 7.0, 0.1)} size={56} />
        </Mid>
      )}
    </>
  );
};

// 8.0 – 9.37 · tilted phone rising from bottom-left + two-line text on the right
const S5: React.FC<{f: number}> = ({f}) => {
  const g = glide(f, T(8.05));
  return (
    <>
      <BigPhone x={600 - (1 - g) * 300} y={980 + (1 - g) * 900} rotate={-20 + (1 - g) * -14}>
        <ScreenImg shot={content.screens.home} label="accueil" y={-(f - T(8.05)) * 0.6} />
      </BigPhone>
      <div style={{position: 'absolute', left: 1040, top: 400}}>
        <Line f={f} tone="dark" from={8.0} align="left" items={W('Une nouvelle façon', 8.25, 0.14)} />
        {f >= T(8.75) && <Line f={f} tone="dark" from={8.0} align="left" items={W("d'acheter en ligne", 8.8, 0.14, [0, 1, 2])} />}
      </div>
    </>
  );
};

// 9.37 – 13.9 · single words, centred
const S6: React.FC<{f: number}> = ({f}) => {
  const beats = [
    {t: 9.4, items: W('Casques Bluetooth', 9.42, 0.14)},
    {t: 10.6, items: W('Montres Connectées', 10.62, 0.14)},
    {t: 11.4, items: [...W('et', 11.42, 0.1), ...W('Téléphones', 11.62, 0.1)]},
    {t: 12.8, items: W('ici, à Kinshasa', 12.82, 0.18, [2])},
  ];
  const b = [...beats].reverse().find((x) => f >= T(x.t)) ?? beats[0];
  return (
    <Mid y={500}>
      <Line key={b.t} f={f} tone="light" from={b.t} items={b.items} />
    </Mid>
  );
};

// 13.9 – 16.7 · « Cherche ce que tu veux »: phone close-up on the search bar, typing, zoom out
const S7: React.FC<{f: number}> = ({f}) => {
  const rise = glide(f, T(13.95));
  const zoomOut = ramp(f, T(15.05), T(15.7), easeInOut);
  const results = ramp(f, T(15.5), T(15.8), easeOut);
  const typed = 'casque'.slice(0, Math.max(0, Math.min(6, Math.floor((f - T(14.6)) / 3))));
  const caret = Math.floor(f / 8) % 2 === 0;
  const k = PHONE.screenW / 780;
  return (
    <>
      {f < T(15.05) && (
        <Mid y={110}>
          <Line f={f} tone="dark" from={13.9} items={W('Cherche ce que tu veux', 13.95, 0.16, [0])} />
        </Mid>
      )}
      <Phone x={960} y={interpolate(zoomOut, [0, 1], [1700, 780]) + (1 - rise) * 700} scale={interpolate(zoomOut, [0, 1], [2.7, 1.1])}>
        <ScreenImg shot={content.screens.home} label="accueil" opacity={1 - results} />
        {f >= T(14.6) && results < 1 && (
          // Real search field of the home screenshot (x 24–655, y 216–296 in the 780 px capture), typed into.
          <div style={{position: 'absolute', left: 26 * k, top: 218 * k, width: 628 * k, height: 76 * k, display: 'flex', alignItems: 'center', paddingLeft: 36 * k, background: '#FFFFFF', fontFamily: 'Arial, sans-serif', fontSize: 30 * k, color: COLORS.ink, boxSizing: 'border-box'}}>
            {typed}
            <span style={{opacity: caret ? 1 : 0, marginLeft: 1}}>|</span>
          </div>
        )}
        {f >= T(15.5) && <ScreenImg shot={shotOf('Casques Bluetooth')} label="Casques Bluetooth" opacity={results} y={-(f - T(15.8)) * 0.8} />}
      </Phone>
    </>
  );
};

// 16.7 – 18.7 · « Découvre les nouveautés » + phone from the right, content scrolling
const S8: React.FC<{f: number}> = ({f}) => {
  const g = glide(f, T(16.75));
  return (
    <>
      <div style={{position: 'absolute', left: 150, top: 420}}>
        <Line f={f} tone="dark" from={16.7} align="left" items={W('Découvre', 16.75, 0.1)} size={92} />
        {f >= T(17.05) && <Line f={f} tone="dark" from={16.7} align="left" items={W('les nouveautés', 17.1, 0.2, [0, 1])} size={92} />}
      </div>
      <BigPhone x={1400 + (1 - g) * 600} y={1000 + (1 - g) * 600} rotate={(1 - g) * 10}>
        <ScreenImg shot={shotOf('Accessoires Oraimo')} label="Accessoires Oraimo" y={-Math.max(0, f - T(17.3)) * 0.9} />
      </BigPhone>
    </>
  );
};

// 18.7 – 20.2 · light statement
const S9: React.FC<{f: number}> = ({f}) => (
  <Mid y={500}>
    <Line f={f} tone="light" from={18.7} items={W('Un coup de cœur ?', 18.72, 0.17, [3, 4])} />
  </Mid>
);

// 20.2 – 24.8 · « Ajoute-le au panier »: text rises, phone rises with product page → cart
const S10: React.FC<{f: number}> = ({f}) => {
  const up = ramp(f, T(21.55), T(22.0), easeInOut);
  const rise = glide(f, T(21.4));
  const toCart = ramp(f, T(22.8), T(23.1), easeOut);
  const watch = byName('Smart Watch');
  return (
    <>
      {f < T(22.1) && (
        <div style={{position: 'absolute', left: 120, right: 120, top: 490 - up * 260 - (f >= T(21.9) ? (f - T(21.9)) * 30 : 0)}}>
          <Line f={f} tone="dark" from={20.2} items={W('Ajoute-le au panier', 20.25, 0.2, [1, 2])} />
        </div>
      )}
      {f >= T(21.35) && (
        <BigPhone x={960} y={1500 - rise * 760} scale={1.15}>
          <ScreenImg shot={watch.screenshot} label={watch.name} opacity={1 - toCart} />
          {f >= T(22.8) && <ScreenImg shot={content.screens.cart} label="panier" opacity={toCart} y={(1 - toCart) * 40} />}
        </BigPhone>
      )}
    </>
  );
};

// 24.8 – 29.37 · « Tu l'adores ? Et le prix aussi. » then phone + « Profite des promos »
const S11: React.FC<{f: number}> = ({f}) => {
  if (f < T(26.7)) {
    return (
      <Mid y={500}>
        {f < T(25.55) ? (
          <Line key="a" f={f} tone="dark" from={24.8} items={W("Tu l'adores ?", 24.85, 0.22)} />
        ) : (
          <Line key="b" f={f} tone="dark" from={25.55} items={W('Et le prix aussi ?', 25.6, 0.2, [1, 2])} />
        )}
      </Mid>
    );
  }
  const g = glide(f, T(26.75));
  return (
    <>
      <BigPhone x={820} y={900 - g * 120 + (1 - g) * 800} scale={1.5}>
        <ScreenImg shot={shotOf('Montres Connectées')} label="Montres Connectées" y={-Math.max(0, f - T(27.6)) * 0.5} />
      </BigPhone>
      <div style={{position: 'absolute', left: 1300, top: 400}}>
        <Line f={f} tone="dark" from={26.7} align="left" items={W('Profite', 26.8, 0.1)} />
        <Line f={f} tone="dark" from={26.7} align="left" items={W('des promos', 27.0, 0.18, [0, 1])} />
      </div>
    </>
  );
};

// 29.37 – 30.7 · light statement
const S12: React.FC<{f: number}> = ({f}) => (
  <Mid y={500}>
    <Line f={f} tone="light" from={29.37} items={W('Prêt à commander ?', 29.4, 0.22, [2, 3])} />
  </Mid>
);

// 30.7 – 34.7 · « Valide ta commande » → phone (real cart) + free delivery lines
const S13: React.FC<{f: number}> = ({f}) => {
  if (f < T(31.85)) {
    return (
      <Mid y={500}>
        <Line f={f} tone="dark" from={30.7} items={W('Valide ta commande', 30.75, 0.2, [2])} />
      </Mid>
    );
  }
  const g = glide(f, T(31.9));
  const second = f >= T(32.55);
  return (
    <>
      <div style={{position: 'absolute', left: 200, top: 400}}>
        {second ? (
          <>
            <Line key="c" f={f} tone="dark" from={32.55} align="left" items={W('au-delà de', 32.6, 0.15)} />
            <Line key="d" f={f} tone="dark" from={32.55} align="left" items={W('50.00$ d’achat', 32.9, 0.2, [0])} />
          </>
        ) : (
          <>
            <Line key="a" f={f} tone="dark" from={31.85} align="left" items={W('Livraison', 31.9, 0.1)} />
            <Line key="b" f={f} tone="dark" from={31.85} align="left" items={W('gratuite', 32.1, 0.1, [0])} />
          </>
        )}
      </div>
      <BigPhone x={1300} y={1150 - g * 260 + (1 - g) * 600} scale={1.45}>
        <ScreenImg shot={content.screens.cart} label="panier" y={-Math.max(0, f - T(32.6)) * 2.2} />
      </BigPhone>
    </>
  );
};

// 34.7 – 40.27 · confidence line → « Une question ? » → tilted phone + WhatsApp
const S14: React.FC<{f: number}> = ({f}) => {
  if (f < T(37.0)) {
    return (
      <Mid y={500}>
        {f < T(36.0) ? (
          <Line key="a" f={f} tone="dark" from={34.7} items={W('Commande en toute simplicité', 34.75, 0.2, [3])} />
        ) : (
          <Line key="b" f={f} tone="dark" from={36.0} items={W('Une question ?', 36.05, 0.2, [1, 2])} />
        )}
      </Mid>
    );
  }
  const g = glide(f, T(37.0));
  const chip = pop(f, T(38.1), 14);
  return (
    <>
      <BigPhone x={620 - (1 - g) * 300} y={760 + (1 - g) * 900} scale={2.0} rotate={-24 + (1 - g) * -12}>
        <ScreenImg shot={byName('Smart Watch').screenshot} label="produit" y={-Math.max(0, f - T(37.6)) * 0.7} />
      </BigPhone>
      <div style={{position: 'absolute', left: 1250, top: 380}}>
        <Line f={f} tone="dark" from={37.0} align="left" items={W('Écris-nous', 37.1, 0.12)} />
        <Line f={f} tone="dark" from={37.0} align="left" items={W('sur WhatsApp', 37.4, 0.2, [1])} />
        <div
          style={{
            marginTop: 40,
            display: 'inline-block',
            padding: '14px 34px',
            borderRadius: 999,
            border: `3px solid ${COLORS.bg}`,
            fontFamily: FONTS.sans,
            fontWeight: 800,
            fontSize: 44,
            color: COLORS.bg,
            opacity: chip,
            transform: `scale(${0.8 + 0.2 * chip})`,
            transformOrigin: '0% 50%',
          }}
        >
          {content.whatsapp ?? 'numéro manquant'}
        </div>
      </div>
    </>
  );
};

// 40.27 – 43.87 · light: the other categories
const S15: React.FC<{f: number}> = ({f}) => {
  const beats = [
    {t: 40.3, items: W('Accessoires Oraimo', 40.32, 0.15)},
    {t: 41.2, items: W('Gadgets & Accessoires', 41.22, 0.12)},
    {t: 42.1, items: W('Abonnement & streaming', 42.12, 0.12)},
    {t: 43.0, items: W('kuwej Brand', 43.02, 0.15, [0, 1])},
  ];
  const b = [...beats].reverse().find((x) => f >= T(x.t)) ?? beats[0];
  return (
    <Mid y={500}>
      <Line key={b.t} f={f} tone="light" from={b.t} items={b.items} />
    </Mid>
  );
};

// 43.87 – 48.13 · dark: « Du coup de cœur… tout se passe sur kuwej.com »
const S16: React.FC<{f: number}> = ({f}) => {
  const beats = [
    {t: 43.87, items: W('Du coup de cœur', 43.9, 0.16, [3])},
    {t: 44.75, items: W('à la commande', 44.78, 0.16, [2])},
    {t: 45.65, items: W('à la livraison', 45.68, 0.16, [2])},
    {t: 46.65, items: W('tout se passe sur kuwej.com', 46.7, 0.18, [4])},
  ];
  const b = [...beats].reverse().find((x) => f >= T(x.t)) ?? beats[0];
  return (
    <Mid y={500}>
      <Line key={b.t} f={f} tone="dark" from={b.t} items={b.items} />
    </Mid>
  );
};

// 48.13 – 55 · light end card: logo, line, two « badges », slogan
const S17: React.FC<{f: number}> = ({f}) => {
  const logo = pop(f, T(48.2), 13, 0.8);
  const line = ramp(f, T(48.6), T(48.9), easeOut);
  const badges = pop(f, T(48.9), 14);
  const slogan = ramp(f, T(50.4), T(51.0), easeOut);
  const drift = (f - T(48.13)) * -0.12;
  const pill = (bg: string, fg: string, border?: string): React.CSSProperties => ({
    background: bg,
    color: fg,
    border: border ? `3px solid ${border}` : 'none',
    fontFamily: FONTS.sans,
    fontWeight: 800,
    fontSize: 32,
    padding: '14px 30px',
    borderRadius: 16,
    boxShadow: SHADOW,
    whiteSpace: 'nowrap',
  });
  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 300 + drift}}>
      <div style={{transform: `scale(${0.6 + 0.4 * logo})`, opacity: interpolate(logo, [0, 0.3], [0, 1], clamp)}}>
        <Logo width={500} />
      </div>
      <div style={{marginTop: 34, opacity: line, fontFamily: FONTS.sans, fontWeight: 600, fontSize: 36, color: COLORS.ink}}>
        Commande dès aujourd'hui sur <span style={{color: COLORS.blue, fontWeight: 800}}>kuwej.com</span>
      </div>
      <div style={{marginTop: 30, display: 'flex', gap: 22, transform: `scale(${badges})`}}>
        <div style={pill(COLORS.ink, COLORS.bg)}>WhatsApp {content.whatsapp ?? ''}</div>
        <div style={pill(COLORS.blue, COLORS.bg)}>kuwej.com</div>
      </div>
      <div style={{marginTop: 46, clipPath: `inset(0 ${(1 - slogan) * 100}% 0 0)`, fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 76, color: COLORS.blue, whiteSpace: 'nowrap'}}>
        {SLOGAN}
      </div>
    </div>
  );
};

const SCENES: Scene[] = [
  {from: 0, to: 3.03, tone: 'light', C: S1},
  {from: 3.03, to: 4.7, tone: 'light', C: S2},
  {from: 4.7, to: 5.9, tone: 'dark', C: S3},
  {from: 5.9, to: 8.0, tone: 'dark', C: S4},
  {from: 8.0, to: 9.37, tone: 'dark', C: S5},
  {from: 9.37, to: 13.9, tone: 'light', C: S6},
  {from: 13.9, to: 16.7, tone: 'dark', C: S7},
  {from: 16.7, to: 18.7, tone: 'dark', C: S8},
  {from: 18.7, to: 20.2, tone: 'light', C: S9},
  {from: 20.2, to: 24.8, tone: 'dark', C: S10},
  {from: 24.8, to: 29.37, tone: 'dark', C: S11},
  {from: 29.37, to: 30.7, tone: 'light', C: S12},
  {from: 30.7, to: 34.7, tone: 'dark', C: S13},
  {from: 34.7, to: 40.27, tone: 'dark', C: S14},
  {from: 40.27, to: 43.87, tone: 'light', C: S15},
  {from: 43.87, to: 48.13, tone: 'dark', C: S16},
  {from: 48.13, to: 55.1, tone: 'light', C: S17},
].map((s) => ({...s, from: T(s.from), to: T(s.to)})) as Scene[];

export const Signature169: React.FC = () => {
  const f = useCurrentFrame();
  const sc = SCENES.find((s) => f >= s.from && f < s.to) ?? SCENES[SCENES.length - 1];
  return (
    <AbsoluteFill style={{background: BG[sc.tone], overflow: 'hidden'}}>
      <sc.C f={f} />
      <Audio src={staticFile('audio/music-signature.wav')} />
    </AbsoluteFill>
  );
};
