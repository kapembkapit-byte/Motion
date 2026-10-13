import React from 'react';
import {Img, staticFile} from 'remotion';
import {content} from '../content';
import {COLORS, FONTS} from '../theme';

// Official Kuwej logo file from kuwej.com, displayed as-is:
// proportional sizing only — no recolouring, filter or distortion.
export const Logo: React.FC<{height: number; style?: React.CSSProperties}> = ({height, style}) => {
  const logo = content.logo;
  if (!logo) {
    return (
      <div
        style={{
          height,
          padding: '0 30px',
          border: `3px dashed ${COLORS.ink}`,
          opacity: 0.6,
          display: 'flex',
          alignItems: 'center',
          fontFamily: FONTS.sans,
          fontWeight: 700,
          fontSize: 26,
          color: COLORS.ink,
          ...style,
        }}
      >
        Logo manquant
      </div>
    );
  }
  return (
    <Img
      src={staticFile(logo.src)}
      style={{height, width: (logo.width / logo.height) * height, objectFit: 'contain', ...style}}
    />
  );
};
