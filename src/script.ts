import {CATS} from './timing';

// French voice-over (58 words, phrases placed on their beats; total audio 29.9 s). Every line is also on screen as a kinetic title
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
  {from: 3, to: 55, text: "Envie d'élégance ?"},
  {from: 63, to: 138, text: 'Voici Kuwej, ta boutique à Kinshasa.'},
  {from: 143, to: 207, text: 'Ton shopping, en un seul geste.'},
  {from: 212, to: 298, text: "Si ce n'est pas élégant, ce n'est pas Kuwej."},
  cat(0, 'Des casques.'),
  cat(1, 'Des montres.'),
  cat(2, 'Des téléphones.'),
  cat(3, 'Les accessoires Oraimo.'),
  cat(4, 'Des gadgets.'),
  cat(5, 'Tes abonnements.'),
  cat(6, 'Et bien sûr, la marque Kuwej.'),
  {from: 722, to: 788, text: 'Livraison gratuite au-delà de cinquante dollars.'},
  {from: 792, to: 862, text: 'Commande sur kuwej.com ou sur WhatsApp.'},
  {from: 864, to: 897, text: "Plus mieux, c'est sûr !"},
];

export const VOICEOVER_TEXT = VOICEOVER.map((l) => l.text).join(' ');
