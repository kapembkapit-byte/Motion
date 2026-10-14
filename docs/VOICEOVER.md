# Voix off — Kuwej Reel 30 s (FR)

72 mots · ~29 s · voix d'homme grave, chaude, émotionnelle · rythme publicitaire, plus rapide sur la fin.
Every line is also shown on screen as a kinetic title, so the voice must land on the same beats (timings = `src/script.ts`).

## Texte avec repères

| Temps | Ton | Texte |
|---|---|---|
| 0,1 – 1,8 s | Bas, intrigant, presque murmuré | Envie d'**élégance** ? *(micro-pause)* Viens voir… |
| 2,1 – 4,6 s | Chaleureux, sourire | Voici **Kuwej**. Ta boutique en ligne, ici même, à **Kinshasa**. |
| 4,8 – 6,9 s | Posé, sûr de lui | Ton shopping, *(pause courte)* en un seul **geste**. |
| 7,1 – 9,9 s | Ralentir, appuyer, fierté | Parce qu'ici, si ce n'est pas **élégant**… *(pause 0,4 s)* ce n'est pas **Kuwej**. |
| 10,1 – 23,9 s | Énergie qui monte, une catégorie toutes les 2 s, pile sur l'image | Des **casques**… *(10,1 s)* des **montres**… *(12,1 s)* des **téléphones**… *(14,1 s)* les accessoires **Oraimo**… *(16,1 s)* des **gadgets**… *(18,1 s)* tes **abonnements**… *(20,1 s)* et bien sûr, la marque **Kuwej**. *(22,1 s)* |
| 24,1 – 26,3 s | Enthousiaste, direct | Et la livraison est **gratuite** au-delà de cinquante dollars. |
| 26,5 – 28,7 s | Enthousiaste, rapide | Commande dès maintenant sur **kuwej.com**, ou sur **WhatsApp**. |
| 28,8 – 29,9 s | Assuré, plus lent, sourire | Kuwej. *(pause courte)* Plus mieux, **c'est sûr** ! |

## Texte brut (à coller dans l'outil TTS)

```
Envie d'élégance ? Viens voir…
Voici Kuwej. Ta boutique en ligne, ici même, à Kinshasa.
Ton shopping, en un seul geste.
Parce qu'ici, si ce n'est pas élégant… ce n'est pas Kuwej.
Des casques… des montres… des téléphones… les accessoires Oraimo… des gadgets… tes abonnements… et bien sûr, la marque Kuwej.
Et la livraison est gratuite au-delà de cinquante dollars.
Commande dès maintenant sur kuwej.com, ou sur WhatsApp.
Kuwej. Plus mieux, c'est sûr !
```

Facts used: free delivery « pour toute commande supérieure à 50.00$ » (site cart banner), WhatsApp +243 97 5999 488 (`assets/data/numero_whatsapp_officiel.txt`), Kinshasa (site data). No other promise is made.

## Style prompt

**Gemini TTS (Google AI Studio → Generate speech)**: model `gemini-2.5-pro-preview-tts`, voice **Charon** (deep, informative) or **Algenib** (deeper, slightly gravelly). Style instructions:

```
Lis le texte suivant en français, avec une voix d'homme grave, chaude et profonde, très naturelle, proche du micro, comme une publicité haut de gamme. Accent francophone neutre avec une légère chaleur d'Afrique centrale, sans exagération. Commence bas et intrigant ; deviens chaleureux et fier sur « si ce n'est pas élégant… ce n'est pas Kuwej » ; puis énumère les catégories avec une énergie qui monte, une toutes les deux secondes ; termine enthousiaste et direct, et pose le slogan final avec assurance et un sourire dans la voix. Les points de suspension sont des respirations courtes. Appuie sur : « élégance », « Kuwej », « élégant », « gratuite », « kuwej.com », « WhatsApp », « c'est sûr ». Durée totale : 29 secondes maximum.
```

With a key: `GEMINI_API_KEY=… GEMINI_VOICE=Charon npm run tts:gemini` writes `assets/audio/voiceover.wav` and wires it into the video.

**Google Cloud TTS, Chirp 3 HD**: `fr-FR-Chirp3-HD-Charon` (alt. `-Algenib`, `-Iapetus`), speaking rate 1.05, 48 kHz LINEAR16. Chirp has no style prompt; the ellipses drive the pauses.

**ElevenLabs / Fish Audio (alternatives)**: a deep French male voice (French · Male · Deep · Advertising). ElevenLabs Multilingual v2: Stability 0.40, Similarity 0.80, Style 0.35, Speaker boost on.

After generation: total ≤ 29.5 s; align `from`/`to` in `src/script.ts` to the audio if a line drifts by more than ~0.2 s from its title.
