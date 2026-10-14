import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Camera} from './components/Camera';
import {SafeZones} from './components/SafeZones';
import {Tapes} from './components/Tapes';
import {content} from './content';
import {Brand} from './scenes/Brand';
import {Categories} from './scenes/Categories';
import {End} from './scenes/End';
import {Hook} from './scenes/Hook';
import {Journey} from './scenes/Journey';
import {Offer} from './scenes/Offer';
import {Statement} from './scenes/Statement';
import {COLORS} from './theme';
import {BRAND, CATS, END, HOOK, JOURNEY, OFFER, STATEMENT, TAPES, len} from './timing';

export type KuwejAdProps = {showSafeZones: boolean};

const acts = [
  {r: HOOK, name: '0–2 s Accroche', C: Hook},
  {r: BRAND, name: '2–4.7 s Marque', C: Brand},
  {r: STATEMENT, name: '4.7–7 s Promesse', C: Statement},
  {r: JOURNEY, name: '7–10 s Parcours', C: Journey},
  {r: CATS, name: '10–24 s Catégories', C: Categories},
  {r: OFFER, name: '24–26.3 s Livraison', C: Offer},
  {r: END, name: '26.3–30 s CTA', C: End},
];

export const KuwejAd: React.FC<KuwejAdProps> = ({showSafeZones}) => (
  <AbsoluteFill style={{background: COLORS.bg, overflow: 'hidden'}}>
    <Camera>
      {acts.map(({r, name, C}) => (
        <Sequence key={name} from={r.from} durationInFrames={len(r)} name={name}>
          <C />
        </Sequence>
      ))}
      <Sequence from={TAPES.from} durationInFrames={len(TAPES)} name="Rubans">
        <Tapes y={1190} out={len(TAPES) - 12} />
      </Sequence>
    </Camera>

    {content.audio.master ? (
      <Audio src={staticFile(content.audio.master)} />
    ) : (
      <>
        {content.audio.voiceover && <Audio src={staticFile(content.audio.voiceover)} />}
        {content.audio.music && <Audio src={staticFile(content.audio.music)} volume={content.audio.musicVolume} />}
      </>
    )}

    {showSafeZones && <SafeZones />}
  </AbsoluteFill>
);
