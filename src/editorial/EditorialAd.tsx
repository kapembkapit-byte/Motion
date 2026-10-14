import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Camera, type Hit} from '../components/Camera';
import {SafeZones} from '../components/SafeZones';
import {content} from '../content';
import {COLORS} from '../theme';
import {BRAND, CATS, END, HOOK, JOURNEY, OFFER, STATEMENT, catBounds, len} from '../timing';
import {EBrand} from './EBrand';
import {ECats} from './ECats';
import {EEnd} from './EEnd';
import {EHook} from './EHook';
import {EJourney} from './EJourney';
import {EOffer} from './EOffer';
import {EStatement} from './EStatement';
import {Wipe} from './parts';

// Version B « Éditorial / Afro »: same acts, voice-over and real content, different
// visual language (mosaic, masked serif reveals, diagonal wipes, collages, orbit).
const acts = [
  {r: HOOK, name: 'Accroche', C: EHook},
  {r: BRAND, name: 'Marque', C: EBrand},
  {r: STATEMENT, name: 'Promesse', C: EStatement},
  {r: JOURNEY, name: 'Parcours', C: EJourney},
  {r: CATS, name: 'Catégories', C: ECats},
  {r: OFFER, name: 'Livraison', C: EOffer},
  {r: END, name: 'CTA', C: EEnd},
];

export const WIPES_B = [BRAND.from, STATEMENT.from, JOURNEY.from, CATS.from, OFFER.from, END.from];

export const HITS_B: Hit[] = [
  {f: 14, a: 0.02},
  {f: BRAND.from + 6, a: 0.03, shake: 7},
  {f: STATEMENT.from + 16, a: 0.025},
  ...catBounds(content.categories.length)
    .slice(0, -1)
    .map((b) => ({f: CATS.from + b + 2, a: 0.012})),
  {f: OFFER.from + 50, a: 0.018},
  {f: END.from + 4, a: 0.03, shake: 7},
  {f: 843, a: 0.018},
];

export const EditorialAd: React.FC<{showSafeZones: boolean}> = ({showSafeZones}) => (
  <AbsoluteFill style={{background: COLORS.bg, overflow: 'hidden'}}>
    <Camera hits={HITS_B}>
      {acts.map(({r, name, C}) => (
        <Sequence key={name} from={r.from} durationInFrames={len(r)} name={name}>
          <C />
        </Sequence>
      ))}
    </Camera>
    {WIPES_B.map((w) => (
      <Wipe key={w} at={w} />
    ))}
    <Audio src={staticFile('audio/master-afro.wav')} />
    {showSafeZones && <SafeZones />}
  </AbsoluteFill>
);
