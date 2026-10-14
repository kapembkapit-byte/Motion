// Montre connectée en 3D (three.js) animée image par image pour la pub Kuwej.
// window.renderAt(t) dessine l'instant t (secondes) : 3D + textes en surimpression.
import * as THREE from "three";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";

// ---------------------------------------------------------------------------
// Timeline (secondes) — partagée avec music.py
// ---------------------------------------------------------------------------
export const T = {
  macro1: 0, macro2: 0.75, hero: 1.5, screen: 1.5, bands: 10.5, charge: 13.5, cta: 15.0, end: 19.0,
};
const SCREENS = ["face", "clock", "call", "notifs", "heart", "activity"];
const CAPTIONS = ["Design premium", "Toujours à l'heure", "Appels au poignet",
  "Notifications instantanées", "Suivi cardiaque", "Suivi d'activité & sport"];

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const easeOut = (x) => 1 - (1 - clamp(x)) ** 3;
const easeInOut = (x) => { x = clamp(x); return x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2; };
const backOut = (x, s = 1.7) => { x = clamp(x); return 1 + (s + 1) * (x - 1) ** 3 + s * (x - 1) ** 2; };
const lerp = (a, b, k) => a + (b - a) * k;
const rad = THREE.MathUtils.degToRad;

// ---------------------------------------------------------------------------
// Renderer / caméra
// ---------------------------------------------------------------------------
const W = 1080, H = 1920;
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("gl"), antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color("#ededed");

const FOV = 20, DIST = 356;
const camera = new THREE.PerspectiveCamera(FOV, W / H, 1, 3000);
const PX_PER_MM = H / (2 * DIST * Math.tan(rad(FOV / 2))); // à z = 0

// Studio : boîtes à lumière émissives -> reflets nets sur le métal et le verre
function studioEnvironment() {
  const env = new THREE.Scene();
  const back = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0.16, 0.16, 0.17), side: THREE.BackSide }));
  env.add(back);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(800, 800),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0.45, 0.45, 0.46) }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -160; env.add(floor);
  const box = (w, h, pos, k) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k, k), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m);
  };
  box(260, 140, [-160, 220, 180], 6.0);  // key haut-gauche
  box(70, 380, [260, 20, 90], 4.5);      // bande droite
  box(70, 380, [-280, -10, -40], 3.0);   // bande gauche arrière
  box(420, 60, [0, -120, 260], 1.6);     // fill bas
  box(200, 200, [0, 320, -120], 2.5);    // contre-jour haut
  const pm = new THREE.PMREMGenerator(renderer);
  return pm.fromScene(env, 0.025, 1, 2000).texture;
}
scene.environment = studioEnvironment();

// ---------------------------------------------------------------------------
// Géométrie de la montre (unités : mm)
// ---------------------------------------------------------------------------
function roundedRect(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function squircleShape(w, h, n = 4.2, seg = 480) {
  // superellipse : coins plus doux que des quarts de cercle, proche du design réel
  const s = new THREE.Shape();
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    const c = Math.cos(a), si = Math.sin(a);
    const x = (w / 2) * Math.sign(c) * Math.abs(c) ** (2 / n);
    const y = (h / 2) * Math.sign(si) * Math.abs(si) ** (2 / n);
    i === 0 ? s.moveTo(x, y) : s.lineTo(x, y);
  }
  return s;
}

// ExtrudeGeometry n'est pas indexée -> normales facettées ; on soude les sommets
function smooth(g) {
  g.deleteAttribute("normal");
  const m = mergeVertices(g, 1e-4);
  m.computeVertexNormals();
  return m;
}

const CASE_W = 39, CASE_H = 46, CASE_D = 10.8;
const watch = new THREE.Group();
const body = new THREE.Group(); // tout sauf le chargeur
watch.add(body);
scene.add(watch);

const metal = new THREE.MeshPhysicalMaterial({ color: new THREE.Color("#d4d5d8"), metalness: 1, roughness: 0.2, envMapIntensity: 1.15 });

