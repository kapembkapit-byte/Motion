# Kuwej — Reel Instagram 30 s · Direction artistique & production

Format : 1080 × 1920 · 9:16 · 30 fps · 900 frames · MP4 H.264 (yuv420p, BT.709) · 100 % français.

---

## 1. Skills & tools

| Found | Where | Used for |
|---|---|---|
| Client export (screens, categories, products, logo, catalogue, WhatsApp) | `main` → moved to `assets/` | **Only data source of the video** (`assets/video-content.json`) |
| HeyGen HyperFrames skills (21 skills, e.g. `embedded-captions`) | branch `claude/heygen-hyperframes-skill-uj25cm` (not on `main`) | Not used: the project is built in Remotion as requested |
| `frontend-design`, `brand-guidelines`, `canvas-design`, `theme-factory`… | `/mnt/skills` | Reference only; palette and rules come from this brief |
| Office / docs / browser skills | synced skills | Not relevant |
| Chromium headless + `playwright-core` | environment | `scripts/capture-kuwej.mjs` (re-capture when kuwej.com is reachable) |
| ffmpeg / ffprobe | environment | Reference analysis (frames every 0.5 s, cut detection) + output checks |
| Remotion 4 + Node 22 | npm | Composition and H.264 render |
| TTS key (Gemini / Google / ElevenLabs / Fish Audio) | **missing** | `scripts/tts-gemini.mjs` ready; the video is rendered without voice for now |

Network: `kuwej.com`, `whatships.com` and `api.fish.audio` are blocked by this environment's policy. The site content comes from the client export, and the reference video was uploaded directly.

## 2. kuwej.com data used

- **Logo:** `assets/logo/kuwej-logo.png`, the site's own file: dark grey "kuwej" wordmark plus a blue smiley speech-bubble icon, on a white background. It is displayed untouched as a rounded tile.
- **WhatsApp:** **+243 97 5999 488** (official customer line, `assets/data/numero_whatsapp_officiel.txt`). The site's currency is USD, displayed as `19.00$`.
- **Real offer:** « Livraison gratuite pour toute commande supérieure à 50.00$. » (site cart banner, `assets/screens/04_panier_mobile.png`).
- **Categories:** the site has 36. The video shows the **7 top-level categories that actually sell products**. Excluded:
  - Tendance & Mode, with its sub-category Maillots & Baskets: "Mode" is excluded by the brief, and it has 0 products anyway.
  - Ordinateurs Portables: excluded by the brief, also 0 products.
  - Produits Numeriques: 0 products.

| # | Category (exact) | Screen used | Products (name as displayed · price as displayed · regular price) |
|---|---|---|---|
| 1 | Casques Bluetooth | `12_Casques_Bluetooth` | Oraimo OpenLoop Open-Ear Wireless Headphones · **44.00$** · ~~88.00$~~ — Airpods Pro – Semi Apple Orginale · **25.00$** · ~~100.00$~~ |
| 2 | Montres Connectées | `07_Smart_Watch_Serie` (06 is captured faded) | Smart Watch Série 10 Avec 3 Bracelets – Noire – KW90 MAX · **19.00$** · ~~89.00$~~ — Chargeur Smart Watch Magnétique 15W · **5.00$** · ~~15.00$~~ |
| 3 | Téléphones | `16_Telephones` | Chargeur IPhone Type-C Vers Type-C 20W · **10.00$** · ~~15.00$~~ |
| 4 | Accessoires Oraimo | `01_Accessoires_Oraimo` | Oraimo Boom 30W Wireless Speaker · **95.00$** · ~~190.00$~~ — Oraimo PowerBox 600 60000mAh Power Bank · **99.00$** · ~~140.00$~~ |
| 5 | Gadgets & Accessoires | `21_Lumieres_Selfies` (20 is captured faded) | Lumière selfie · **10.00$** ⚠ *out of stock on the site; every product in this category is out of stock* |
| 6 | Abonnement & streaming | `22_Abonnement_Streaming` | Abonnement Apple One – Kinshasa RDC · **13.00$ / mois** · ~~25.00$~~ |
| 7 | kuwej Brand | `23_Kuwej_Brand` | Coque Airpods Pro 2, KUWEJ En Silicone Couleur Blanche · **5.00$** · ~~10.00$~~ — Coque Airpods 3, KUWEJ En Silicone Couleur Blanche · **5.00$** · ~~10.00$~~ |

