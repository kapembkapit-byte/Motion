#!/usr/bin/env node
// Generate the French voice-over with Gemini TTS (Google AI Studio key).
//   GEMINI_API_KEY=… npm run tts:gemini
//   GEMINI_VOICE=Algenib GEMINI_TTS_MODEL=gemini-2.5-pro-preview-tts npm run tts:gemini
// Writes assets/audio/voiceover.wav and sets audio.voiceover in assets/video-content.json.
import fs from 'node:fs';
import path from 'node:path';

const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error('GEMINI_API_KEY is not set. Paste docs/VOICEOVER.md into AI Studio instead.');
  process.exit(1);
}
const model = process.env.GEMINI_TTS_MODEL || 'gemini-2.5-pro-preview-tts';
const voice = process.env.GEMINI_VOICE || 'Charon';

// Must match src/script.ts and docs/VOICEOVER.md.
const STYLE = `Lis le texte suivant en français, avec une voix d'homme grave, chaude et profonde, très naturelle, proche du micro, comme une publicité haut de gamme. Accent francophone neutre avec une légère chaleur d'Afrique centrale, sans exagération. Commence bas et intrigant ; deviens chaleureux et fier sur « si ce n'est pas élégant… ce n'est pas Kuwej » ; puis énumère les catégories avec une énergie qui monte, une toutes les deux secondes ; termine enthousiaste et direct, et pose le slogan final avec assurance et un sourire dans la voix. Les points de suspension sont des respirations courtes. Appuie sur : « élégance », « Kuwej », « élégant », « gratuite », « kuwej.com », « WhatsApp », « c'est sûr ». Durée totale : 29 secondes maximum.`;
const TEXT = `Envie d'élégance ? Viens voir…
Voici Kuwej. Ta boutique en ligne, ici même, à Kinshasa.
Ton shopping, en un seul geste.
Parce qu'ici, si ce n'est pas élégant… ce n'est pas Kuwej.
Des casques… des montres… des téléphones… les accessoires Oraimo… des gadgets… tes abonnements… et bien sûr, la marque Kuwej.
Et la livraison est gratuite au-delà de cinquante dollars.
Commande dès maintenant sur kuwej.com, ou sur WhatsApp.
Kuwej. Plus mieux, c'est sûr !`;

const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
  method: 'POST',
  headers: {'Content-Type': 'application/json', 'x-goog-api-key': key},
  body: JSON.stringify({
    contents: [{parts: [{text: `${STYLE}\n\n${TEXT}`}]}],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {voiceConfig: {prebuiltVoiceConfig: {voiceName: voice}}},
    },
  }),
});
if (!res.ok) {
  console.error(res.status, await res.text());
  process.exit(1);
}
const json = await res.json();
const b64 = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data;
if (!b64) {
  console.error('No audio in response', JSON.stringify(json).slice(0, 500));
  process.exit(1);
}
// Gemini returns raw 16-bit PCM mono @ 24 kHz → wrap in a WAV header.
const pcm = Buffer.from(b64, 'base64');
const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write('WAVEfmt ', 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(1, 22);
header.writeUInt32LE(24000, 24);
header.writeUInt32LE(48000, 28);
header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34);
header.write('data', 36);
header.writeUInt32LE(pcm.length, 40);
const out = path.resolve('assets/audio/voiceover.wav');
fs.mkdirSync(path.dirname(out), {recursive: true});
fs.writeFileSync(out, Buffer.concat([header, pcm]));
console.log(`✔ ${out} (${(pcm.length / 48000).toFixed(2)} s, voice ${voice})`);

const cf = path.resolve('assets/video-content.json');
const c = JSON.parse(fs.readFileSync(cf, 'utf8'));
c.audio = {...c.audio, voiceover: 'audio/voiceover.wav'};
fs.writeFileSync(cf, JSON.stringify(c, null, 2));
console.log('✔ video-content.json → audio.voiceover = audio/voiceover.wav');
console.log('Next: listen, then align the from/to values in src/script.ts to the audio.');