// Boîtier
{
  const bev = 2.6, depth = CASE_D - 2 * bev;
  const g = new THREE.ExtrudeGeometry(squircleShape(CASE_W - 2 * bev, CASE_H - 2 * bev, 4.6), {
    depth, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 14, curveSegments: 160,
  });
  g.translate(0, 0, -depth / 2);
  body.add(new THREE.Mesh(smooth(g), metal));
}

// Verre + écran (l'écran est une texture émissive sur la face avant du verre)
const SCR_PX_PER_MM = 32;
const GLASS_W = 36.6, GLASS_H = 43.6;
const screenCanvas = document.createElement("canvas");
screenCanvas.width = Math.round(GLASS_W * SCR_PX_PER_MM);
screenCanvas.height = Math.round(GLASS_H * SCR_PX_PER_MM);
const sctx = screenCanvas.getContext("2d");
const screenTex = new THREE.CanvasTexture(screenCanvas);
screenTex.colorSpace = THREE.SRGBColorSpace;
screenTex.anisotropy = 8;
const glassMat = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#020203"), metalness: 0, roughness: 0.03, clearcoat: 1, clearcoatRoughness: 0.02,
  emissive: new THREE.Color("#ffffff"), emissiveMap: screenTex, emissiveIntensity: 1, envMapIntensity: 0.55,
});
{
  const bev = 1.0, depth = 0.4;
  const g = new THREE.ExtrudeGeometry(squircleShape(GLASS_W - 2 * bev, GLASS_H - 2 * bev, 4.6), {
    depth, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 10, curveSegments: 160,
  });
  g.computeBoundingBox();
  const bb = g.boundingBox, pos = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) - bb.min.x) / (bb.max.x - bb.min.x), (pos.getY(i) - bb.min.y) / (bb.max.y - bb.min.y));
  }
  const m = new THREE.Mesh(smooth(g), glassMat);
  m.position.z = CASE_D / 2 - 1.1;
  body.add(m);
}

// Couronne crantée + bouton latéral
const crown = new THREE.Group();
{
  const g = new THREE.CylinderGeometry(3.7, 3.7, 3.4, 144, 1);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z);
    if (r > 3.0) {
      const a = Math.atan2(z, x), k = 1 - 0.045 * (0.5 + 0.5 * Math.cos(a * 72));
      p.setX(i, x * k); p.setZ(i, z * k);
    }
  }
  g.computeVertexNormals();
  g.rotateZ(Math.PI / 2);
  const polished = metal.clone(); polished.roughness = 0.1; polished.color.set("#e2e3e6");
  const knurl = new THREE.Mesh(g, polished);
  knurl.position.x = 2.4;
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 2.4, 48).rotateZ(Math.PI / 2), metal);
  crown.add(knurl, stem);
  crown.position.set(CASE_W / 2 - 0.6, 8.5, 0.3);
  body.add(crown);

  const btn = new THREE.Mesh(new THREE.CapsuleGeometry(1.5, 8.5, 8, 24), metal);
  btn.scale.set(0.75, 1, 1);
  btn.position.set(CASE_W / 2 + 0.25, -7.5, 0.3);
  body.add(btn);

  const slotMat = new THREE.MeshStandardMaterial({ color: "#0b0b0c", roughness: 0.6 });
  for (const y of [-2, 4]) {
    const s = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 5, 4, 12), slotMat);
    s.position.set(-CASE_W / 2 + 0.12, y, 0.3); s.scale.set(0.35, 1, 0.8);
    body.add(s);
  }
}

