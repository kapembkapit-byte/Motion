// Rendu image par image de index.html (three.js) dans Chromium, puis encodage ffmpeg.
//   node render.mjs                 -> ../kuwej_smartwatch_serie10_pub.mp4
//   node render.mjs --preview 2 7.5 -> PNG d'aperçu dans ./preview/
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const OUT = path.join(ROOT, "kuwej_smartwatch_serie10_pub.mp4");
const FPS = 30;

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".png": "image/png", ".json": "application/json" };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const url = `http://127.0.0.1:${server.address().port}/3d/index.html`;

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on("console", (m) => console.log("[page]", m.text()));
page.on("pageerror", (e) => { console.error("[page error]", e); process.exit(1); });
await page.goto(url);
await page.waitForFunction(() => window.ready === true, null, { timeout: 120000 });
const T = await page.evaluate(() => window.T);

async function frame(t) {
  await page.evaluate((tt) => window.renderAt(tt), t);
  return page.screenshot({ type: "png" });
}

const args = process.argv.slice(2);
if (args[0] === "--preview") {
  const dir = path.join(HERE, "preview");
  fs.mkdirSync(dir, { recursive: true });
  for (const s of args.slice(1)) {
    const t0 = Date.now();
    fs.writeFileSync(path.join(dir, `t_${Number(s).toFixed(2).padStart(5, "0")}.png`), await frame(Number(s)));
    console.log(`t=${s} (${Date.now() - t0} ms)`);
  }
} else {
  const wav = path.join(HERE, "music.wav");
  const py = spawnSync("python3", [path.join(HERE, "music.py"), wav, JSON.stringify(T)], { stdio: "inherit" });
  if (py.status !== 0) throw new Error("music.py a échoué");
  const ff = spawn("ffmpeg", ["-y", "-v", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "png", "-i", "-",
    "-i", wav, "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", OUT], { stdio: ["pipe", "inherit", "inherit"] });
  const total = Math.round(T.end * FPS);
  const t0 = Date.now();
  for (let i = 0; i < total; i++) {
    const buf = await frame(i / FPS);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (i % 30 === 0) console.log(`${i}/${total}  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  fs.unlinkSync(wav);
  console.log("OK ->", OUT);
}
await browser.close();
server.close();
