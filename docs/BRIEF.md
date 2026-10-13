# Kuwej — Reel Instagram 30 s · Direction artistique & production

Format: 1080 × 1920 · 9:16 · 30 fps · 900 frames · MP4 H.264 (yuv420p) · French only.

---

## 1. Skills & tools

| Found | Where | Used for |
|---|---|---|
| Repository | `README.md` only (no project skill, script or config at start) | — |
| `session-start-hook` | `~/.claude/skills` | Not needed |
| `frontend-design`, `brand-guidelines`, `canvas-design`, `theme-factory`, `web-artifacts-builder`, `slack-gif-creator`, `algorithmic-art`… | `/mnt/skills/{public,examples}` | Read for reference only; the brand rules come from this brief (no theme or palette from a skill) |
| `docx`, `pdf`, `pptx`, `xlsx`, `docs`, `google-workspace`, `deep-research`, `morning`, `import-memory`, `skill-creator`, browser / computer-use skills | synced skills | Not relevant (no Office output, no desktop browser attached) |
| Chromium headless (`/opt/pw-browsers`) + `playwright-core` | environment | `scripts/capture-kuwej.mjs`: mobile screenshots 390 × 844 @3x, logo download + colour check, data extraction |
| ffmpeg / ffprobe | environment | `scripts/analyze-reference.sh`: frame extraction, cut detection, contact sheets |
| Node 22 + Remotion 4 | npm | Video composition and H.264 render |
| TTS key (Gemini / Google Cloud / ElevenLabs) | **not present** | `scripts/tts-gemini.mjs` ready; runs as soon as `GEMINI_API_KEY` is set |

## 2. Blocked or missing (as of the session)

| Item | Status | What unblocks it |
|---|---|---|
| `kuwej.com` | **Denied by the environment's network policy** (proxy 403). WebFetch: DNS failure. Not indexed by web search. | Add `kuwej.com` to the environment's *Allowed domains* (Network access), or run `npm run capture` on any machine with internet access. |
| `whatships.com/videos/havyn/` | **Denied by the same policy** | Add `whatships.com` (and its video CDN) to Allowed domains, or drop the `.mp4` into `reference/` and run `npm run reference`. |
| Real categories, products, prices, WhatsApp number, logo, screenshots | Not collected — **nothing was invented**; `assets/video-content.json` is empty | `npm run capture` fills `/assets` automatically. |
| Voice-over audio | No API key in the environment | `GEMINI_API_KEY=… npm run tts:gemini`, or paste `docs/VOICEOVER.md` into AI Studio / Chirp 3 HD / ElevenLabs. |

Until `/assets` is filled, the video renders clearly marked dashed slots (« Capture manquante », « Logo manquant », « numéro manquant »). These are development markers, never imitations of the site.

## 3. Reference video (whatships.com/videos/havyn/)

**Not watched.** The page and video could not be reached, so no analysis is claimed here.

To analyse it once access exists: `npm run reference` → `reference/frames/` (2 fps), `reference/cuts.txt` (cut timestamps), `reference/sheet_*.png` (contact sheets), `reference/info.txt` (duration, resolution, fps). From those I measure: shot durations, cut rhythm, transition types, text animation, phone mockup usage, camera moves, subtitle style, hook and CTA. Then I map them onto `src/timing.ts` (act boundaries) and the animation helpers in `src/components/anim.ts` and `Kinetic.tsx`. All the timing lives in those files.

The current build uses the standard mechanics of high-performing app/e-commerce Reels, as an **unverified working hypothesis** to be replaced by the measured values:
- hook under 1 s with text slam and a phone whipping in;
- one persistent phone that moves between scenes (continuity instead of hard cuts);
- horizontal push between categories, vertical push inside a category;
- word-by-word kinetic type;
- subtitle pill above the bottom safe zone;
- static end card held for at least 1 s.

## 4. Voice-over

See `docs/VOICEOVER.md`: 72 words with timing, tone cues and style prompts for Gemini TTS, Chirp 3 HD and ElevenLabs. The same timings are in `src/script.ts` (they drive the subtitles).

## 5. Storyboard

Frames @30 fps. Every screenshot is a real kuwej.com mobile capture from `/assets/screens/`. Every name, price and number is read from `assets/video-content.json`.

| # | Time | Visual & screenshot | Animation / camera | Transition out | On-screen text (FR) | Voice (FR) |
|---|---|---|---|---|---|---|
| 1 | 0,0 – 1,6 s | Phone with `home.png` | Title **slams** in (scale 1.7 → 1, blur → sharp); phone **whips up** from below with rotation −14° and 3D tilt → 0 (spring) | Titles blur up and out | « L'élégance… » (serif italic) / « dans ta poche ? » (blue, drawn underline) | Et si l'élégance… tenait enfin dans ta poche ? |
| 2 | 1,6 – 3,0 s | Same phone, **Kuwej logo** pops above | Logo scale 0.72 → 1 spring; slow push-in on the phone (0.96 → 1.035) | Logo rises and fades (f84–90) | Logo | (end of line) |
| 3 | 3,0 – 6,5 s | `home-full.png` in the phone | **Page scroll** top → bottom (ease-in-out) + soft zoom 1.035 → 1.07 | Screen **pushes left**, the menu comes in from the right | « Ta boutique en ligne » / « ici, à Kinshasa » | Voici Kuwej. Ta boutique en ligne, ici, à Kinshasa. |
| 4 | 6,5 – 10,0 s | `menu.png` (real category menu) | Phone **glides left** with −3° and 3D yaw; real category names cascade in on the right (stagger 4 f) | List slides right, titles blur out | « Tout, en » / « quelques gestes » + category list (Ordinateurs & Mode excluded) | Tu ouvres… tu explores… et tout est là, en quelques gestes. |
| 5…n | 10,0 – 24,0 s (14 s ÷ number of categories) | Per category: `cat-*.png` (if the segment is ≥ 3.7 s), then `prod-*.png` for 1–2 products | Phone **alternates left/right** (camera moves, ±3°, ±8° yaw); category page scrolls 25 %; product pages slide up; ink product cards with the **real name** + **blue price chip** slide in opposite the phone | **Horizontal push** to the next category; titles whip | « 01 / 0N » + **real category name**; card: **real product name** + **real price** | Des produits choisis avec soin… → …ce n'est pas Kuwej. |
| n+1 | 24,0 – 26,4 s | Phone back to centre with `cart.png` | Glide to centre, cart slides in, light scroll, zoom 1 → 1.06; phone **drops** out of frame | Phone falls (ease-in) | « Commande sur » / « kuwej.com » (blue slam) | Commande dès maintenant sur kuwej.com… |
| n+2 | 26,4 – 30,0 s | End card on #EDEDED | Logo, CTA, WhatsApp pill, slogan **fade up** staggered (10 f); underline draws under the slogan; **hold ≥ 1.3 s** | — | Logo · « Commande sur kuwej.com » · « WhatsApp » + **real number** · « plus mieux, c'est sûr ! » | ou écris-nous sur WhatsApp. Kuwej. Plus mieux, c'est sûr ! |

