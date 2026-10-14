import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {content} from '../content';
import {easeInOut, easeOut, glide, ramp} from '../components/anim';
import {MissingAsset} from '../components/MissingAsset';
import {TapRipple} from '../components/TapRipple';
import {COLORS, SHADOW} from '../theme';
import {Reveal, caps, serif} from './parts';

const CW = 920;
const CH = 960;

// 6.8 – 9.7 s · The real site, full-bleed in a large card: scroll + zoom to the
// « Meilleures catégories » row, tap, then the real category menu.
export const EJourney: React.FC = () => {
  const f = useCurrentFrame();
  const {home, menu, homeCategories} = content.screens;
  const enter = glide(f, 0);
  const k = CW / 780;
  const focus = ramp(f, 10, 40, easeInOut);
  const rowY = (homeCategories?.y ?? 840) * k;
  const ty = -Math.max(0, rowY - 260) * focus;
  const zoom = 1 + 0.12 * focus;
  const menuIn = ramp(f, 50, 60, easeOut);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 80, top: 270}}>
        <Reveal at={2} out={78}>
          <div style={serif(100)}>Si ce n'est pas élégant,</div>
        </Reveal>
        <Reveal at={30} out={79} style={{marginTop: 10}}>
          <div style={caps(50, COLORS.blue, 800)}>ce n'est pas Kuwej.</div>
        </Reveal>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 540,
          width: CW,
          height: CH,
          borderRadius: 44,
          overflow: 'hidden',
          boxShadow: SHADOW,
          background: COLORS.bg,
          transform: `translateY(${(1 - enter) * 1300}px) rotate(${(1 - enter) * 6}deg)`,
        }}
      >
        {home ? (
          <Img
            src={staticFile(home.src)}
            style={{position: 'absolute', left: 0, top: 0, width: CW, transformOrigin: '30% 0%', transform: `translateY(${ty}px) scale(${zoom})`}}
          />
        ) : (
          <MissingAsset label="accueil" />
        )}
        {f >= 50 && (
          <div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - menuIn) * CW}px)`, boxShadow: SHADOW}}>
            {menu ? <Img src={staticFile(menu.src)} style={{width: CW}} /> : <MissingAsset label="menu" />}
          </div>
        )}
        <TapRipple x={240} y={rowY + ty + 170} at={42} size={110} />
        <TapRipple x={260} y={242 * k} at={72} size={110} />
      </div>
    </AbsoluteFill>
  );
};
