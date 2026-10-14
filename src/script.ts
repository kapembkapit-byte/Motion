// French voice-over (58 words), as placed in assets/audio/voiceover.wav (29.9 s).
// Source of truth: scripts/voiceover-placement.json → python3 scripts/place-voiceover.py.
// Every line is also on screen as a kinetic title (reference style), so no subtitle pill.
export type Line = {from: number; to: number; text: string};

export const VOICEOVER: Line[] = [
  {from: 3, to: 37, text: 'Envie d\'élégance ?'},
  {from: 52, to: 130, text: 'Voici Kuwej, ta boutique à Kinshasa.'},
  {from: 140, to: 199, text: 'Ton shopping, en un seul geste.'},
  {from: 208, to: 285, text: 'Si ce n\'est pas élégant, ce n\'est pas Kuwej.'},
  {from: 292, to: 314, text: 'Des casques.'},
  {from: 340, to: 362, text: 'Des montres.'},
  {from: 388, to: 418, text: 'Des téléphones.'},
  {from: 436, to: 484, text: 'Les accessoires Oraimo.'},
  {from: 488, to: 513, text: 'Des gadgets.'},
  {from: 532, to: 557, text: 'Tes abonnements.'},
  {from: 580, to: 653, text: 'Et bien sûr, la marque Kuwej.'},
  {from: 657, to: 738, text: 'Livraison gratuite au-delà de cinquante dollars.'},
  {from: 746, to: 839, text: 'Commande sur kuwej.com, ou sur WhatsApp.'},
  {from: 843, to: 894, text: 'Plus mieux, c\'est sûr !'},
];

export const VOICEOVER_TEXT = VOICEOVER.map((l) => l.text).join(' ');
