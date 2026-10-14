import React from 'react';
import {Img, staticFile} from 'remotion';
import type {Shot} from '../content';
import {PHONE} from '../theme';
import {MissingAsset} from './MissingAsset';

type Props = {
  shot: Shot | null;
  label: string;
  scroll?: number; // 0 = top of page, 1 = bottom of the captured page
  zoom?: number; // soft zoom inside the screen
  x?: number; // px offset (push transitions)
  y?: number;
  opacity?: number;
};

// A real kuwej.com screenshot, fitted to the phone screen width.
export const Screen: React.FC<Props> = ({shot, label, scroll = 0, zoom = 1, x = 0, y = 0, opacity = 1}) => {
  const wrap: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    opacity,
    transform: `translate(${x}px, ${y}px)`,
    overflow: 'hidden',
  };
  if (!shot) {
    return (
      <div style={wrap}>
        <MissingAsset label={label} />
      </div>
    );
  }
  const imgH = (shot.height / shot.width) * PHONE.screenW;
  const maxShift = Math.max(0, imgH - PHONE.screenH);
  return (
    <div style={wrap}>
      <Img
        src={staticFile(shot.src)}
        style={{
          width: PHONE.screenW,
          height: imgH,
          display: 'block',
          transformOrigin: '50% 0%',
          transform: `translateY(${-scroll * maxShift}px) scale(${zoom})`,
        }}
      />
    </div>
  );
};
