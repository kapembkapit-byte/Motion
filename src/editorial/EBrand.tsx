import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, pop} from '../components/anim';
import {Logo} from '../components/Logo';
import {COLORS} from '../theme';
import {OutlineMarquee, Reveal, Rule, caps, serif} from './parts';

// 1.6 – 4.5 s · Logo on an editorial page: hairlines, labels, outlined KUWEJ drifting behind.
export const EBrand: React.FC = () => {
  const f = useCurrentFrame();
  const p = pop(f, 4, 12, 0.8);
  return (
    <AbsoluteFill>
      <OutlineMarquee text="KUWEJ" y={1130} size={420} speed={9} />
      <Rule at={2} x={80} y={360} length={920} />
      <Rule at={6} x={80} y={1440} length={920} />
      <div style={{position: 'absolute', top: 300, left: 80}}>
        <Reveal at={6}>
          <div style={caps(24)}>Kinshasa — RDC</div>
        </Reveal>
      </div>
      <div style={{position: 'absolute', top: 300, right: 80}}>
        <Reveal at={8}>
          <div style={caps(24, COLORS.blue)}>kuwej.com</div>
        </Reveal>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 470,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
          transform: `scale(${0.6 + 0.4 * p}) translateY(${(1 - p) * 60}px)`,
        }}
      >
        <Logo width={700} />
      </div>
      <div style={{position: 'absolute', top: 760, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Reveal at={14}>
          <div style={caps(40)}>Ta boutique en ligne</div>
        </Reveal>
        <Reveal at={20} style={{marginTop: 18}}>
          <div style={serif(160, COLORS.blue)}>à Kinshasa</div>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};
