# Voix off — Kuwej Reel 30 s (FR)

58 mots · durée finale **29,9 s** · voix d'homme grave, chaude, émotionnelle.

The first version (72 words, with ellipses) came out at 34 s in Fish Audio. This version is shorter, has no ellipses (Fish turns them into long pauses), and uses one sentence per beat. The finished file is cut at the silences and each sentence is placed on its own beat (`src/script.ts`), so the total is exactly 29.9 s.

## Texte à coller dans Fish Audio

"Kuwej" is respelled **Kouwèj** so the voice says *kou-WÈJ* (the j as in « je ») and not « ku-wej ». On screen it stays **Kuwej** / **kuwej.com**.

```
Envie d'élégance ?
Voici Kouwèj, ta boutique à Kinshasa.
Ton shopping, en un seul geste.
Si ce n'est pas élégant, ce n'est pas Kouwèj.
Des casques. Des montres. Des téléphones. Les accessoires Oraimo. Des gadgets. Tes abonnements. Et bien sûr, la marque Kouwèj.
Livraison gratuite au-delà de cinquante dollars.
Commande sur kouwèj point com, ou sur WhatsApp.
Plus mieux, c'est sûr !
```

If the brand says the end with a « dj » sound (*kou-WÈDJ*), replace every `Kouwèj` with `Kouwèdj`. If the voice stresses it wrong, try `Kou-wèj` (the hyphen forces two syllables).

## Fish Audio settings

- Voice: a deep, warm French **male** voice (search « French male deep narrator » / « publicité »). Avoid voices cloned from English.
- Speed: **1.0–1.1**. Do not force it any faster: the placement fixes the total length.
- Export **WAV** (or MP3 320 kbps).
- Expected raw length: ~24–27 s of speech. That is normal; the placement brings it to 29.9 s.

## Placement: done (`assets/audio/voiceover.wav`)

Fish Audio file `assets/audio/voiceover-fish-raw.mp3` (29.88 s, voice « voix grave »). Each sentence was cut at the silences and placed on its beat with **no speed change**. The voice is the reference: the video's beats were adjusted to it.

Then exported at **29.900 s exactly** (1,435,200 samples at 48 kHz, mono), normalised to −14 LUFS / −1 dBTP, with a 0.1 s fade-out.

| Sentence | In the video |
|---|---|
| Envie d'élégance ? | 0,10 s |
| Voici Kouwèj, ta boutique à Kinshasa. | 1,75 s |
| Ton shopping, en un seul geste. | 4,65 s |
| Si ce n'est pas élégant, ce n'est pas Kouwèj. | 6,95 s |
| Des casques. / Des montres. / Des téléphones. / Les accessoires Oraimo. / Des gadgets. / Tes abonnements. | 9,75 / 11,35 / 12,95 / 14,52 / 16,25 / 17,75 s |
| Et bien sûr, la marque Kouwèj. | 19,32 s |
| Livraison gratuite au-delà de cinquante dollars. | 21,90 s |
| Commande sur kouwèj point com, ou sur WhatsApp. | 24,85 s |
| Plus mieux, c'est sûr ! | 28,10 s |

To redo it with a new take, update `speech` (sentence start/end in the new file, from `ffmpeg -af silencedetect=noise=-38dB:d=0.18`) in `scripts/voiceover-placement.json`, then run `python3 scripts/place-voiceover.py` and `npm run render`.
