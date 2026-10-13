# Motion — Kuwej Reel 30 s

Remotion project for a 30-second Instagram Reel (1080 × 1920, 30 fps, 900 frames, MP4 H.264) for [kuwej.com](https://kuwej.com/). All video copy is in French.

- **Brief, storyboard, palette, rules, checklist:** [`docs/BRIEF.md`](docs/BRIEF.md)
- **Voice-over script + TTS style prompts:** [`docs/VOICEOVER.md`](docs/VOICEOVER.md)

## Quick start

```bash
npm install
npm run capture        # real kuwej.com screenshots + data → /assets (needs network access to kuwej.com)
npm run studio         # preview
npm run render         # → out/kuwej-reel.mp4
```

All on-screen data (categories, products, prices, WhatsApp, logo) comes from `assets/video-content.json`, which `npm run capture` writes from the live site. Ordinateurs and Mode are excluded automatically. Nothing is hard-coded.
