import React from 'react';
import {Composition} from 'remotion';
import './fonts';
import {EditorialAd} from './editorial/EditorialAd';
import {SIG_FPS, SIG_TOTAL, SignatureAd} from './signature/Signature';
import {S169_FPS, S169_H, S169_TOTAL, S169_W, Signature169} from './signature/Signature169';
import {KuwejAd} from './KuwejAd';
import {FPS, H, TOTAL, W} from './timing';

export const RemotionRoot: React.FC = () => (
  <>
  <Composition
    id="KuwejReel"
    component={KuwejAd}
    durationInFrames={TOTAL}
    fps={FPS}
    width={W}
    height={H}
    defaultProps={{showSafeZones: false}}
  />
  <Composition
    id="KuwejReelSignature"
    component={SignatureAd}
    durationInFrames={SIG_TOTAL}
    fps={SIG_FPS}
    width={W}
    height={H}
    defaultProps={{showSafeZones: false}}
  />
  <Composition
    id="KuwejSignature169"
    component={Signature169}
    durationInFrames={S169_TOTAL}
    fps={S169_FPS}
    width={S169_W}
    height={S169_H}
  />
  <Composition
    id="KuwejReelAfro"
    component={EditorialAd}
    durationInFrames={TOTAL}
    fps={FPS}
    width={W}
    height={H}
    defaultProps={{showSafeZones: false}}
  />
  </>
);