// Dos : dôme capteurs
{
  const R = 40, cap = 14, th = Math.asin(cap / R);
  const g = new THREE.SphereGeometry(R, 96, 24, 0, Math.PI * 2, 0, th);
  g.rotateX(-Math.PI / 2);
  g.translate(0, 0, -CASE_D / 2 + 0.6 + R * Math.cos(th)); // base du dôme sur le dos
  const dome = new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({ color: "#151517", roughness: 0.12, clearcoat: 1, metalness: 0.1 }));
  body.add(dome);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(9.5, 0.28, 12, 96),
    new THREE.MeshPhysicalMaterial({ color: "#8a8b8f", metalness: 1, roughness: 0.3 }));
  ring.position.z = -CASE_D / 2 - 0.75;
  body.add(ring);
}

// Bracelet sport : boucle continue autour d'un poignet invisible
const bandMat = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#232326"), roughness: 0.52, metalness: 0, clearcoat: 0.25, clearcoatRoughness: 0.5,
  sheen: 0.4, sheenRoughness: 0.6, sheenColor: new THREE.Color("#555"),
});
{
  const pts = [
    [19, -1.6], [24, -1.6], [30, -3.5], [35.5, -10], [37.5, -20], [35, -30], [27, -38.5], [14, -43], [0, -44.5],
    [-14, -43], [-27, -38.5], [-35, -30], [-37.5, -20], [-35.5, -10], [-30, -3.5], [-24, -1.6], [-19, -1.6],
  ].map(([y, z]) => new THREE.Vector3(0, y, z));
  const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
  const N = 420, M = 56, thick = 3.3;
  const X = new THREE.Vector3(1, 0, 0);
  const verts = [], idx = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, P = curve.getPointAt(u), Tg = curve.getTangentAt(u);
    const Nn = new THREE.Vector3().crossVectors(Tg, X).normalize();
    const lug = Math.min(1, Math.min(u, 1 - u) / 0.06);
    const w = lerp(24.2, 22.6, easeInOut(lug));
    for (let j = 0; j < M; j++) {
      const a = (j / M) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      const ex = (w / 2) * Math.sign(c) * Math.abs(c) ** (2 / 5);
      const ey = (thick / 2) * Math.sign(s) * Math.abs(s) ** (2 / 3);
      verts.push(P.x + X.x * ex + Nn.x * ey, P.y + X.y * ex + Nn.y * ey, P.z + X.z * ex + Nn.z * ey);
    }
  }
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
    const a = i * M + j, b = i * M + ((j + 1) % M), c = (i + 1) * M + j, d = (i + 1) * M + ((j + 1) % M);
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const band = new THREE.Mesh(g, bandMat);
  body.add(band);
}

// Chargeur magnétique (palet blanc + câble)
const charger = new THREE.Group();
{
  const prof = [];
  const add = (x, y) => prof.push(new THREE.Vector2(x, y));
  add(0, 2.4);
  for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI / 2; add(12.2 + 1.4 * Math.sin(a), 1.0 + 1.4 * Math.cos(a)); }
  for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI / 2; add(12.6 + 1.0 * Math.cos(a), -1.6 - 1.0 * Math.sin(a)); }
  add(0, -2.6);
  const white = new THREE.MeshPhysicalMaterial({ color: "#f4f4f5", roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.2 });
  const puck = new THREE.Mesh(new THREE.LatheGeometry(prof, 128), white);
  puck.rotation.x = Math.PI / 2; // axe le long de z
  charger.add(puck);
  const pad = new THREE.Mesh(new THREE.CircleGeometry(10.5, 96),
    new THREE.MeshPhysicalMaterial({ color: "#e6e6e8", roughness: 0.5 }));
  pad.position.z = 2.45; charger.add(pad);
  const cable = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -12, -1.5), new THREE.Vector3(0, -22, -4), new THREE.Vector3(4, -40, -14), new THREE.Vector3(10, -90, -30),
  ]);
  charger.add(new THREE.Mesh(new THREE.TubeGeometry(cable, 80, 1.6, 20), white));
  charger.visible = false;
  watch.add(charger);
}

