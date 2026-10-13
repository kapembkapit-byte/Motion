import React from 'react';
import {Composition} from 'remotion';
import './fonts';
import {KuwejAd} from './KuwejAd';
import {FPS, H, TOTAL, W} from './timing';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="KuwejReel"
    component={KuwejAd}
    durationInFrames={TOTAL}
    fps={FPS}
    width={W}
    height={H}
    defaultProps={{showSafeZones: false}}
  />
);
