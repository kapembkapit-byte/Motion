import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {content} from '../content';
import {clamp, easeOut, glide, mix, ramp} from '../components/anim';
import {Crop} from '../components/Crop';
import {screenRectToCanvas, shotToScreen} from '../components/geometry';
import {Headline} from '../components/Headline';
import {Phone} from '../components/Phone';
import {Screen} from '../components/Screen';
import {TapRipple} from '../components/TapRipple';
import {PHONE, SHADOW} from '../theme';
import {catPose} from './Categories';

// 21.8 – 24.6 s · Real cart page; the site's own free-delivery banner lifts out.
export const Offer: React.FC = () => {
  const f = useCurrentFrame();
  const n = content.categories.length;
  const from = n > 0 ? catPose(n - 1) : {x: 540, rotate: 0, tiltY: 0};
  const center = glide(f, 0);
  const drop = interpolate(f, [72, 84], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const cartIn = ramp(f, 0, 9, easeOut);
  const {cart, cartOffer} = content.screens;
  const pose = {x: 540, y: 1090, scale: 0.88};
  const lift = glide(f, 20);
  const exit = ramp(f, 70, 78);
  const tap = cart && cartOffer ? shotToScreen(cart, 390, cartOffer.y + 190) : {x: 226, y: 470};

  let card: React.ReactNode = null;
  if (cart && cartOffer && f >= 20) {
    const start = screenRectToCanvas(pose, cart, cartOffer);
    const W = 960;
    const k = mix(start.w / W, 1, lift);
    card = (
      <div
        style={{
          position: 'absolute',
          left: mix(start.x + start.w / 2, 540, lift) - W / 2,
          top: mix(start.y + start.h / 2, 1290, lift) - (cartOffer.h * W) / cartOffer.w / 2 - exit * 300,
          transform: `scale(${k}) rotate(${lift * -2}deg)`,
          borderRadius: 28,
          boxShadow: SHADOW,
          opacity: 1 - exit,
          filter: exit > 0 ? `blur(${exit * 18}px)` : undefined,
        }}
      >
        <Crop shot={cart} rect={cartOffer} width={W} radius={28} />
      </div>
    );
  }

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 280, left: 40, right: 40}}>
        <Headline lines={[{text: 'Livraison gratuite', size: 120}, {text: 'au-delà de 50.00$', box: true, size: 112}]} at={2} stagger={8} out={72} />
      </div>
      <Phone
        x={mix(from.x, pose.x, center)}
        y={mix(1085, pose.y, center) + drop * 1500}
        scale={pose.scale}
        rotate={mix(from.rotate, -3, center) + drop * 12}
        tiltY={mix(from.tiltY, -10, center)}
        tiltX={8}
      >
        <Screen shot={cart} label="panier" x={PHONE.screenW * (1 - cartIn)} />
        <TapRipple x={tap.x} y={tap.y} at={14} />
      </Phone>
      {card}
    </AbsoluteFill>
  );
};