Prices come from `assets/data/produits_et_prix.json` and are written in the site's display format, cross-checked on the category grids and the cart.

## 3. Reference video analysis (uploaded file: Madifood ad, 720 × 1280, 30 fps, 44.7 s)

Frames were extracted every 0.5 s and cuts detected at 4.07, 12.2, 14.7, 15.1, 26.9 and 30.5 s.

| Ref. time | What happens | Mechanic kept | Our version |
|---|---|---|---|
| 0–2 s | « FAIM ? » / « BOUGE PAS. »; round food photos fly across with motion blur | Short question hook, word slam, flying circular product bubbles, highlight block | « ENVIE / D'ÉLÉGANCE ? » with real product photos in bubbles |
| 2–4 s | Full-screen brand colour, logo icon, mask reveal | Logo moment at ~2 s | Logo tile pops (spring + blur) on #EDEDED (the background rule forbids a full-colour screen) |
| 4–6 s | App icon + name + tagline; **two crossing diagonal ticker tapes** | Tapes, tagline | Blue tape « KUWEJ.COM • KINSHASA » and ink tape with the real category names |
| 6–12 s | Map zoom, « CONAKRY COMMANDE. » | Location statement | « Ta boutique en ligne / ici même, à Kinshasa » |
| 12–14 s | « COMMANDER N'A JAMAIS ÉTÉ AUSSI SIMPLE. » + rotating arc | Stacked kinetic statement, last word on a block, rotating arc | « TON SHOPPING, / EN UN SEUL / GESTE. » |
| 14–24 s | 3D-tilted phone, tap ripples; a **UI card lifts out of the screen**; fast motion-blurred scroll; product shown full size with name + **price tag** | Phone tilt, tap ripple, lift-out card, product + price tag | Home page → the « Meilleures catégories » row lifts out → real menu; then each product photo lifts out of its page with a blue price tag |
| 24–30 s | Checkout, payment icons, « PAYEZ COMME VOUS VOULEZ. » | Proof point on the cart | Real cart page; the site's free-delivery banner lifts out; « LIVRAISON GRATUITE / AU-DELÀ DE 50.00$ » |
| 30–38 s | Map « LIVRE EN 45 MIN », multi-phone, « +50 000 » counter | — | Dropped: no verifiable data |
| 38–45 s | End card: logo, two-line claim, CTA button with tap, Android/iOS chips, phone peeking from the bottom | Whole structure | Logo · « COMMANDE SUR / kuwej.com » · button « Commander sur WhatsApp » with tap · number chip · slogan · phone peeking |

**Rhythm:** one beat every 1.5–2.5 s, never a static frame. Our 30 s keeps the same beat density (7 acts, plus 7 category beats of 2 s).

**Text style:** heavy condensed italic uppercase; whip-in with motion blur; one key line on a block. The block is yellow in the reference; here it is #0746C0 with #EDEDED text.

**Subtitles:** the reference has no subtitle pill; the kinetic titles carry the voice-over. Same here: every voice line has its on-screen title.

**Not copied:** content, texts, images and colours.

## 4. Voice-over

`docs/VOICEOVER.md`: 72 words with timing, tone cues and style prompts for Gemini, Chirp 3 HD, ElevenLabs and Fish Audio. Timings live in `src/script.ts`.

## 5. Storyboard

> **Timing locked to the voice-over** (`src/timing.ts`): Hook 0–1.6 s · Brand 1.6–4.5 s · Statement 4.5–6.8 s · Journey 6.8–9.7 s · Categories 9.7–21.8 s (six 1.6 s beats + 2.5 s for kuwej Brand) · Offer 21.8–24.6 s · End 24.6–30 s. The times in the table below are from the first cut. The scene contents are unchanged, but the voice lines now follow `docs/VOICEOVER.md`.

