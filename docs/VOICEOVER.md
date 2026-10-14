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

## Placement (done in post, ffmpeg)

| Beat | Starts at | Sentence |
|---|---|---|
| Hook | 0,1 s | Envie d'élégance ? |
| Brand | 2,1 s | Voici Kuwej, ta boutique à Kinshasa. |
| Statement | 4,8 s | Ton shopping, en un seul geste. |
| Journey | 7,1 s | Si ce n'est pas élégant, ce n'est pas Kuwej. |
| Categories | 10,1 / 12,1 / 14,1 / 16,1 / 18,1 / 20,1 / 22,1 s | Des casques. / Des montres. / Des téléphones. / Les accessoires Oraimo. / Des gadgets. / Tes abonnements. / Et bien sûr, la marque Kuwej. |
| Offer | 24,1 s | Livraison gratuite au-delà de cinquante dollars. |
| CTA | 26,4 s | Commande sur kuwej.com, ou sur WhatsApp. |
| Slogan | 28,8 s | Plus mieux, c'est sûr ! |

A sentence slightly longer than its beat is sped up by at most 12 % (pitch kept). The file is then padded or cut to exactly 29.9 s, with a 0.1 s fade-out.
