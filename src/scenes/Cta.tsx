import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {content} from '../content';
import {clamp, easeOut, glide, mix, pop, ramp} from '../components/anim';
import {Kinetic} from '../components/Kinetic';
import {Logo} from '../components/Logo';
import {Phone} from '../components/Phone';
import {Screen} from '../components/Screen';
import {COLORS, FONTS, PHONE, PHONE_Y} from '../theme';
import {CTA, ENDCARD_AT, SAFE_TOP} from '../timing';
import {catPose} from './Categories';
import {STORE_END_PHONE_X} from './Store';

export const SLOGAN = "plus mieux, c'est sûr !";

const fadeUp = (f: number, at: number) => {
  const p = pop(f, at, 15);
  return {
    opacity: interpolate(p, [0, 0.5], [0, 1], clamp),
    transform: `translateY(${(1 - p) * 50}px) scale(${0.92 + 0.08 * p})`,
  };
};

// 24 – 30 s · Cart → end card: logo, "Commande sur kuwej.com", WhatsApp, slogan.
export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const endAt = ENDCARD_AT - CTA.from; // 72
  const n = content.categories.length;
  const from = n > 0 ? catPose(n - 1) : {x: STORE_END_PHONE_X, rot: -3, tilt: 8};
  const center = glide(f, 0);
  const drop = interpolate(f, [endAt - 8, endAt + 10], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const cartIn = ramp(f, 0, 12, easeOut);
  const slogan = pop(f, endAt + 40, 14);
  const underline = ramp(f, endAt + 50, endAt + 66);

  return (
    <AbsoluteFill>
      {f < endAt + 12 && (
        <>
          <div style={{position: 'absolute', top: SAFE_TOP + 20, left: 0, right: 0, textAlign: 'center'}}>
            <Kinetic text="Commande sur" at={2} out={endAt - 8} size={76} />
            <Kinetic text="kuwej.com" at={7} out={endAt - 6} size={104} color={COLORS.blue} mode="slam" stagger={0} />
          </div>
          <Phone
            x={mix(from.x, 540, center)}
            y={mix(PHONE_Y, 2650, drop)}
            rotate={mix(from.rot, 0, center) + drop * 10}
            tiltY={mix(from.tilt, 0, center)}
            scale={interpolate(f, [0, endAt], [1, 1.06], clamp)}
          >
            <Screen shot={content.screens.cart} label="panier (cart.png)" x={PHONE.screenW * (1 - cartIn)} scroll={ramp(f, 14, endAt - 8) * 0.15} />
          </Phone>
        </>
      )}

      {f >= endAt && (
        <div
          style={{
            position: 'absolute',
            top: 470,
            left: 60,
            right: 60,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div style={fadeUp(f, endAt + 2)}>
            <Logo height={150} />
          </div>
          <div
            style={{
              ...fadeUp(f, endAt + 12),
              marginTop: 70,
              fontFamily: FONTS.sans,
              fontWeight: 800,
              fontSize: 62,
              letterSpacing: '-0.03em',
              color: COLORS.ink,
            }}
          >
            Commande sur <span style={{color: COLORS.blue}}>kuwej.com</span>
          </div>
          <div
            style={{
              ...fadeUp(f, endAt + 22),
              marginTop: 34,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              padding: '18px 34px',
              borderRadius: 999,
              background: content.whatsapp ? COLORS.ink : 'transparent',
              border: content.whatsapp ? 'none' : `3px dashed ${COLORS.ink}`,
              color: content.whatsapp ? COLORS.bg : COLORS.ink,
              fontFamily: FONTS.sans,
            }}
          >
            <span style={{fontWeight: 600, fontSize: 34}}>WhatsApp</span>
            <span style={{fontWeight: 800, fontSize: 46, letterSpacing: '-0.01em'}}>
              {content.whatsapp ?? 'numéro manquant'}
            </span>
          </div>
          <div
            style={{
              marginTop: 90,
              position: 'relative',
              opacity: interpolate(slogan, [0, 0.5], [0, 1], clamp),
              transform: `scale(${0.85 + 0.15 * slogan})`,
              filter: slogan < 0.98 ? `blur(${(1 - slogan) * 10}px)` : undefined,
              fontFamily: FONTS.serif,
              fontStyle: 'italic',
              fontSize: 98,
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
                bottom: -22,
                height: 5,
                borderRadius: 3,
                background: COLORS.ink,
                width: `${underline * 60}%`,
                transform: 'translateX(-50%)',
              }}
            />
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
