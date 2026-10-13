# Voix off — Kuwej Reel 30 s (FR)

72 mots · ~28 s de parole · voix d'homme grave, chaude, émotionnelle.

## Texte avec repères (à lire)

| Temps | Ton | Texte |
|---|---|---|
| 0,2 – 2,8 s | Bas, lent, intrigant, presque murmuré | Et si l'élégance… *(pause 0,4 s)* tenait **enfin** dans ta poche ? |
| 3,2 – 4,4 s | Chaleureux, posé, sourire | Voici **Kuwej**. |
| 4,4 – 6,4 s | Chaleureux | Ta boutique en ligne, *(pause courte)* ici, à Kinshasa. |
| 6,6 – 8,0 s | Complice, lent | Tu ouvres… *(pause)* tu explores… |
| 8,0 – 9,8 s | Rassurant | et tout est là, en quelques gestes. |
| 10,2 – 13,8 s | L'énergie monte | Des produits choisis avec soin, des prix clairs, affichés. |
| 14,2 – 18,8 s | Rythme plus vif | Une catégorie… puis une autre… et toujours la même **exigence**. |
| 19,3 – 23,7 s | Ralentir, appuyer, fierté | Parce qu'ici, si ce n'est pas **élégant**… *(pause 0,5 s)* ce n'est pas **Kuwej**. |
| 24,2 – 28,2 s | Enthousiaste, direct | Commande dès maintenant sur **kuwej.com**… ou écris-nous sur WhatsApp. |
| 28,4 – 29,8 s | Assuré, plus lent, sourire | Kuwej. *(pause courte)* Plus mieux, **c'est sûr** ! |

## Texte brut (à coller dans l'outil TTS)

```
Et si l'élégance… tenait enfin dans ta poche ?
Voici Kuwej. Ta boutique en ligne, ici, à Kinshasa. Tu ouvres… tu explores… et tout est là, en quelques gestes.
Des produits choisis avec soin, des prix clairs, affichés. Une catégorie… puis une autre… et toujours la même exigence. Parce qu'ici, si ce n'est pas élégant… ce n'est pas Kuwej.
Commande dès maintenant sur kuwej.com… ou écris-nous sur WhatsApp. Kuwej. Plus mieux, c'est sûr !
```

> If kuwej.com shows no WhatsApp number, replace « ou écris-nous sur WhatsApp » with « en quelques clics » (no unverifiable promise).

## Style prompt

**Gemini TTS (Google AI Studio → Generate speech)** — model `gemini-2.5-pro-preview-tts`, voice **Charon** (deep, informative) or **Algenib** (deeper, slightly gravelly). Paste in the *Style instructions* field:

```
Lis le texte suivant en français, avec une voix d'homme grave, chaude et profonde, très naturelle, proche du micro, comme une publicité de parfum haut de gamme. Accent francophone neutre avec une légère chaleur d'Afrique centrale, sans exagération. Commence bas, lent et intrigant ; deviens chaleureux et rassurant ; monte progressivement en énergie et en enthousiasme au milieu ; termine avec assurance et un sourire dans la voix, un peu plus lentement. Les points de suspension sont des respirations de 0,4 à 0,6 seconde. Appuie sur : « élégance », « Kuwej », « exigence », « élégant », « kuwej.com », « c'est sûr ». Durée totale visée : 28 secondes.
```

With an API key: `GEMINI_API_KEY=… GEMINI_VOICE=Charon npm run tts:gemini` (writes `assets/audio/voiceover.wav` and wires it into the video).

**Google Cloud TTS — Chirp 3 HD**: voice `fr-FR-Chirp3-HD-Charon` (alt. `fr-FR-Chirp3-HD-Algenib`, `fr-FR-Chirp3-HD-Iapetus`), speaking rate 0.95, sample rate 48 kHz, LINEAR16. Chirp 3 HD takes no style prompt: tone comes from punctuation, so keep the ellipses.

**ElevenLabs (alternative)**: model *Eleven Multilingual v2*, a deep French male library voice (filter: French · Male · Deep · Narrative/Advertising). Stability 0.40, Similarity 0.80, Style 0.35, Speaker boost on.

Target: total length ≤ 29.5 s, export WAV 48 kHz. After generation, align the `from`/`to` values in `src/script.ts` to the real audio (the subtitles follow them).
