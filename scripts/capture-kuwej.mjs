#!/usr/bin/env node
// Capture real kuwej.com content for the Reel (mobile viewport 390 x 844).
//
//   npm run capture                  # https://kuwej.com/
//   KUWEJ_URL=https://… npm run capture
//
// Writes into /assets:
//   screens/*.png          real mobile screenshots (home, home-full, menu, categories, products, cart, contact)
//   logo.(png|svg|webp…)   the logo file used by the site header (untouched)
//   kuwej-data.json        everything extracted (all categories, products, prices, contacts) for review
//   video-content.json     the selection used by the video (Ordinateurs & Mode excluded, 1–2 products/category)
//
// Nothing is invented: if something cannot be found it is left null and reported.

import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright-core';

const BASE = process.env.KUWEJ_URL || 'https://kuwej.com/';
const ASSETS = path.resolve(process.env.ASSETS_DIR || 'assets');
const MAX_CATEGORIES = Number(process.env.MAX_CATEGORIES || 8);
const PRODUCTS_PER_CATEGORY = Number(process.env.PRODUCTS_PER_CATEGORY || 2);
const EXCLUDED = [/^ordinateurs?\b/, /^mode\b/]; // tested on normalised names

const CHROME_CANDIDATES = [
  process.env.CHROMIUM_PATH,
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
].filter(Boolean);

const norm = (s) =>
  (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
const slug = (s) => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'x';
const rel = (p) => path.relative(ASSETS, p).split(path.sep).join('/');
const log = (...a) => console.log('•', ...a);
const warn = (...a) => console.warn('⚠', ...a);

fs.mkdirSync(path.join(ASSETS, 'screens'), {recursive: true});

const executablePath = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
const browser = await chromium.launch({executablePath});
const context = await browser.newContext({
  viewport: {width: 390, height: 844},
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  locale: 'fr-FR',
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
});
const page = await context.newPage();

const report = {source: BASE, capturedAt: new Date().toISOString(), missing: [], excludedCategories: []};

async function open(url) {
  await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 60000});
  await page.waitForLoadState('networkidle', {timeout: 15000}).catch(() => {});
  await dismissPopups();
  // Trigger lazy-loaded images, then come back to the top.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
}

async function dismissPopups() {
  for (const label of [/accepter/i, /tout accepter/i, /j'accepte/i, /^ok$/i, /fermer/i, /accept/i, /got it/i]) {
    const btn = page.getByRole('button', {name: label}).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click({timeout: 2000}).catch(() => {});
      await page.waitForTimeout(300);
    }
  }
}

async function shot(name, {full = false} = {}) {
  const file = path.join(ASSETS, 'screens', `${name}.png`);
  if (full) {
    // Long page for the scroll animation, capped to keep the image reasonable.
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.screenshot({path: file, clip: {x: 0, y: 0, width: 390, height: Math.min(h, 5200)}, fullPage: true});
  } else {
    await page.screenshot({path: file});
  }
  const dims = await imageSize(file);
  log('screenshot', rel(file), `${dims.width}x${dims.height}`);
  return {src: rel(file), ...dims};
}

async function imageSize(file) {
  const b = fs.readFileSync(file);
  if (b.toString('ascii', 1, 4) === 'PNG') return {width: b.readUInt32BE(16), height: b.readUInt32BE(20)};
  // Other formats: ask the browser.
  const p = await context.newPage();
  const dataUrl = `data:${mime(file)};base64,${b.toString('base64')}`;
  const dims = await p.evaluate(async (u) => {
    const img = new Image();
    img.src = u;
    await img.decode();
    return {width: img.naturalWidth, height: img.naturalHeight};
  }, dataUrl);
  await p.close();
  return dims;
}

function mime(file) {
  const ext = path.extname(file).toLowerCase();
  return {'.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif'}[ext] || 'image/png';
}

async function download(url, base) {
  const res = await context.request.get(url);
  if (!res.ok()) throw new Error(`${res.status()} ${url}`);
  const type = res.headers()['content-type'] || '';
  const ext =
    (type.includes('svg') && '.svg') ||
    (type.includes('webp') && '.webp') ||
    (type.includes('jpeg') && '.jpg') ||
    (type.includes('png') && '.png') ||
    path.extname(new URL(url).pathname) ||
    '.png';
  const file = path.join(ASSETS, base + ext);
  fs.writeFileSync(file, await res.body());
  return file;
}

// ---------- 1. Home ----------
log('home', BASE);
await open(BASE);
const screens = {};
screens.home = await shot('home');
screens.homeFull = await shot('home-full', {full: true});