| # | Time (frames) | Visual / screenshot | Animation · transition | On-screen text (FR) | Voice (FR) |
|---|---|---|---|---|---|
| 1 | 0–2 s (0–60) | 6 bubbles with real product photos (first product of each category) | Bubbles fly in with velocity blur; title slam; whip-out + bubbles implode to centre | ENVIE / **D'ÉLÉGANCE ?** | Envie d'élégance ? Viens voir… |
| 2 | 2–4.7 s (60–140) | Kuwej logo tile | Spring pop with rotation; crossing tapes slide in; whip up | Ta boutique en ligne / *ici même, à Kinshasa* | Voici Kuwej. Ta boutique en ligne, ici même, à Kinshasa. |
| 3 | 4.7–7 s (140–210) | Statement + rotating blue arc; tapes continue | Lines whip in from the left, staggered 7 f; motion-blur exit | TON SHOPPING, / EN UN SEUL / **GESTE.** | Ton shopping, en un seul geste. |
| 4 | 7–10 s (210–300) | `02_page_accueil` then `03_menu_categories_mobile` in a 3D phone | Phone rises from the bottom; tap ripple; « Meilleures catégories » card lifts out then back; push to menu; tap on « Casques Bluetooth » | SI CE N'EST PAS ÉLÉGANT… / **CE N'EST PAS KUWEJ.** | Parce qu'ici, si ce n'est pas élégant… ce n'est pas Kuwej. |
| 5–11 | 10–24 s (300–720), 2 s each | Category page, then product pages | Phone glides left/right (±14° yaw, float); page whips up; tap; product photo lifts out to a card; blue price tag pops (−4°) with struck regular price; name fades up; whip exit | « 0N / 07 » + exact category name; product names + prices (section 2) | Des casques… des montres… des téléphones… les accessoires Oraimo… des gadgets… tes abonnements… et bien sûr, la marque Kuwej. |
| 12 | 24–26.3 s (720–790) | `04_panier_mobile` | Phone to centre; tap on the banner; banner lifts out; phone drops | LIVRAISON GRATUITE / **AU-DELÀ DE 50.00$** | Et la livraison est gratuite au-delà de cinquante dollars. |
| 13 | 26.3–30 s (790–900) | Logo, CTA, `02_page_accueil` phone peeking | Logo drops in; titles whip; button press + tap ripple; chip and slogan fade up; underline draws; hold ≥ 1.2 s | Logo · COMMANDE SUR / **kuwej.com** · « Commander sur WhatsApp » · **+243 97 5999 488** · *plus mieux, c'est sûr !* | Commande dès maintenant sur kuwej.com, ou sur WhatsApp. Kuwej. Plus mieux, c'est sûr ! |

## 6. Palette, type, animation rules

- **Colours (no others):**
  - background #EDEDED on every frame;
  - #0746C0 for blocks, price tags, tapes, button, ripple and slogan;
  - #1A1A1A for text, phone body and the second tape.
  - Text on blue or ink is #EDEDED.
  - Real screenshots and the logo keep their own pixels.
- **Typefaces (bundled, offline):**
  - **Barlow Condensed ExtraBold Italic** for kinetic titles and prices (the reference mechanic). Category names keep their exact case.
  - **Manrope** 600–800 for product names, button and number.
  - **Instrument Serif Italic** for elegance accents (« ici même, à Kinshasa ») and the slogan.
- **Motion:**
  - Springs only: `pop` for text, `glide` for the phone and cards.
  - Every move has motion blur proportional to its speed.
  - Entrances take 6–12 f, exits 7–10 f.
  - Every beat changes before 2.5 s.
  - The phone is the anchor: one position per beat, alternating left/right in the product section.
  - Lift-outs always start from the real area of the screenshot.
- **Logo:** proportional scaling only. Rounded corners clip only its white margin; no recolour, filter or distortion.
- **Safe zone:** all text sits between y 250 and y 1540. Only the decorative bottom phone in the end card crosses into the bottom band.

## 6b. Music & sound design (original, generated in code)

`scripts/audio/make_audio.py` (numpy/scipy). Licence-free: everything is synthesised, nothing is downloaded.

- **Track**: 150 BPM, half-time feel, D minor: Dm9 – B♭maj9 – Fmaj9 – C6/9. Instruments: kick, clap, hats, sub bass, saw pad, FM bell arpeggio.
  - The grid is offset by 0.1 s so that **each category beat is exactly one bar** (1.6 s).
  - Structure:
    - filtered intro on « Envie d'élégance ? »;
    - drop on the logo (1.67 s);
    - light groove under brand / statement / journey;
    - filter build + snare roll into the categories;
    - full groove (bell arpeggio) for 9 bars;
    - break before the end card;
    - re-entry on the end-card impact (24.6 s);
    - stop, then final Dm9 chord + bells on the slogan (28.1 s), ringing out.
