import React from 'react';
import {Img, staticFile} from 'remotion';
import {content} from '../content';
import {COLORS, FONTS, SHADOW} from '../theme';

// Official logo file from kuwej.com (dark text + blue smiley icon on its own white
// background), shown untouched: proportional size only — no recolour, filter or crop
// of the drawing. Presented as a tile (rounded corners on its white margin + shadow).
export const Logo: React.FC<{width: number; style?: React.CSSProperties}> = ({width, style}) => {
  const logo = content.logo;
  if (!logo) {
    return (
      <div style={{width, padding: 30, border: `3px dashed ${COLORS.ink}`, opacity: 0.6, fontFamily: FONTS.sans, fontWeight: 700, fontSize: 26, color: COLORS.ink, ...style}}>
        Logo manquant
      </div>
    );
  }
  return (
    <Img
      src={staticFile(logo.src)}
      style={{width, height: (logo.height / logo.width) * width, borderRadius: width * 0.04, boxShadow: SHADOW, display: 'block', ...style}}
    />
  );
};