const homeInfo = await page.evaluate(() => {
  const abs = (h) => {
    try {
      return new URL(h, location.href).href;
    } catch {
      return null;
    }
  };
  const links = [...document.querySelectorAll('a[href]')].map((a) => ({
    href: abs(a.getAttribute('href')),
    text: (a.innerText || a.getAttribute('aria-label') || a.title || '').replace(/\s+/g, ' ').trim(),
  }));
  const bodyStyle = getComputedStyle(document.body);
  const h = document.querySelector('h1,h2');
  return {
    title: document.title,
    links,
    fonts: {body: bodyStyle.fontFamily, heading: h ? getComputedStyle(h).fontFamily : null},
    footerText: (document.querySelector('footer')?.innerText || '').replace(/\n{2,}/g, '\n').trim(),
  };
});

// ---------- 2. Logo (header image, untouched) ----------
let logo = null;
try {
  const found = await page.evaluate(() => {
    const scope = document.querySelector('header') || document.body;
    const cands = [...scope.querySelectorAll('img, svg')].filter((el) => {
      const s = `${el.getAttribute('src') || ''} ${el.getAttribute('alt') || ''} ${el.className?.baseVal ?? el.className} ${el.closest('a')?.getAttribute('href') || ''} ${el.closest('[class*=logo],[id*=logo]') ? 'logo' : ''}`.toLowerCase();
      return /logo|kuwej|brand/.test(s) || el.closest('a')?.getAttribute('href') === '/';
    });
    const el = cands[0];
    if (!el) return null;
    if (el.tagName.toLowerCase() === 'svg') return {svg: el.outerHTML};
    return {src: el.currentSrc || el.src, srcset: el.getAttribute('srcset')};
  });
  if (found?.svg) {
    const file = path.join(ASSETS, 'logo.svg');
    fs.writeFileSync(file, found.svg.includes('xmlns') ? found.svg : found.svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"'));
    logo = {src: 'logo.svg', ...(await imageSize(file))};
  } else if (found?.src) {
    // Prefer the largest srcset candidate.
    let url = found.src;
    if (found.srcset) {
      const best = found.srcset
        .split(',')
        .map((s) => s.trim().split(/\s+/))
        .sort((a, b) => parseFloat(b[1] || '1') - parseFloat(a[1] || '1'))[0];
      if (best?.[0]) url = new URL(best[0], BASE).href;
    }
    const file = await download(url, 'logo');
    logo = {src: rel(file), ...(await imageSize(file))};
  }
} catch (e) {
  warn('logo:', e.message);
}
if (logo) {
  log('logo', logo.src, `${logo.width}x${logo.height}`);
  // Colour check: expected black text + blue icon.
  const p = await context.newPage();
  const b = fs.readFileSync(path.join(ASSETS, logo.src));
  logo.colorCheck = await p.evaluate(async (u) => {
    const img = new Image();
    img.src = u;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = Math.min(img.naturalWidth, 1200);
    c.height = Math.round((c.width / img.naturalWidth) * img.naturalHeight);
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0, c.width, c.height);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let dark = 0, blue = 0, other = 0;
    for (let i = 0; i < d.length; i += 4) {
      const [r, gg, bb, a] = [d[i], d[i + 1], d[i + 2], d[i + 3]];
      if (a < 128) continue;
      if (r > 225 && gg > 225 && bb > 225) continue; // white background
      if (r < 70 && gg < 70 && bb < 70) dark++;
      else if (bb > 120 && bb > r + 50 && bb > gg + 30) blue++;
      else other++;
    }
    const t = dark + blue + other || 1;
    return {darkPct: +((dark / t) * 100).toFixed(1), bluePct: +((blue / t) * 100).toFixed(1), otherPct: +((other / t) * 100).toFixed(1)};
  }, `data:${mime(logo.src)};base64,${b.toString('base64')}`);
  await p.close();
  const ok = logo.colorCheck.darkPct > 10 && logo.colorCheck.bluePct > 3;
  log('logo colours', JSON.stringify(logo.colorCheck), ok ? '→ black + blue ✔' : '→ CHECK MANUALLY');
} else {
  report.missing.push('logo');
}

// ---------- 3. Category menu ----------
await open(BASE);
const menuSelectors = [
  'button[aria-label*="menu" i]',
  '[aria-controls*="menu" i]',
  '.menu-toggle',
  '.hamburger',
  '[class*="burger"]',
  '[class*="mobile-menu"] button',
  'button:has(svg)',
];
for (const sel of menuSelectors) {
  const el = page.locator(sel).first();
  if (await el.isVisible().catch(() => false)) {
    await el.click({timeout: 3000}).catch(() => {});
    await page.waitForTimeout(900);
    break;
  }
}
screens.menu = await shot('menu');

