import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {content} from '../content';
import {easeOut, glide, mix, ramp} from '../components/anim';
import {Crop} from '../components/Crop';
import {screenRectToCanvas, shotToScreen} from '../components/geometry';
import {Headline} from '../components/Headline';
import {Phone} from '../components/Phone';
import {Screen} from '../components/Screen';
import {TapRipple} from '../components/TapRipple';
import {PHONE, SHADOW} from '../theme';

export const JOURNEY_END_POSE = {x: 540, y: 1080, scale: 0.9, rotate: -2, tiltY: -12};

// 7 – 10 s · App journey: phone rises, tap on "Meilleures catégories" (card lifts out),
// then the real category menu, tap on the first category.
export const Journey: React.FC = () => {
  const f = useCurrentFrame();
  const enter = glide(f, 0);
  const pose = {x: 540, y: mix(2500, 1080, enter), scale: 0.9};
  const {home, menu, homeCategories} = content.screens;

  const menuIn = ramp(f, 54, 64, easeOut);
  const lift = glide(f, 20);
  const back = ramp(f, 44, 54);

  const tapHome = home && homeCategories ? shotToScreen(home, 200, homeCategories.y + 120) : {x: 120, y: 520};
  const tapMenu = menu ? shotToScreen(menu, 200, 242) : {x: 120, y: 140};

  let card: React.ReactNode = null;
  if (home && homeCategories && f >= 20 && f < 56) {
    const start = screenRectToCanvas({x: 540, y: 1080, scale: 0.9}, home, homeCategories);
    const W = 940;
    const k = mix(start.w / W, 1, lift) * (1 - back * 0.55);
    const cx = mix(start.x + start.w / 2, 540, lift);
    const cy = mix(start.y + start.h / 2, 1270, lift * (1 - back));
    card = (
      <div
        style={{
          position: 'absolute',
          left: cx - W / 2,
          top: cy - (homeCategories.h * W) / homeCategories.w / 2,
          transform: `scale(${k}) rotate(${lift * (1 - back) * -3}deg)`,
          opacity: 1 - back,
          boxShadow: SHADOW,
          borderRadius: 30,
        }}
      >
        <Crop shot={home} rect={homeCategories} width={W} radius={30} />
      </div>
    );
  }

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 280, left: 40, right: 40}}>
        <Headline lines={[{text: "Si ce n'est pas élégant…", size: 92}]} at={2} out={78} />
        <Headline lines={[{text: "ce n'est pas Kuwej.", box: true, size: 104}]} at={32} out={78} from={-1} style={{marginTop: 8}} />
      </div>

      <Phone
        x={pose.x}
        y={pose.y}
        scale={pose.scale}
        rotate={mix(8, JOURNEY_END_POSE.rotate, enter)}
        tiltY={mix(-24, JOURNEY_END_POSE.tiltY, enter)}
        tiltX={mix(26, 6, enter)}
      >
        <Screen shot={home} label="accueil" x={-PHONE.screenW * 0.3 * menuIn} opacity={1 - menuIn * 0.5} />
        {f >= 54 && <Screen shot={menu} label="menu catégories" x={PHONE.screenW * (1 - menuIn)} />}
        <TapRipple x={tapHome.x} y={tapHome.y} at={14} />
        <TapRipple x={tapMenu.x} y={tapMenu.y} at={74} />
      </Phone>

      {card}
    </AbsoluteFill>
  );
};
