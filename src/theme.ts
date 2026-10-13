// Strict brand palette — do not add colours.
export const COLORS = {
  bg: '#EDEDED',
  blue: '#0746C0',
  ink: '#1A1A1A',
} as const;

export const FONTS = {
  sans: 'Manrope, sans-serif',
  serif: '"Instrument Serif", serif',
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

// Default phone centre: below the headline block, inside the safe zone.
export const PHONE_Y = 1005;
