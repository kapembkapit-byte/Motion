import raw from '../assets/video-content.json';

// Everything shown on screen comes from assets/video-content.json,
// built from the real kuwej.com export in /assets (or by scripts/capture-kuwej.mjs).
export type Shot = {src: string; width: number; height: number};
export type Rect = {x: number; y: number; w: number; h: number}; // in screenshot pixels

export type Product = {
  name: string; // exactly as displayed on the product page
  price: string; // exactly as displayed (e.g. "44.00$", "13.00$ / mois")
  oldPrice?: string | null; // struck-through regular price, as displayed
  screenshot: Shot | null;
  photo?: Rect; // product photo area inside the screenshot (lift-out card)
};

export type Category = {name: string; screenshot: Shot | null; products: Product[]};

export type Content = {
  source: string;
  capturedAt: string | null;
  logo: Shot | null;
  whatsapp: string | null;
  offer?: string | null;
  screens: {
    splash?: Shot | null;
    home: Shot | null;
    homeFull?: Shot | null;
    homeCategories?: Rect | null;
    menu: Shot | null;
    cart: Shot | null;
    cartOffer?: Rect | null;
    checkout?: Shot | null;
  };
  categories: Category[];
  audio: {voiceover: string | null; music: string | null; musicVolume: number};
};

export const content = raw as unknown as Content;

// Default photo area for a 390 x 844 product page capture.
export const photoRect = (p: Product): Rect =>
  p.photo ?? (p.screenshot ? {x: p.screenshot.width * 0.026, y: p.screenshot.height * 0.19, w: p.screenshot.width * 0.95, h: p.screenshot.width * 0.95} : {x: 0, y: 0, w: 1, h: 1});