Subtitles: shown from 3 s to 24 s. They are hidden in the hook and the CTA, where the same words are already on screen as titles.

## 6. Palette, type, animation rules

**Palette (strict, no other colour):**

| Role | Hex |
|---|---|
| Background, every scene | `#EDEDED` |
| Accent: prices, keywords, kuwej.com, slogan, index numbers | `#0746C0` |
| Text, phone body, product cards, subtitle pill | `#1A1A1A` |

Text on ink or blue surfaces uses `#EDEDED`. Shadows are `#1A1A1A` at low opacity.

**Typefaces** (bundled via @fontsource, no network needed at render time):
- **Manrope** 600/700/800: titles, product names, prices, subtitles. Geometric, modern, very legible on mobile, letter-spacing −0.02 to −0.035 em.
- **Instrument Serif Italic**: the elegance accents (« L'élégance… », « ici, à Kinshasa », slogan). It carries the « Si ce n'est pas élégant, ce n'est pas Kuwej » positioning.
- `npm run capture` also records the site's own fonts (`siteFonts` in `kuwej-data.json`). If the brand uses a specific family, swap it in `src/theme.ts` and `src/fonts.ts`.

**Animation rules:**
- Springs, no linear moves. Text uses `pop` (damping 16, little overshoot). The phone and camera use `glide` (damping 22, smooth).
- Entrances take 6–12 frames. Exits take 6–8 frames, upwards with blur.
- Words stagger by 2–3 frames.
- The phone is the anchor: one position per beat, never more than one big move at a time.
- No hard cut without motion: push or whip only. No flashes, no shake, no added graphics beyond lines and pills in the palette.
- Logo: proportional scaling only. No recolour, filter, crop or stretch.
- Safe zone: all text sits between y = 250 and y = 1540. The phone body may graze the bottom band; text never does.

## 7. Project

```
assets/                 public dir (staticFile) — filled by npm run capture
  video-content.json    the only data source for the video
  kuwej-data.json       full extraction for review (all categories incl. excluded, contacts, fonts)
  screens/  logo.*  audio/voiceover.wav
src/
  timing.ts             900 frames, act boundaries, safe zone
  theme.ts  fonts.ts    palette, phone geometry, typefaces
  script.ts             FR voice-over lines + subtitle timing
  components/           Phone, Screen (scroll/zoom/push), Kinetic, Captions, Logo, SafeZones, anim
  scenes/               Hook, Store, Categories, Cta
scripts/
  capture-kuwej.mjs     Playwright capture (390×844 @3x), Ordinateurs/Mode exclusion, logo colour check
  analyze-reference.sh  reference frames + cuts
  tts-gemini.mjs        voice-over generation
```

## 8. Commands

```bash
npm install
npm run capture                 # needs access to kuwej.com → fills /assets
#   review assets/video-content.json (names, prices, WhatsApp exactly as on the site)
npm run reference               # optional, needs access to whatships.com
GEMINI_API_KEY=… npm run tts:gemini   # or put a WAV in assets/audio/ and set audio.voiceover
npm run studio                  # live preview
npm run render:safezones        # check the safe zones (overlay)
npm run render                  # → out/kuwej-reel.mp4 (H.264, 900 frames)
```

## 9. Final checklist

- [ ] Background `#EDEDED` everywhere; only `#0746C0` and `#1A1A1A` as extra colours (`src/theme.ts`)
- [ ] Logo is the site's own file, black text + blue icon (capture prints the colour check), no distortion
- [ ] Slogan exactly « plus mieux, c'est sûr ! » (`SLOGAN` in `Cta.tsx`)
- [ ] All categories from the site shown except Ordinateurs and Mode (`excludedCategories` in `kuwej-data.json`)
- [ ] 1–2 products per category, names and prices identical to the site (currency included)
- [ ] WhatsApp number identical to the site
- [ ] No text in the top 250 px or the bottom 380 px (`npm run render:safezones`)
- [ ] 1080 × 1920, 30 fps, 900 frames, H.264: `ffprobe out/kuwej-reel.mp4`
- [ ] Voice-over ≤ 29.5 s; `src/script.ts` timings aligned to the audio; subtitles in sync
- [ ] All copy in French, no English in the video
- [ ] Reference analysed and `timing.ts` adjusted (only possible once whatships.com is reachable)
