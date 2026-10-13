import raw from '../assets/video-content.json';

// Everything shown on screen comes from this file, which
// scripts/capture-kuwej.mjs fills from the live kuwej.com site.
export type Shot = {src: string; width: number; height: number};

export type Product = {
  name: string;
  price: string; // exactly as displayed on kuwej.com (amount + currency)
  url?: string;
  screenshot: Shot | null; // product page, mobile viewport
};

export type Category = {
  name: string; // exactly as on kuwej.com
  url?: string;
  screenshot: Shot | null;
  products: Product[]; // 1–2 per category
};

export type Content = {
  source: string;
  capturedAt: string | null;
  logo: Shot | null;
  whatsapp: string | null; // exactly as displayed on kuwej.com
  screens: {
    home: Shot | null;
    homeFull: Shot | null;
    menu: Shot | null;
    cart: Shot | null;
  };
  categories: Category[];
  audio: {voiceover: string | null; music: string | null; musicVolume: number};
};

export const content = raw as Content;
