# Pub vidéo 3D — Smart Watch Série 10 KW90 MAX (Kuwej)

`kuwej_smartwatch_serie10_pub.mp4` : vidéo verticale 1080×1920 (9:16) de 19 s à 30 i/s. La musique est synthétisée par le script, donc libre de droits.
Format pensé pour TikTok, Reels, Shorts et les Statuts WhatsApp.

La montre est un **vrai modèle 3D** (three.js) : boîtier en aluminium avec reflets studio, verre bombé, couronne crantée qui tourne, bouton latéral, dôme de capteurs au dos et bracelet sport en boucle. Les écrans sont dessinés en direct sur le verre.

| Temps | Scène |
|---|---|
| 0–1,5 s | Macro sur la couronne qui tourne, puis profil avec la boucle du bracelet |
| 1,5–10,5 s | La montre pivote de face et l'écran s'allume. 6 écrans s'enchaînent (cadran, heure, appel, notifications, cardio, activité) et la couronne tourne à chaque changement |
| 10,5–13,5 s | 3 bracelets offerts : la montre fait un tour sur elle-même à chaque changement de couleur (noir, orange, gris) |
| 13,5–15 s | Recharge magnétique : le palet vient se coller au dos, puis la montre se retourne sur l'écran « En charge » |
| 15–19 s | Appel à l'action : prix, kuwej.com et WhatsApp |

## Régénérer

```bash
cd 3d
npm install                      # three.js + playwright (utilise le Chromium installé)
node render.mjs                  # -> ../kuwej_smartwatch_serie10_pub.mp4 (~10 min)
node render.mjs --preview 3.5 12 # aperçus PNG dans 3d/preview/
```

Nécessite Node 18 ou plus récent, Python 3 avec numpy (pour la musique) et ffmpeg.

Où modifier quoi :
- `3d/scene.js` : modèle 3D, animations, écrans de la montre et timeline (`T`).
- `3d/index.html` : textes (prix, numéro WhatsApp, titres) et mise en page.
- `3d/music.py` : musique.
