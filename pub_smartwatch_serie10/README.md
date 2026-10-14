# Pub vidéo — Smart Watch Série 10 KW90 MAX (Kuwej)

`kuwej_smartwatch_serie10_pub.mp4` — 1080×1920 (9:16), 19 s, 30 i/s, avec musique synthétisée libre de droits.
Format pensé pour TikTok, Reels, Shorts et Statuts WhatsApp.

Inspirée de la pub « Apple Watch Series 11 » : fond gris clair, logo en haut, montre au centre dont l'écran change au rythme de la musique.

| Temps | Scène |
|---|---|
| 0–1,5 s | Gros plans rapides (poignet, couronne) |
| 1,5–10,5 s | Montre au centre, 6 écrans : cadran, heure, appel entrant, notifications, cardio, activité |
| 10,5–15 s | Plans photo : recharge magnétique, 3 bracelets offerts, porté |
| 15–19 s | Appel à l'action : prix, kuwej.com, WhatsApp |

## Modifier et régénérer

Les textes (prix, numéro, titre) sont en haut de `make_ad.py`.

```bash
python3 make_ad.py            # régénère la vidéo
python3 make_ad.py 4.0 18.0   # enregistre des aperçus PNG aux instants donnés
```

Nécessite Python 3 avec Pillow et numpy, ffmpeg et la police Inter. Les visuels sources se trouvent dans `assets/`.
