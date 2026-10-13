// 1080 x 1920, 30 fps, exactly 30 s = 900 frames.
export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const TOTAL = 900;

// Instagram safe zone: nothing important in the top 250 px / bottom 380 px.
export const SAFE_TOP = 250;
export const SAFE_BOTTOM = H - 380; // y = 1540

export const s = (seconds: number) => Math.round(seconds * FPS);

// Act boundaries (frames). Change here only; scenes read these values.
export const HOOK = {from: 0, to: s(3)}; // 0 – 3 s
export const STORE = {from: s(3), to: s(10)}; // 3 – 10 s
export const STORE_MENU_AT = s(6.5); // home scroll -> category menu
export const CATS = {from: s(10), to: s(24)}; // 10 – 24 s
export const CTA = {from: s(24), to: TOTAL}; // 24 – 30 s
export const ENDCARD_AT = s(26.4); // cart -> logo / slogan end card

export const len = (r: {from: number; to: number}) => r.to - r.from;