- **Sound effects** (on the same frames as the animations):
  - whoosh on every title whip and phone move;
  - pops when bubbles and cards land;
  - tap clicks on every tap ripple;
  - « ding » on every price tag (rising note per category);
  - hits on the blue blocks;
  - impacts on the logo and the end card;
  - risers before the drops;
  - chime on the logo and the slogan.
- **Mix**:
  - music ducked −8 dB under the voice (sidechain from the voice envelope), effects −3 dB;
  - stems at voice −14.3 / music −25.2 / effects −26.5 LUFS;
  - master normalised in two passes to **−14 LUFS, −1 dBTP**, exactly 29.900 s, 48 kHz stereo (`assets/audio/master.wav`).
- **Image**: camera punch-ins (+1.2 to 3.5 %) on the same hits, plus a short shake on the two impacts (`src/components/Camera.tsx`).

Regenerate: `pip install -r scripts/audio/requirements.txt && python3 scripts/audio/make_audio.py && npm run render`.

## 6c. Version B « Éditorial / Afro » (`KuwejReelAfro`)

Same voice-over, same timing, same real content (screenshots, products, prices, logo, WhatsApp). Different visual language and music.

- **Image** (`src/editorial/`):
  - hook: a 3×3 mosaic of real products whose tiles morph from circles into squares, cut by a tilted blue band carrying the title in Instrument Serif;
  - brand: an "editorial page" with hairlines, labels and a giant outlined KUWEJ drifting behind;
  - statement: left-aligned serif, drawn underline, product dots;
  - journey: the site full-bleed in a large card, scroll + zoom to « Meilleures catégories », tap, then the menu;
  - categories: a collage of the category page + product cards flipping in 3D with price stickers, the category name outlined behind;
  - delivery: the free-delivery bar filling to 50.00$ + the real cart banner;
  - end: products orbiting the logo, serif CTA, WhatsApp, slogan revealed by a mask;
  - transitions: diagonal blue then ink wipes (the cut happens under cover); camera punches on the hits.
- **Music** (`scripts/audio/make_audio_afro.py`): an original Afro / Congolese *sebene*-inspired track, 150 BPM, A major (A–D–E–D).
  - Guitars: interlocking Karplus-Strong plucked strings (16th-note lead, 8th-note counter-line), tuning checked within about ±3 cents.
  - Bass: rumba line.
  - Percussion: congas, shaker, cowbell, rim, kick, crash.
  - Structure: guitar intro, crash on the logo, groove, conga fill into the categories, full sebene, guitar break, re-entry on the end card, final A-major strum on the slogan.
  - Sound effects synced to the editorial animations; the same ducking/mastering (−14 LUFS, exactly 29.9 s).

## 7. Project

```
assets/            client export (screens/, categories/, products/, logo/, data/) + video-content.json
src/timing.ts      act boundaries (900 f)      src/script.ts    FR voice-over lines
src/theme.ts       palette, fonts, phone       src/fonts.ts     bundled fonts
src/components/    Headline, Tapes, Phone, Screen, Crop, TapRipple, Logo, Kinetic, SafeZones, geometry, anim
src/scenes/        Hook, Brand, Statement, Journey, Categories, Offer, End
scripts/           capture-kuwej.mjs, analyze-reference.sh, tts-gemini.mjs
```

## 8. Commands

```bash
npm install
npm run studio                # live preview
npm run render                # → out/kuwej-reel.mp4
npm run render:safezones      # safe-zone overlay check
GEMINI_API_KEY=… npm run tts:gemini   # adds the voice-over (or drop a WAV in assets/audio/ and set audio.voiceover)
```

## 9. Checklist

- [x] 1080 × 1920, 30 fps, 900 frames, 30.0 s, H.264 yuv420p (ffprobe)
- [x] Background #EDEDED everywhere; only #0746C0 and #1A1A1A added
- [x] Original logo file, untouched (dark text + blue icon)
- [x] Slogan exactly « plus mieux, c'est sûr ! »
- [x] 7 selling categories shown; Mode and Ordinateurs excluded
- [x] Names, prices and WhatsApp number taken from the export
- [x] Text inside y 250–1540 (safe-zone render checked)
- [x] All copy in French
- [x] Voice-over (Fish Audio) placed beat by beat, exactly 29.900 s
- [x] Original music + sound effects synced to the frame, music ducked under the voice, master −14 LUFS / −1 dBTP
- [ ] Optional: swap « Lumière selfie » (out of stock) once a Gadgets product is back in stock
