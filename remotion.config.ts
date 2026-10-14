import fs from 'node:fs';
import {Config} from '@remotion/cli/config';

// Every image / audio file lives in /assets and is read with staticFile().
Config.setPublicDir('./assets');

// Final export: MP4 H.264, yuv420p (Instagram-compatible), high quality.
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
Config.setColorSpace('bt709');
Config.setCrf(16);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);

// Use the pre-installed headless Chromium when it exists (no download needed).
const localShell = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browser = process.env.REMOTION_BROWSER ?? (fs.existsSync(localShell) ? localShell : null);
if (browser) {
  Config.setBrowserExecutable(browser);
}
