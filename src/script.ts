import {CATS} from './timing';

// French voice-over (72 words). Every line is also on screen as a kinetic title
// (the reference uses big kinetic titles as its subtitles), so no extra subtitle pill.
// After generating the real voice-over, align from/to to the audio.
export type Line = {from: number; to: number; text: string};

const seg = (CATS.to - CATS.from) / 7;
const cat = (i: number, text: string): Line => ({
  from: Math.round(CATS.from + i * seg + 2),
  to: Math.round(CATS.from + (i + 1) * seg - 3),
  text,
});

export const VOICEOVER: Line[] = [
  {from: 3, to: 55, text: "Envie d'élégance ? Viens voir…"},
  {from: 63, to: 138, text: 'Voici Kuwej. Ta boutique en ligne, ici même, à Kinshasa.'},
  {from: 143, to: 207, text: 'Ton shopping, en un seul geste.'},
  {from: 213, to: 297, text: "Parce qu'ici, si ce n'est pas élégant… ce n'est pas Kuwej."},
  cat(0, 'Des casques…'),
  cat(1, 'des montres…'),
  cat(2, 'des téléphones…'),
  cat(3, 'les accessoires Oraimo…'),
  cat(4, 'des gadgets…'),
  cat(5, 'tes abonnements…'),
  cat(6, 'et bien sûr, la marque Kuwej.'),
  {from: 722, to: 788, text: 'Et la livraison est gratuite au-delà de cinquante dollars.'},
  {from: 794, to: 862, text: 'Commande dès maintenant sur kuwej.com, ou sur WhatsApp.'},
  {from: 864, to: 898, text: "Kuwej. Plus mieux, c'est sûr !"},
];

export const VOICEOVER_TEXT = VOICEOVER.map((l) => l.text).join(' ');
