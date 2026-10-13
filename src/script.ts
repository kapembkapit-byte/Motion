import {s} from './timing';

// French voice-over, split into caption chunks (frames @ 30 fps).
// `caption: false` = the same words are already on screen as titles,
// so the subtitle is hidden to avoid duplicates.
// After generating the real voice-over, adjust from/to to the audio.
export type Line = {from: number; to: number; text: string; caption: boolean};

export const VOICEOVER: Line[] = [
  // 0 – 3 s · Hook (low, intriguing)
  {from: s(0.2), to: s(2.8), text: "Et si l'élégance… tenait enfin dans ta poche ?", caption: false},
  // 3 – 10 s · Store (warm, calm)
  {from: s(3.2), to: s(4.4), text: 'Voici Kuwej.', caption: true},
  {from: s(4.4), to: s(6.4), text: 'Ta boutique en ligne, ici, à Kinshasa.', caption: true},
  {from: s(6.6), to: s(8.0), text: 'Tu ouvres… tu explores…', caption: true},
  {from: s(8.0), to: s(9.8), text: 'et tout est là, en quelques gestes.', caption: true},
  // 10 – 24 s · Categories (energy rising)
  {from: s(10.2), to: s(12.0), text: 'Des produits choisis avec soin,', caption: true},
  {from: s(12.0), to: s(13.8), text: 'des prix clairs, affichés.', caption: true},
  {from: s(14.2), to: s(16.4), text: 'Une catégorie… puis une autre…', caption: true},
  {from: s(16.4), to: s(18.8), text: 'et toujours la même exigence.', caption: true},
  {from: s(19.3), to: s(21.4), text: "Parce qu'ici, si ce n'est pas élégant…", caption: true},
  {from: s(21.4), to: s(23.7), text: "ce n'est pas Kuwej.", caption: true},
  // 24 – 30 s · CTA (enthusiastic, then confident and smiling)
  {from: s(24.2), to: s(26.6), text: 'Commande dès maintenant sur kuwej.com…', caption: false},
  {from: s(26.6), to: s(28.2), text: 'ou écris-nous sur WhatsApp.', caption: false},
  {from: s(28.4), to: s(29.8), text: "Kuwej. Plus mieux, c'est sûr !", caption: false},
];

export const VOICEOVER_TEXT = VOICEOVER.map((l) => l.text).join(' ');
