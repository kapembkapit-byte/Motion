// 1080 x 1920, 30 fps, exactly 30 s = 900 frames.
export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const TOTAL = 900;

// Instagram safe zone: nothing important in the top 250 px / bottom 380 px.
export const SAFE_TOP = 250;
export const SAFE_BOTTOM = H - 380; // y = 1540

export const s = (seconds: number) => Math.round(seconds * FPS);

// Act boundaries (frames), locked to the placed voice-over (scripts/voiceover-placement.json):
// hook → brand reveal → statement → app journey → products → offer → end card.
export const HOOK = {from: 0, to: 48}; // 0 – 1.6 s
export const BRAND = {from: 48, to: 135}; // 1.6 – 4.5 s
export const STATEMENT = {from: 135, to: 204}; // 4.5 – 6.8 s
export const JOURNEY = {from: 204, to: 291}; // 6.8 – 9.7 s
export const CATS = {from: 291, to: 654}; // 9.7 – 21.8 s
export const OFFER = {from: 654, to: 738}; // 21.8 – 24.6 s
export const END = {from: 738, to: TOTAL}; // 24.6 – 30 s
export const TAPES = {from: 54, to: 206}; // ticker tapes span brand + statement

// Category beats: 1.6 s each, the last one (kuwej Brand + « …la marque Kuwej ») 2.5 s.
export const LAST_CAT_BEAT = 75;
export const catBounds = (n: number): number[] => {
  const total = CATS.to - CATS.from;
  if (n <= 1) return [0, total];
  const other = (total - LAST_CAT_BEAT) / (n - 1);
  return Array.from({length: n}, (_, i) => Math.round(i * other)).concat(total);
};

export const len = (r: {from: number; to: number}) => r.to - r.from;
