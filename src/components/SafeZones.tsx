import React from 'react';
import {SAFE_BOTTOM, SAFE_TOP} from '../timing';

// Preview-only overlay (render:safezones). Never part of the final export.
export const SafeZones: React.FC = () => {
  const band: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    background: 'repeating-linear-gradient(45deg, rgba(7,70,192,0.28) 0 14px, rgba(7,70,192,0.12) 14px 28px)',
  };
  return (
    <>
      <div style={{...band, top: 0, height: SAFE_TOP}} />
      <div style={{...band, top: SAFE_BOTTOM, bottom: 0}} />
    </>
  );
};
