import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {content, photoRect} from '../content';
import {clamp, easeOut, pop, ramp} from '../components/anim';
import {Crop} from '../components/Crop';
import {Logo} from '../components/Logo';
import {TapRipple} from '../components/TapRipple';
import {COLORS, FONTS, SHADOW} from '../theme';
import {SLOGAN} from '../scenes/End';
import {Reveal, caps, serif} from './parts';

// 24.6 – 30 s · End card: products orbiting the logo, serif CTA, WhatsApp, slogan.
export const EEnd: React.FC = () => {
  const f = useCurrentFrame();
  const logo = pop(f, 2, 12, 0.8);
  const orbit = content.categories.map((c) => c.products[0]).filter((p) => p?.screenshot).slice(0, 7);
  const press = interpolate(f, [80, 83, 88], [1, 0.94, 1], clamp);
  const btn = pop(f, 46, 14);
  const chip = pop(f, 58, 14);
  const slogan = ramp(f, 102, 118, easeOut);
  const underline = ramp(f, 114, 130, easeOut);
  return (
    <AbsoluteFill>
      {orbit.map((p, i) => {
        const a = (i / orbit.length) * Math.PI * 2 + f * 0.018;
        const k = pop(f, 6 + i * 2, 14);
        const x = 540 + Math.cos(a) * 430;
        const y = 600 + Math.sin(a) * 200;
        const front = Math.sin(a) > 0;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - 60,
              top: y - 60,
              zIndex: front ? 2 : 0,
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: SHADOW,
              transform: `scale(${k * (0.8 + 0.25 * Math.sin(a))})`,
            }}
          >
            <Crop shot={p.screenshot} rect={photoRect(p)} width={120} />
          </div>
        );
      })}
      <div style={{position: 'absolute', top: 520, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1, transform: `scale(${0.6 + 0.4 * logo})`, opacity: interpolate(logo, [0, 0.3], [0, 1], clamp)}}>
        <Logo width={560} />
      </div>
      <div style={{position: 'absolute', top: 840, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3}}>
        <Reveal at={8}>
          <div style={serif(96)}>Commande sur</div>
        </Reveal>
        <Reveal at={14}>
          <div style={{fontFamily: FONTS.sans, fontWeight: 800, fontSize: 104, letterSpacing: '-0.03em', color: COLORS.blue, lineHeight: 1.05}}>kuwej.com</div>
        </Reveal>
        <div style={{position: 'relative', marginTop: 34, transform: `scale(${btn * press})`, opacity: btn}}>
          <div style={{background: COLORS.blue, color: COLORS.bg, fontFamily: FONTS.sans, fontWeight: 800, fontSize: 42, padding: '24px 54px', borderRadius: 999, boxShadow: SHADOW}}>
            Commander sur WhatsApp
          </div>
          <TapRipple x={540} y={48} at={80} size={90} />
        </div>
        <div style={{marginTop: 22, transform: `scale(${chip})`, opacity: chip, padding: '10px 32px', borderRadius: 999, border: `3px solid ${COLORS.ink}`, ...caps(36, COLORS.ink, 800), letterSpacing: '0.04em'}}>
          {content.whatsapp ?? 'numéro manquant'}
        </div>
        <div style={{marginTop: 46, position: 'relative', clipPath: `inset(0 ${(1 - slogan) * 100}% 0 0)`}}>
          <div style={serif(104, COLORS.blue)}>{SLOGAN}</div>
          <div style={{position: 'absolute', left: '50%', bottom: -16, height: 5, width: `${underline * 60}%`, transform: 'translateX(-50%)', background: COLORS.ink, borderRadius: 3}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
