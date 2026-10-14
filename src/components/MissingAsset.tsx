import React from 'react';
import {COLORS, FONTS} from '../theme';

// Shown only while /assets has not been filled by the capture script.
// It never imitates a kuwej.com interface.
export const MissingAsset: React.FC<{label: string}> = ({label}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: COLORS.bg,
      border: `4px dashed ${COLORS.ink}`,
      opacity: 0.6,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: 30,
      fontFamily: FONTS.sans,
      fontWeight: 700,
      fontSize: 26,
      color: COLORS.ink,
    }}
  >
    Capture manquante
    <br />
    {label}
  </div>
);