// ---------------------------------------------------------------------------
// Écrans (dessinés en 2D sur la texture du verre)
// ---------------------------------------------------------------------------
const faceImg = new Image();
faceImg.src = "../assets/1.png";
const DW = 820, DH = 1000; // espace de dessin de la zone active
const INSET = 2.4 * SCR_PX_PER_MM;

function roundRectPath(c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
const F = (w, s, fam = "Inter") => `${w} ${s}px "${fam}"`;
function statusTime(c) { c.font = F(600, 44); c.fillStyle = "#fff"; c.textAlign = "right"; c.textBaseline = "alphabetic"; c.fillText("10:09", DW - 64, 96); }
function glow(c, x, y, r, col) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, col); g.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = g; c.fillRect(0, 0, DW, DH);
}
function handset(c, x, y, r, ang, col) {
  c.save(); c.translate(x, y); c.rotate(rad(ang));
  c.strokeStyle = col; c.lineWidth = r * 0.48; c.lineCap = "round";
  c.beginPath(); c.arc(0, 0, r, rad(-62), rad(62)); c.stroke(); c.restore();
}

const drawScreen = {
  face(c, t) {
    if (!faceImg.complete) return;
    const k = 1 + 0.1 * Math.sin(t * 4);
    c.filter = `brightness(${k})`;
    // zone verre de l'image produit (436x476) recadrée pour remplir l'écran
    c.drawImage(faceImg, 336, 330, 404, 456, -20, -12, DW + 40, DH + 24);
    c.filter = "none";
  },
  clock(c, t) {
    glow(c, DW / 2, DH * 0.62, DW * 0.75, "rgba(25,70,170,0.9)");
    c.textAlign = "center"; c.textBaseline = "middle";
    c.font = F(600, 44); c.fillStyle = "#ff9f0a"; c.fillText("MAR. 14 OCT.", DW / 2, 190);
    c.font = F(600, 270, "Inter Display"); c.fillStyle = "#fff";
    c.textAlign = "right"; c.fillText("10", DW / 2 - 38, 450);
    c.textAlign = "left"; c.fillText("09", DW / 2 + 38, 450);
    c.textAlign = "center"; c.fillStyle = (t % 1) < 0.5 ? "#fff" : "#5a5a5f"; c.fillText(":", DW / 2, 435);
    const items = [["#ff375f", "BPM", "72"], ["#30d158", "PAS", "8,5k"], ["#64d2ff", "BAT", "96%"]];
    items.forEach(([col, lab, val], i) => {
      const x = DW / 2 + (i - 1) * 250, y = 790, r = 92;
      c.lineWidth = 14; c.strokeStyle = "#3c3c40"; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = col; c.lineCap = "round"; c.beginPath();
      c.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * easeOut(t / 0.9) * (0.55 + 0.15 * i)); c.stroke();
      c.fillStyle = "#fff"; c.font = F(600, 50); c.fillText(val, x, y - 8);
      c.fillStyle = col; c.font = F(600, 26); c.fillText(lab, x, y + 40);
    });
  },
  call(c, t) {
    statusTime(c);
    c.textAlign = "center"; c.textBaseline = "middle";
    c.font = F(500, 46); c.fillStyle = "#a0a0a5"; c.fillText("Appel entrant…", DW / 2, 190);
    const cx = DW / 2, cy = 420, r = 130;
    for (let k = 0; k < 3; k++) {
      const ph = (t * 0.9 + k / 3) % 1;
      c.strokeStyle = `rgba(88,86,214,${0.55 * (1 - ph)})`; c.lineWidth = 6;
      c.beginPath(); c.arc(cx, cy, r * (1.12 + ph * 0.6), 0, Math.PI * 2); c.stroke();
    }
    const g = c.createLinearGradient(0, cy - r, 0, cy + r); g.addColorStop(0, "#7d7bf0"); g.addColorStop(1, "#4b48c9");
    c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#fff"; c.font = F(600, 124); c.fillText("M", cx, cy + 6);
    c.font = F(600, 76); c.fillText("Maman", DW / 2, 640);
    const by = 860;
    [[DW / 2 - 200, "#ff3b30", -90], [DW / 2 + 200, "#30d158", 135]].forEach(([x, col, ang], i) => {
      const s = i === 1 ? 1 + 0.07 * Math.sin(t * 10) : 1;
      c.fillStyle = col; c.beginPath(); c.arc(x, by, 100 * s, 0, Math.PI * 2); c.fill();
      handset(c, x, by + (i === 0 ? 22 : 0), 44, ang, "#fff");
    });
  },
  notifs(c, t) {
    statusTime(c);
    c.textAlign = "left"; c.textBaseline = "alphabetic";
    c.font = F(600, 46); c.fillStyle = "#fff"; c.fillText("Notifications", 64, 96);
    const cards = [["#25d366", "WHATSAPP", "Commande confirmée !"], ["#1a4fc9", "KUWEJ", "Votre colis arrive"], ["#ff9f0a", "RAPPEL", "Réunion à 11:00"]];
    cards.forEach(([col, app, msg], i) => {
      const p = easeOut((t - 0.12 - i * 0.22) / 0.35);
      if (p <= 0) return;
      const y = 170 + i * 272 + (1 - p) * 140;
      c.globalAlpha = p;
      c.fillStyle = "#2c2c2e"; roundRectPath(c, 40, y, DW - 80, 248, 54); c.fill();
      c.fillStyle = col; c.beginPath(); c.arc(112, y + 76, 38, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#aaaab0"; c.font = F(600, 34); c.fillText(app, 170, y + 88);
      c.fillStyle = "#fff"; c.font = F(600, 50); c.fillText(msg, 76, y + 192);
      c.globalAlpha = 1;
    });
  },
  heart(c, t) {
    const beat = (t * 1.25) % 1, s = 1 + 0.12 * Math.exp(-beat * 9);
    glow(c, DW / 2, 430, 380 * s, "rgba(170,10,25,0.9)");
    statusTime(c);
    c.save(); c.translate(DW / 2, 420); c.scale(14 * s, 14 * s);
    c.beginPath();
    for (let i = 0; i <= 120; i++) {
      const a = (i / 120) * Math.PI * 2;
      const x = 16 * Math.sin(a) ** 3, y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    const g = c.createRadialGradient(-5, -6, 1, 0, 0, 20); g.addColorStop(0, "#ff6b75"); g.addColorStop(1, "#d0101f");
    c.fillStyle = g; c.fill(); c.restore();
    c.textAlign = "left"; c.textBaseline = "alphabetic"; c.fillStyle = "#fff";
    c.font = F(500, 44); c.fillText("Actuel", 64, 790);
    const bpm = String(68 + Math.round(4 * easeOut(t / 1.2)));
    c.font = F(600, 150, "Inter Display"); c.fillText(bpm, 60, 935);
    const w = c.measureText(bpm).width;
    c.fillStyle = "#ff3b30"; c.font = F(600, 56); c.fillText("BPM", 80 + w, 930);
  },
  activity(c, t) {
    statusTime(c);
    c.textAlign = "left"; c.textBaseline = "alphabetic";
    c.font = F(600, 46); c.fillStyle = "#30d158"; c.fillText("Activité", 64, 96);
    const cx = DW / 2, cy = 450, p = easeInOut(t / 1.1);
    [["#fa114f", 0.82, 270], ["#a6ff00", 0.68, 190], ["#00e6ff", 0.9, 110]].forEach(([col, goal, r]) => {
      c.lineWidth = 72; c.lineCap = "round";
      c.strokeStyle = col; c.globalAlpha = 0.22; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
      c.globalAlpha = 1;
      if (p > 0.01) { c.beginPath(); c.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * goal * p); c.stroke(); }
    });
    const q = easeOut(t / 1.1);
    c.font = F(600, 50);
    c.fillStyle = "#fa114f"; c.fillText(`${Math.round(420 * q)} KCAL`, 64, 860);
    c.fillStyle = "#a6ff00"; c.fillText(`${Math.round(8540 * q).toLocaleString("fr-FR")} PAS`, 64, 925);
    c.fillStyle = "#00e6ff"; c.textAlign = "right"; c.fillText(`${Math.round(36 * q)} MIN`, DW - 64, 860);
  },
  charging(c, t) {
    statusTime(c);
    const cx = DW / 2, cy = 440, r = 250, pct = 0.78 + 0.04 * easeOut(t / 0.8);
    c.lineWidth = 36; c.lineCap = "round";
    c.strokeStyle = "rgba(48,209,88,0.2)"; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = "#30d158"; c.beginPath(); c.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct); c.stroke();
    c.fillStyle = "#30d158"; c.beginPath();
    [[30, -150], [-90, 20], [-5, 20], [-30, 150], [90, -20], [5, -20]].forEach(([x, y], i) => i ? c.lineTo(cx + x, cy + y) : c.moveTo(cx + x, cy + y));
    c.closePath(); c.fill();
    c.textAlign = "center"; c.textBaseline = "alphabetic";
    c.fillStyle = "#fff"; c.font = F(600, 110, "Inter Display"); c.fillText(`${Math.round(pct * 100)}%`, cx, 870);
    c.fillStyle = "#30d158"; c.font = F(600, 44); c.fillText("En charge", cx, 945);
  },
};

