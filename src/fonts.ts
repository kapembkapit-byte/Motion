import {loadFont} from '@remotion/fonts';
import manrope500 from '@fontsource/manrope/files/manrope-latin-500-normal.woff2';
import manrope600 from '@fontsource/manrope/files/manrope-latin-600-normal.woff2';
import manrope700 from '@fontsource/manrope/files/manrope-latin-700-normal.woff2';
import manrope800 from '@fontsource/manrope/files/manrope-latin-800-normal.woff2';
import serif400 from '@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2';
import serif400i from '@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2';

// loadFont() blocks rendering until each face is ready (no fallback-font frames).
const faces = [
  {family: 'Manrope', url: manrope500, weight: '500'},
  {family: 'Manrope', url: manrope600, weight: '600'},
  {family: 'Manrope', url: manrope700, weight: '700'},
  {family: 'Manrope', url: manrope800, weight: '800'},
  {family: 'Instrument Serif', url: serif400, weight: '400', style: 'normal'},
  {family: 'Instrument Serif', url: serif400i, weight: '400', style: 'italic'},
];

for (const f of faces) {
  loadFont({format: 'woff2', ...f});
}
