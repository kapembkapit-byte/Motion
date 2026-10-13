import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {content} from '../content';
import {clamp, glide, mix, pop, ramp} from '../components/anim';
import {Kinetic} from '../components/Kinetic';
import {Logo} from '../components/Logo';
import {Phone} from '../components/Phone';
import {Screen} from '../components/Screen';
import {COLORS, PHONE_Y} from '../theme';
import {SAFE_TOP} from '../timing';

// 0 – 3 s · Hook: slam title + phone whipping up from below, then the logo.
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const enter = glide(f, 3);
  const exit = ramp(f, 84, 90);
  const underline = ramp(f, 22, 34);
  const logoIn = pop(f, 54, 13);

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: SAFE_TOP + 10, left: 0, right: 0, textAlign: 'center'}}>
        <Kinetic text="L'élégance…" at={0} out={48} size={128} serif mode="slam" stagger={0} />
        <div style={{display: 'inline-block', position: 'relative'}}>
          <Kinetic text="dans ta poche ?" at={10} out={50} size={76} color={COLORS.blue} stagger={3} />
          <div
            style={{
              position: 'absolute',
              left: 0,
              bottom: -10,
              height: 7,
              borderRadius: 4,
              background: COLORS.ink,
              width: `${underline * 100}%`,
              opacity: 1 - ramp(f, 48, 56),
            }}
          />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: SAFE_TOP + 70,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: interpolate(logoIn, [0, 0.5], [0, 1], clamp) * (1 - exit),
          transform: `translateY(${-40 * exit}px) scale(${0.72 + 0.28 * logoIn})`,
        }}
      >
        <Logo height={128} />
      </div>

      <Phone
        x={540}
        y={mix(2550, PHONE_Y, enter)}
        rotate={mix(-14, 0, enter)}
        tiltX={mix(28, 0, enter)}
        scale={interpolate(f, [0, 90], [0.96, 1.035], clamp)}
      >
        <Screen shot={content.screens.home} label="accueil (home.png)" />
      </Phone>
    </AbsoluteFill>
  );
};