function paintScreen(name, t, { wake = 1, prev = null, prevT = 0, mix = 1 } = {}) {
  const c = sctx, cw = screenCanvas.width, ch = screenCanvas.height;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalAlpha = 1; c.fillStyle = "#000"; c.fillRect(0, 0, cw, ch);
  const aw = cw - 2 * INSET, ah = ch - 2 * INSET;
  const draw = (nm, tt, alpha, zoom) => {
    if (alpha <= 0) return;
    c.save();
    roundRectPath(c, INSET, INSET, aw, ah, 7.5 * SCR_PX_PER_MM); c.clip();
    c.translate(cw / 2, ch / 2); c.scale(zoom, zoom); c.translate(-cw / 2, -ch / 2);
    c.translate(INSET, INSET); c.scale(aw / DW, ah / DH);
    c.globalAlpha = alpha;
    c.fillStyle = "#000"; c.fillRect(0, 0, DW, DH);
    drawScreen[nm](c, tt);
    c.restore();
  };
  if (prev && mix < 1) draw(prev, prevT, 1, 1);
  draw(name, t, prev ? mix : 1, lerp(1.06, 1, easeOut(wake)));
  c.setTransform(1, 0, 0, 1, 0, 0);
  screenTex.needsUpdate = true;
  glassMat.emissiveIntensity = 1.08 * clamp(wake);
}