const menuLinks = await page.evaluate(() =>
  [...document.querySelectorAll('a[href]')]
    .filter((a) => a.offsetParent !== null)
    .map((a) => ({href: new URL(a.getAttribute('href'), location.href).href, text: (a.innerText || '').replace(/\s+/g, ' ').trim()})),
);

// ---------- 4. Categories ----------
const CAT_RE = /\/(product-category|categorie|categories|category|collections|catalog|c)\/[^/?#]+/i;
const seen = new Map();
for (const l of [...menuLinks, ...homeInfo.links]) {
  if (!l.href || !l.text || !CAT_RE.test(l.href)) continue;
  if (!l.href.startsWith(new URL(BASE).origin)) continue;
  if (/\/collections\/all\/?$/.test(l.href)) continue;
  const key = l.href.replace(/[?#].*$/, '').replace(/\/$/, '');
  if (!seen.has(key)) seen.set(key, {name: l.text, url: l.href});
}
const allCategories = [...seen.values()];
const keptCategories = allCategories.filter((c) => {
  const excluded = EXCLUDED.some((re) => re.test(norm(c.name)));
  if (excluded) report.excludedCategories.push(c.name);
  return !excluded;
});
log('categories found:', allCategories.map((c) => c.name).join(' | ') || '(none)');
log('excluded:', report.excludedCategories.join(' | ') || '(none)');
if (keptCategories.length === 0) report.missing.push('categories');

const PRODUCT_RE = /\/(product|produit|products|produits|p|item)\/[^/?#]+/i;

async function extractProduct(url) {
  await open(url);
  const data = await page.evaluate(() => {
    const txt = (el) => (el ? (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim() : '');
    // JSON-LD (WooCommerce / Shopify) as a cross-check.
    let ld = null;
    for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
      try {
        const j = JSON.parse(s.textContent);
        const items = [j, ...(j['@graph'] || [])].flat();
        const p = items.find((x) => x && (x['@type'] === 'Product' || (Array.isArray(x['@type']) && x['@type'].includes('Product'))));
        if (p) {
          const o = Array.isArray(p.offers) ? p.offers[0] : p.offers;
          ld = {name: p.name, price: o?.price ?? o?.lowPrice ?? null, currency: o?.priceCurrency ?? null};
        }
      } catch {}
    }
    const name = txt(document.querySelector('h1.product_title, h1[itemprop="name"], .product__title h1, h1'));
    // Visible price, exactly as displayed (current price, not the struck-through one).
    const priceEl =
      document.querySelector('.summary .price ins, .product .price ins') ||
      document.querySelector('.summary .price, .product-info .price, [itemprop="price"], .price__current, .product__price, .price-item--sale, .price-item--regular, [class*="price"]:not(del)');
    const og = document.querySelector('meta[property="og:image"]')?.content || null;
    return {name, price: txt(priceEl), ld, image: og};
  });
  return data;
}

const categories = [];
for (const c of keptCategories.slice(0, MAX_CATEGORIES)) {
  log('category', c.name, c.url);
  await open(c.url);
  const screenshot = await shot(`cat-${slug(c.name)}`);
  const productLinks = await page.evaluate(
    (reSrc) => {
      const re = new RegExp(reSrc, 'i');
      const out = [];
      for (const a of document.querySelectorAll('a[href]')) {
        const href = new URL(a.getAttribute('href'), location.href).href;
        if (re.test(href) && !out.includes(href.replace(/[?#].*$/, ''))) out.push(href.replace(/[?#].*$/, ''));
      }
      return out;
    },
    PRODUCT_RE.source,
  );
  const products = [];
  for (const url of productLinks.slice(0, PRODUCTS_PER_CATEGORY)) {
    const d = await extractProduct(url);
    if (!d.name || !d.price) {
      warn('  product skipped (name or price not found):', url);
      continue;
    }
    const s = await shot(`prod-${slug(c.name)}-${slug(d.name)}`);
    products.push({name: d.name, price: d.price, url, screenshot: s, jsonLd: d.ld});
    log('  product', d.name, '→', d.price);
  }
  if (products.length === 0) report.missing.push(`products for "${c.name}"`);
  categories.push({name: c.name, url: c.url, screenshot, products});
}

// ---------- 5. Cart (add the first captured product, then open the cart) ----------
const firstProduct = categories.flatMap((c) => c.products)[0];
if (firstProduct) {
  await open(firstProduct.url);
  const add = page.getByRole('button', {name: /ajouter au panier|add to cart|acheter|commander/i}).first();
  if (await add.isVisible().catch(() => false)) {
    await add.click({timeout: 5000}).catch(() => {});
    await page.waitForTimeout(2500);
  }
}
const cartLink = homeInfo.links.find((l) => l.href && /\/(cart|panier)\b/i.test(l.href));
const cartUrls = [cartLink?.href, new URL('/panier/', BASE).href, new URL('/cart/', BASE).href, new URL('/cart', BASE).href].filter(Boolean);
for (const u of cartUrls) {
  const res = await page.goto(u, {waitUntil: 'domcontentloaded'}).catch(() => null);
  if (res && res.ok()) {
    await page.waitForLoadState('networkidle', {timeout: 10000}).catch(() => {});
    await dismissPopups();
    screens.cart = await shot('cart');
    break;
  }
}
if (!screens.cart) report.missing.push('cart');

// ---------- 6. Contact / WhatsApp ----------
const contact = {whatsapp: null, whatsappLink: null, phones: [], emails: [], footer: homeInfo.footerText};
const contactLink = homeInfo.links.find((l) => /contact/i.test(l.text) || /\/contact/i.test(l.href || ''));
const contactPages = [BASE, contactLink?.href].filter(Boolean);
for (const u of contactPages) {
  await open(u);
  if (u !== BASE) screens.contact = await shot('contact');
  const found = await page.evaluate(() => {
    const as = [...document.querySelectorAll('a[href]')];
    const wa = as.find((a) => /wa\.me|whatsapp\.com/i.test(a.href));
    const text = document.body.innerText;
    // A number written next to the word WhatsApp, as displayed on the page.
    const m = text.match(/whats\s?app[^\d+]{0,20}(\+?\d[\d\s.\-()]{7,18}\d)/i);
    return {
      waHref: wa?.href || null,
      waText: m ? m[1].trim() : null,
      tels: as.filter((a) => a.href.startsWith('tel:')).map((a) => (a.innerText || '').trim() || a.href.slice(4)),
      mails: as.filter((a) => a.href.startsWith('mailto:')).map((a) => a.href.slice(7).split('?')[0]),
    };
  });
  contact.whatsappLink ??= found.waHref;
  contact.whatsapp ??= found.waText;
  contact.phones.push(...found.tels);
  contact.emails.push(...found.mails);
}
if (!contact.whatsapp && contact.whatsappLink) {
  // Number from the wa.me link itself (digits exactly as on the site).
  const digits = contact.whatsappLink.match(/(?:wa\.me\/|phone=)(\d{8,15})/);
  if (digits) contact.whatsapp = `+${digits[1]}`;
}
contact.phones = [...new Set(contact.phones)];
contact.emails = [...new Set(contact.emails)];
if (!contact.whatsapp) report.missing.push('whatsapp');
log('whatsapp', contact.whatsapp ?? '(not found)');

await browser.close();

// ---------- 7. Write data ----------
const strip = ({jsonLd, ...p}) => p;
const data = {
  ...report,
  title: homeInfo.title,
  siteFonts: homeInfo.fonts,
  logo,
  contact,
  allCategories,
  categories,
  screens,
};
fs.writeFileSync(path.join(ASSETS, 'kuwej-data.json'), JSON.stringify(data, null, 2));

const contentFile = path.join(ASSETS, 'video-content.json');
const prev = fs.existsSync(contentFile) ? JSON.parse(fs.readFileSync(contentFile, 'utf8')) : {};
const video = {
  source: BASE,
  capturedAt: report.capturedAt,
  logo: logo ? {src: logo.src, width: logo.width, height: logo.height} : null,
  whatsapp: contact.whatsapp,
  screens: {home: screens.home ?? null, homeFull: screens.homeFull ?? null, menu: screens.menu ?? null, cart: screens.cart ?? null},
  categories: categories
    .filter((c) => c.products.length > 0)
    .map((c) => ({...c, products: c.products.map(strip)})),
  audio: prev.audio ?? {voiceover: null, music: null, musicVolume: 0.18},
};
fs.writeFileSync(contentFile, JSON.stringify(video, null, 2));

console.log('\n✔ wrote assets/kuwej-data.json and assets/video-content.json');
if (report.missing.length) console.log('⚠ missing:', report.missing.join(', '), '→ complete by hand (real data only).');
console.log('Review video-content.json (names/prices exactly as on the site) before rendering.');
