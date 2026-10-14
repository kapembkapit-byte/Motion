import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {content} from '../content';
import {clamp, easeInOut, glide, ramp} from '../components/anim';
import {Crop} from '../components/Crop';
import {TapRipple} from '../components/TapRipple';
import {COLORS, FONTS, SHADOW} from '../theme';
import {Reveal, caps, serif} from './parts';

// 21.8 – 24.6 s · « Livraison gratuite »: the site's own progress bar idea filling to 50.00$,
// then the real cart banner lifts in.
export const EOffer: React.FC = () => {
  const f = useCurrentFrame();
  const fill = ramp(f, 18, 50, easeInOut);
  const card = glide(f, 34);
  const {cart, cartOffer} = content.screens;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 80, top: 280}}>
        <Reveal at={2}>
          <div style={serif(170)}>Livraison</div>
        </Reveal>
        <Reveal at={7}>
          <div style={serif(170, COLORS.blue)}>gratuite</div>
        </Reveal>
        <Reveal at={14} style={{marginTop: 18}}>
          <div style={caps(44, COLORS.ink, 800)}>au-delà de 50.00$</div>
        </Reveal>
      </div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 860}}>
        <div style={{position: 'relative', height: 24, borderRadius: 12, background: 'rgba(26,26,26,0.14)'}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fill * 100}%`, borderRadius: 12, background: COLORS.blue}} />
          <div
            style={{
              position: 'absolute',
              left: `calc(${fill * 100}% - 22px)`,
              top: -10,
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: COLORS.blue,
              border: `6px solid ${COLORS.bg}`,
              boxShadow: SHADOW,
            }}
          />
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 22, fontFamily: FONTS.sans, fontWeight: 800, fontSize: 36, color: COLORS.ink, opacity: interpolate(fill, [0.8, 1], [0.4, 1], clamp)}}>
          50.00$
        </div>
      </div>
      {cart && cartOffer && f >= 34 && (
        <div
          style={{
            position: 'absolute',
            left: 70,
            top: 1060 + (1 - card) * 700,
            transform: `rotate(${(1 - card) * 8 - 2}deg)`,
            borderRadius: 30,
            boxShadow: SHADOW,
            opacity: interpolate(card, [0, 0.3], [0, 1], clamp),
          }}
        >
          <Crop shot={cart} rect={cartOffer} width={940} radius={30} />
          <TapRipple x={150} y={250} at={52} size={90} />
        </div>
      )}
    </AbsoluteFill>
  );
};
