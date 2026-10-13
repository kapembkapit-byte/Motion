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
const STYLE = `Lis le texte suivant en français, avec une voix d'homme grave, chaude et profonde, très naturelle, proche du micro, comme une publicité de parfum haut de gamme. Accent francophone neutre avec une légère chaleur d'Afrique centrale, sans exagération. Commence bas, lent et intrigant ; deviens chaleureux et rassurant ; monte progressivement en énergie et en enthousiasme au milieu ; termine avec assurance et un sourire dans la voix, un peu plus lentement. Les points de suspension sont des respirations de 0,4 à 0,6 seconde. Appuie sur : « élégance », « Kuwej », « exigence », « élégant », « kuwej.com », « c'est sûr ». Durée totale visée : 28 secondes.`;
const TEXT = `Et si l'élégance… tenait enfin dans ta poche ?
Voici Kuwej. Ta boutique en ligne, ici, à Kinshasa. Tu ouvres… tu explores… et tout est là, en quelques gestes.
Des produits choisis avec soin, des prix clairs, affichés. Une catégorie… puis une autre… et toujours la même exigence. Parce qu'ici, si ce n'est pas élégant… ce n'est pas Kuwej.
Commande dès maintenant sur kuwej.com… ou écris-nous sur WhatsApp. Kuwej. Plus mieux, c'est sûr !`;

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
