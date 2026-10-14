import React from 'react';
import {Img, staticFile} from 'remotion';
import type {Rect, Shot} from '../content';
import {MissingAsset} from './MissingAsset';

// Shows one area of a real screenshot (product photo, banner…) at a given width.
export const Crop: React.FC<{shot: Shot | null; rect: Rect; width: number; radius?: number; style?: React.CSSProperties}> = ({
  shot,
  rect,
  width,
  radius = 0,
  style,
}) => {
  const k = width / rect.w;
  const height = rect.h * k;
  return (
    <div style={{position: 'relative', width, height, overflow: 'hidden', borderRadius: radius, ...style}}>
      {shot ? (
        <Img
          src={staticFile(shot.src)}
          style={{
            position: 'absolute',
            left: -rect.x * k,
            top: -rect.y * k,
            width: shot.width * k,
            height: shot.height * k,
            maxWidth: 'none',
          }}
        />
      ) : (
        <MissingAsset label="" />
      )}
    </div>
  );
};