// ---------------------------------------------------------------------------
// Surimpressions HTML
// ---------------------------------------------------------------------------
const $ = (id) => document.getElementById(id);
const ui = {};
for (const id of ["logo", "t1", "t2", "cap", "dots", "hurry", "price", "old", "pill", "site", "wa", "flash"]) ui[id] = $(id);
function show(id, o, dy = 0, scale = 1) {
  const e = ui[id];
  e.style.opacity = clamp(o);
  e.style.transform = `translateY(${dy}px) scale(${scale})`;
}
function appear(t, start, dur = 0.45) { const p = easeOut((t - start) / dur); return [p, (1 - p) * 40]; }
function hideAll() { for (const k in ui) if (k !== "flash") show(k, 0); }

// ---------------------------------------------------------------------------
// Placement : met le boîtier (46 mm) à la position écran voulue
// ---------------------------------------------------------------------------
function place(cxPx, cyPx, pxPerMm) {
  camera.position.set(0, 0, DIST); camera.up.set(0, 1, 0); camera.lookAt(0, 0, 0);
  camera.fov = FOV; camera.updateProjectionMatrix();
  const s = pxPerMm / PX_PER_MM;
  watch.scale.setScalar(s);
  watch.position.set((cxPx - W / 2) / PX_PER_MM, -(cyPx - H / 2) / PX_PER_MM, 0);
}
function orient(yawDeg, pitchDeg, rollDeg = 0) {
  watch.rotation.set(rad(pitchDeg), rad(yawDeg), rad(rollDeg), "YXZ");
}

