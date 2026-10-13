import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Captions} from './components/Captions';
import {SafeZones} from './components/SafeZones';
import {content} from './content';
import {Categories} from './scenes/Categories';
import {Cta} from './scenes/Cta';
import {Hook} from './scenes/Hook';
import {Store} from './scenes/Store';
import {COLORS} from './theme';
import {CATS, CTA, HOOK, STORE, len} from './timing';

export type KuwejAdProps = {showSafeZones: boolean};

export const KuwejAd: React.FC<KuwejAdProps> = ({showSafeZones}) => (
  <AbsoluteFill style={{background: COLORS.bg, overflow: 'hidden'}}>
    <Sequence from={HOOK.from} durationInFrames={len(HOOK)} name="0–3 s Hook">
      <Hook />
    </Sequence>
    <Sequence from={STORE.from} durationInFrames={len(STORE)} name="3–10 s Boutique">
      <Store />
    </Sequence>
    <Sequence from={CATS.from} durationInFrames={len(CATS)} name="10–24 s Catégories">
      <Categories />
    </Sequence>
    <Sequence from={CTA.from} durationInFrames={len(CTA)} name="24–30 s CTA">
      <Cta />
    </Sequence>

    <Captions />

    {content.audio.voiceover && <Audio src={staticFile(content.audio.voiceover)} />}
    {content.audio.music && <Audio src={staticFile(content.audio.music)} volume={content.audio.musicVolume} />}

    {showSafeZones && <SafeZones />}
  </AbsoluteFill>
);
