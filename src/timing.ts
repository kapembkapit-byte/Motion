// 1080 x 1920, 30 fps, exactly 30 s = 900 frames.
export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const TOTAL = 900;

// Instagram safe zone: nothing important in the top 250 px / bottom 380 px.
export const SAFE_TOP = 250;
export const SAFE_BOTTOM = H - 380; // y = 1540

export const s = (seconds: number) => Math.round(seconds * FPS);

// Act boundaries (frames), mirroring the reference rhythm compressed to 30 s:
// hook → brand reveal → statement → app journey → products → offer → end card.
export const HOOK = {from: 0, to: 60}; // 0 – 2 s
export const BRAND = {from: 60, to: 140}; // 2 – 4.7 s
export const STATEMENT = {from: 140, to: 210}; // 4.7 – 7 s
export const JOURNEY = {from: 210, to: 300}; // 7 – 10 s
export const CATS = {from: 300, to: 720}; // 10 – 24 s
export const OFFER = {from: 720, to: 790}; // 24 – 26.3 s
export const END = {from: 790, to: TOTAL}; // 26.3 – 30 s
export const TAPES = {from: 66, to: 212}; // ticker tapes span brand + statement

export const len = (r: {from: number; to: number}) => r.to - r.from;
