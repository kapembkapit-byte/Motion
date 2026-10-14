// Strict brand palette — do not add colours.
export const COLORS = {
  bg: '#EDEDED',
  blue: '#0746C0',
  ink: '#1A1A1A',
} as const;

export const FONTS = {
  punch: '"Barlow Condensed", sans-serif', // kinetic titles (reference mechanic)
  sans: 'Manrope, sans-serif', // product names, UI, buttons
  serif: '"Instrument Serif", serif', // elegance accents + slogan
} as const;

// Phone mockup geometry (screen keeps the 390 x 844 capture ratio).
export const PHONE = {
  bezel: 14,
  screenW: 452,
  get screenH() {
    return Math.round((this.screenW * 844) / 390);
  },
  get w() {
    return this.screenW + this.bezel * 2;
  },
  get h() {
    return this.screenH + this.bezel * 2;
  },
  radius: 68,
};

export const SHADOW = '0 50px 90px -30px rgba(26,26,26,0.45), 0 18px 36px -18px rgba(26,26,26,0.35)';
