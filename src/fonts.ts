import {loadFont} from '@remotion/fonts';
import barlow700i from '@fontsource/barlow-condensed/files/barlow-condensed-latin-700-italic.woff2';
import barlow800i from '@fontsource/barlow-condensed/files/barlow-condensed-latin-800-italic.woff2';
import manrope600 from '@fontsource/manrope/files/manrope-latin-600-normal.woff2';
import manrope700 from '@fontsource/manrope/files/manrope-latin-700-normal.woff2';
import manrope800 from '@fontsource/manrope/files/manrope-latin-800-normal.woff2';
import serif400i from '@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2';

// loadFont() blocks rendering until each face is ready (no fallback-font frames).
const faces = [
  {family: 'Barlow Condensed', url: barlow700i, weight: '700', style: 'italic'},
  {family: 'Barlow Condensed', url: barlow800i, weight: '800', style: 'italic'},
  {family: 'Manrope', url: manrope600, weight: '600'},
  {family: 'Manrope', url: manrope700, weight: '700'},
  {family: 'Manrope', url: manrope800, weight: '800'},
  {family: 'Instrument Serif', url: serif400i, weight: '400', style: 'italic'},
];

for (const f of faces) {
  loadFont({format: 'woff2', ...f});
}
