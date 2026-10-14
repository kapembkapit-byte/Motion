import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {content} from '../content';
import {clamp, glide, mix, pop, ramp} from '../components/anim';
import {Headline} from '../components/Headline';
import {Logo} from '../components/Logo';
import {Phone} from '../components/Phone';
import {Screen} from '../components/Screen';
import {TapRipple} from '../components/TapRipple';
import {COLORS, FONTS, SHADOW} from '../theme';

export const SLOGAN = "plus mieux, c'est sûr !";

const fadeUp = (f: number, at: number) => {
  const p = pop(f, at, 14);
  return {
    opacity: interpolate(p, [0, 0.45], [0, 1], clamp),
    transform: `translateY(${(1 - p) * 60}px) scale(${0.9 + 0.1 * p})`,
    filter: p < 0.97 ? `blur(${(1 - p) * 10}px)` : undefined,
  };
};

// 26.3 – 30 s · End card: logo, "Commande sur kuwej.com", WhatsApp CTA with tap,
// real number, slogan; phone peeking from the bottom (reference mechanic).
export const End: React.FC = () => {
  const f = useCurrentFrame();
  const logo = glide(f, 0);
  const phone = glide(f, 6);
  const press = interpolate(f, [44, 47, 52], [1, 0.94, 1], clamp);
  const underline = ramp(f, 66, 82);
  const slogan = pop(f, 56, 14);

  return (
    <AbsoluteFill>
      <Phone x={540} y={mix(2700, 2010, phone)} scale={0.92} rotate={-7} tiltX={18}>
        <Screen shot={content.screens.home} label="accueil" />
      </Phone>

      <div style={{position: 'absolute', top: 300, left: 60, right: 60, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{opacity: interpolate(logo, [0, 0.3], [0, 1], clamp), transform: `translateY(${(1 - logo) * -260}px) rotate(${(1 - logo) * 12}deg)`}}>
          <Logo width={600} />
        </div>
        <Headline lines={[{text: 'Commande sur', size: 92}, {text: 'kuwej.com', box: true, size: 118, keepCase: true}]} at={12} stagger={6} style={{marginTop: 44}} />
        <div style={{position: 'relative', marginTop: 48, ...fadeUp(f, 30)}}>
          <div
            style={{
              background: COLORS.blue,
              color: COLORS.bg,
              fontFamily: FONTS.sans,
              fontWeight: 800,
              fontSize: 44,
              padding: '26px 56px',
              borderRadius: 999,
              boxShadow: SHADOW,
              transform: `scale(${press})`,
            }}
          >
            Commander sur WhatsApp
          </div>
          <TapRipple x={560} y={50} at={44} size={90} />
        </div>
        <div
          style={{
            ...fadeUp(f, 40),
            marginTop: 26,
            padding: '12px 34px',
            borderRadius: 999,
            border: `3px ${content.whatsapp ? 'solid' : 'dashed'} ${COLORS.ink}`,
            fontFamily: FONTS.sans,
            fontWeight: 800,
            fontSize: 44,
            color: COLORS.ink,
          }}
        >
          {content.whatsapp ?? 'numéro manquant'}
        </div>
        <div
          style={{
            marginTop: 54,
            position: 'relative',
            opacity: interpolate(slogan, [0, 0.45], [0, 1], clamp),
            transform: `scale(${0.85 + 0.15 * slogan})`,
            filter: slogan < 0.97 ? `blur(${(1 - slogan) * 12}px)` : undefined,
            fontFamily: FONTS.serif,
            fontStyle: 'italic',
            fontSize: 100,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            color: COLORS.blue,
          }}
        >
          {SLOGAN}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: -20,
              height: 5,
              borderRadius: 3,
              background: COLORS.ink,
              width: `${underline * 60}%`,
              transform: 'translateX(-50%)',
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
