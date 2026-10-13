import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {content} from '../content';
import {clamp, easeOut, glide, mix, pop, ramp} from '../components/anim';
import {Kinetic} from '../components/Kinetic';
import {Phone} from '../components/Phone';
import {Screen} from '../components/Screen';
import {COLORS, FONTS, PHONE, PHONE_Y} from '../theme';
import {SAFE_TOP, STORE, STORE_MENU_AT, len} from '../timing';

export const STORE_END_PHONE_X = 360;

// 3 – 10 s · Store: home page scroll with soft zoom, then the real category menu.
export const Store: React.FC = () => {
  const f = useCurrentFrame();
  const menuAt = STORE_MENU_AT - STORE.from; // 105
  const end = len(STORE); // 210

  const scroll = ramp(f, 10, menuAt - 6);
  const menuIn = ramp(f, menuAt, menuAt + 12, easeOut);
  const shift = glide(f, menuAt - 2);
  const zoom = interpolate(f, [0, menuAt], [1.035, 1.07], clamp) - 0.07 * shift;
  const homeShot = content.screens.homeFull ?? content.screens.home;

  const cats = content.categories.slice(0, 9);

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: SAFE_TOP + 20, left: 0, right: 0, textAlign: 'center'}}>
        {f < menuAt + 4 ? (
          <>
            <Kinetic text="Ta boutique en ligne" at={4} out={menuAt - 8} size={78} stagger={3} />
            <Kinetic text="ici, à Kinshasa" at={12} out={menuAt - 6} size={96} serif color={COLORS.blue} />
          </>
        ) : (
          <>
            <Kinetic text="Tout, en" at={menuAt + 4} out={end - 10} size={78} mode="whip" />
            <Kinetic text="quelques gestes" at={menuAt + 9} out={end - 9} size={96} serif color={COLORS.blue} mode="whip" />
          </>
        )}
      </div>

      <Phone x={mix(540, STORE_END_PHONE_X, shift)} y={PHONE_Y} scale={zoom} rotate={mix(0, -3, shift)} tiltY={mix(0, 8, shift)}>
        <Screen
          shot={homeShot}
          label="accueil (home-full.png)"
          scroll={scroll}
          x={-PHONE.screenW * 0.35 * menuIn}
          opacity={1 - menuIn * 0.6}
        />
        {f >= menuAt && (
          <Screen shot={content.screens.menu} label="menu catégories (menu.png)" x={PHONE.screenW * (1 - menuIn)} />
        )}
      </Phone>

      {/* Real category names (Ordinateurs & Mode excluded), staggered list */}
      <div style={{position: 'absolute', left: 650, right: 40, top: 560}}>
        {cats.map((c, i) => {
          const p = pop(f, menuAt + 14 + i * 4);
          const out = ramp(f, end - 10 + i * 0.5, end - 2);
          return (
            <div
              key={c.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                height: 84,
                opacity: interpolate(p, [0, 0.6], [0, 1], clamp) * (1 - out),
                transform: `translateX(${(1 - p) * 160 + out * 120}px)`,
              }}
            >
              <div style={{width: 8, height: 44, borderRadius: 4, background: COLORS.blue, flexShrink: 0}} />
              <div
                style={{
                  fontFamily: FONTS.sans,
                  fontWeight: 700,
                  fontSize: c.name.length > 16 ? 30 : 36,
                  lineHeight: 1.05,
                  letterSpacing: '-0.02em',
                  color: COLORS.ink,
                }}
              >
                {c.name}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