// Couronne : petits tours à chaque changement d'écran (comme si on la tournait)
function crownAngle(t) {
  let a = t * 0.6;
  for (let i = 1; i < SCREENS.length; i++) a += Math.PI * 0.9 * easeInOut((t - (T.hero + i * T.screen) + 0.25) / 0.5);
  return a;
}

const BAND_COLORS = [new THREE.Color("#232326"), new THREE.Color("#ff6a13"), new THREE.Color("#b4b5b9")];

// ---------------------------------------------------------------------------
// Rendu d'un instant
// ---------------------------------------------------------------------------
window.renderAt = (t) => {
  hideAll();
  charger.visible = false;
  bandMat.color.copy(BAND_COLORS[0]);
  crown.rotation.x = crownAngle(t);
  watch.position.set(0, 0, 0);

  if (t < T.macro2) {
    // Gros plan macro sur la couronne qui tourne
    const p = t / (T.macro2 - T.macro1);
    place(540, 960, 15.3);
    orient(-28 + 10 * p, 12, 0);
    crown.rotation.x = t * 5;
    watch.updateMatrixWorld(true);
    const cp = crown.getWorldPosition(new THREE.Vector3());
    camera.fov = 10;
    camera.position.set(cp.x + lerp(150, 120, p), cp.y + lerp(70, 50, p), cp.z + lerp(170, 160, p));
    camera.lookAt(cp.x - lerp(6, 3, p), cp.y - 4, cp.z); camera.updateProjectionMatrix();
    paintScreen("face", t);
  } else if (t < T.hero) {
    // Profil : la boucle du bracelet et le flanc du boîtier
    const p = (t - T.macro2) / (T.hero - T.macro2);
    place(540, 960, 15.3);
    orient(lerp(68, 58, p), 8, -6);
    camera.fov = 13; camera.position.set(lerp(-30, 0, p), lerp(60, 50, p), 420); camera.lookAt(0, 22, -10);
    camera.updateProjectionMatrix();
    paintScreen("face", t);
  } else if (t < T.bands) {
    const lt = t - T.hero;
    const idx = Math.min(Math.floor(lt / T.screen), SCREENS.length - 1);
    const st = lt - idx * T.screen;
    const reveal = easeInOut(lt / 1.0);
    const tap = idx > 0 ? Math.exp(-st * 6) * Math.sin(st * 14) : 0;
    place(540, 1050, 15.3 * lerp(0.8, 1, reveal));
    orient(lerp(-75, 0, reveal) + 5 * Math.sin(lt * 0.9) + 1.5 * tap,
      lerp(18, 0, reveal) + 3 * Math.sin(lt * 0.7 + 1) - 1.2 * tap, 0);
    const wake = clamp((lt - 0.55) / 0.35);
    const mix = clamp(st / 0.14);
    paintScreen(SCREENS[idx], idx === 0 ? Math.max(0, lt - 0.55) : st,
      { wake, prev: idx > 0 ? SCREENS[idx - 1] : null, prevT: T.screen, mix });
    const head = easeOut((lt - 0.35) / 0.5);
    show("logo", head, -(1 - head) * 30);
    let [o, d] = appear(lt, 0.5); show("t1", o, d);
    [o, d] = appear(lt, 0.62); show("t2", o, d);
    ui.cap.textContent = CAPTIONS[idx];
    [o, d] = appear(st, idx ? 0.08 : 0.9, 0.35);
    if (idx < SCREENS.length - 1) o *= clamp((T.screen - st) / 0.15);
    show("cap", o, d);
  } else if (t < T.charge) {
    // 3 bracelets : la montre fait un tour et change de couleur de bracelet
    const lt = t - T.bands;
    const k = Math.min(Math.floor(lt), 2), st = lt - k;
    place(540, 1000, 13.6);
    let spin = 0;
    if (k > 0) spin = 360 * easeInOut(st / 0.7);
    const colorIdx = k > 0 && st < 0.35 ? k - 1 : k;
    bandMat.color.copy(BAND_COLORS[colorIdx]);
    orient(-32 + spin + 10 * lt, -8 + 4 * Math.sin(lt * 2), 0);
    paintScreen("face", t);
    show("logo", 1);
    ui.cap.textContent = "3 bracelets offerts";
    let [o, d] = appear(lt, 0.05, 0.35); show("cap", o, d);
    show("dots", o, d);
    [...ui.dots.children].forEach((s, i) => { s.style.transform = `scale(${i === colorIdx ? 1.35 : 1})`; s.style.opacity = i === colorIdx ? 1 : 0.45; });
  } else if (t < T.cta) {
    // Recharge : vue de dos, le palet magnétique vient se coller, puis retour face avant
    const lt = t - T.charge;
    place(540, 980, 13.6);
    charger.visible = true;
    const snap = backOut((lt - 0.15) / 0.45, 1.2);
    charger.position.set(0, lerp(-30, 0, easeOut((lt - 0.15) / 0.45)), -CASE_D / 2 - 4.6 - lerp(55, 0, snap));
    const turn = easeInOut((lt - 0.8) / 0.6);
    orient(lerp(155, 20, turn), lerp(-14, 6, turn), 0);
    paintScreen("charging", Math.max(0, lt - 0.8), { wake: clamp((lt - 0.95) / 0.2) });
    show("logo", 1);
    ui.cap.textContent = "Recharge magnétique";
    const [o, d] = appear(lt, 0.1, 0.35); show("cap", o, d);
  } else {
    // Appel à l'action
    const lt = t - T.cta;
    const wp = easeOut(lt / 0.7);
    place(540, lerp(980, 690, wp), lerp(13.6, 7.8, wp));
    orient(lerp(-40, 0, wp) + 9 * Math.sin(lt * 1.1), 4 * Math.sin(lt * 0.9), 0);
    paintScreen("face", lt, { wake: 1 });
    show("logo", 1);
    let [o, d] = appear(lt, 0.15); show("hurry", o, d);
    const pp = backOut((lt - 0.55) / 0.5);
    show("price", clamp(pp * 2), 0, Math.max(0.01, pp));
    [o, d] = appear(lt, 0.8); show("old", o, d);
    ui.old.style.setProperty("--strike", easeOut((lt - 1.0) / 0.3));
    [o, d] = appear(lt, 1.0); show("pill", o, d);
    [o, d] = appear(lt, 1.25); show("site", o, d);
    [o, d] = appear(lt, 1.45); show("wa", o, d);
  }

  // Flash blanc bref aux coupes
  let fl = 0;
  for (const cut of [T.macro2, T.hero, T.bands, T.charge, T.cta]) if (t - cut >= 0 && t - cut < 0.1) fl = 0.35 * (1 - (t - cut) / 0.1);
  // Fondu de sortie
  const fo = clamp((t - (T.end - 0.4)) / 0.4);
  ui.flash.style.background = fo > 0 ? "#ededed" : "#fff";
  ui.flash.style.opacity = Math.max(fl, fo);

  renderer.render(scene, camera);
  return true;
};

await document.fonts.load(F(600, 40));
await document.fonts.load(F(600, 40, "Inter Display"));
await document.fonts.load(F(900, 40, "Inter Display"));
await new Promise((r) => (faceImg.complete ? r() : (faceImg.onload = r)));
window.T = T;
window.ready = true;
