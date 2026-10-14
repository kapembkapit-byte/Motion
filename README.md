# Motion — Kuwej Reel 30 s

Remotion project for a 30-second Instagram Reel (1080 × 1920, 30 fps, 900 frames, MP4 H.264) for [kuwej.com](https://kuwej.com/), in the style and rhythm of the reference ad. All copy is in French.

- **Brief, reference analysis, storyboard, palette, checklist:** [`docs/BRIEF.md`](docs/BRIEF.md)
- **Voice-over script + TTS style prompts:** [`docs/VOICEOVER.md`](docs/VOICEOVER.md)
- **Real site data (screenshots, logo, catalogue, WhatsApp):** [`assets/`](assets/README.md). The video reads only `assets/video-content.json`.

```bash
npm install
npm run studio            # preview
npm run render            # → out/kuwej-reel.mp4
npm run render:safezones  # safe-zone overlay check
python3 scripts/place-voiceover.py      # place the Fish Audio voice-over on the beats (29.9 s)
python3 scripts/audio/make_audio.py    # original music + sound effects + master mix (pip install -r scripts/audio/requirements.txt)
```
