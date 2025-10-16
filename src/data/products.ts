export type Category = 'clothing' | 'food' | 'gifts' | 'erotic';

export type Product = {
  id: string;
  slug: string;
  title: string;
  symbol: string;
  category: Category;
  priceCents: number;
  description: string;
  tags: string[];
  inStock: boolean;
  createdAt: string;
  popularity: number;
};

export const products: Product[] = [
  {
    id: 'gift-arcade-token',
    slug: 'arcade-token-charm',
    title: 'Arcade Token Charm',
    symbol: '🪙',
    category: 'gifts',
    priceCents: 100,
    description: 'Tiny metal coin engraved with the Base logo for good-luck taps.',
    tags: ['collectible', 'lucky'],
    inStock: true,
    createdAt: '2024-06-01T10:00:00Z',
    popularity: 92
  },
  {
    id: 'gift-glass-pin',
    slug: 'glow-glass-pin',
    title: 'Glow Glass Pin',
    symbol: '✨',
    category: 'gifts',
    priceCents: 300,
    description: 'Enamel lapel pin with frosted glass fill and silver trim.',
    tags: ['limited', 'shimmer'],
    inStock: true,
    createdAt: '2024-05-18T10:00:00Z',
    popularity: 88
  },
  {
    id: 'food-honey-drops',
    slug: 'honey-drops',
    title: 'Honey Drops',
    symbol: '🍯',
    category: 'food',
    priceCents: 400,
    description: 'Sweet citrus lozenges infused with yuzu and vanilla crystals.',
    tags: ['sweet'],
    inStock: true,
    createdAt: '2024-04-22T10:00:00Z',
    popularity: 79
  },
  {
    id: 'food-moon-tea',
    slug: 'moon-tea-sachet',
    title: 'Moon Tea Sachet',
    symbol: '🌙',
    category: 'food',
    priceCents: 200,
    description: 'Single-serve jasmine and mint sachet for late-night clarity.',
    tags: ['tea', 'calming'],
    inStock: true,
    createdAt: '2024-05-04T10:00:00Z',
    popularity: 84
  },
  {
    id: 'gift-lumen-postcard',
    slug: 'lumen-postcard',
    title: 'Lumen Postcard',
    symbol: '🪩',
    category: 'gifts',
    priceCents: 200,
    description: 'Foil stamped postcard with refractive holographic grid.',
    tags: ['stationery'],
    inStock: true,
    createdAt: '2024-03-29T10:00:00Z',
    popularity: 71
  },
  {
    id: 'gift-prism-notebook',
    slug: 'prism-notebook',
    title: 'Prism Notebook',
    symbol: '📓',
    category: 'gifts',
    priceCents: 500,
    description: 'Pocket notebook with translucent cover and dotted pages.',
    tags: ['stationery', 'daily'],
    inStock: true,
    createdAt: '2024-02-14T10:00:00Z',
    popularity: 95
  },
  {
    id: 'gift-vapor-keychain',
    slug: 'vapor-keychain',
    title: 'Vapor Keychain',
    symbol: '🔑',
    category: 'gifts',
    priceCents: 300,
    description: 'Frosted acrylic key loop with etched Base coordinates.',
    tags: ['utility'],
    inStock: true,
    createdAt: '2024-04-08T10:00:00Z',
    popularity: 76
  },
  {
    id: 'food-cocoa-bite',
    slug: 'cocoa-bite',
    title: 'Cocoa Bite',
    symbol: '🍫',
    category: 'food',
    priceCents: 500,
    description: 'Single-origin dark chocolate square with smoked sea salt.',
    tags: ['sweet', 'treat'],
    inStock: true,
    createdAt: '2024-05-28T10:00:00Z',
    popularity: 90
  },
  {
    id: 'gift-bath-soak',
    slug: 'frost-bath-soak',
    title: 'Frost Bath Soak',
    symbol: '🛁',
    category: 'gifts',
    priceCents: 400,
    description: 'Mini sachet of eucalyptus and glacier salt for one bath.',
    tags: ['wellness'],
    inStock: true,
    createdAt: '2024-06-05T10:00:00Z',
    popularity: 82
  },
  {
    id: 'gift-scent-sachet',
    slug: 'scented-sachet',
    title: 'Scented Sachet',
    symbol: '🌸',
    category: 'gifts',
    priceCents: 300,
    description: 'Linen sachet with violet mist fragrance for drawers or bags.',
    tags: ['aroma'],
    inStock: true,
    createdAt: '2024-03-10T10:00:00Z',
    popularity: 68
  },
  {
    id: 'gift-mini-planter',
    slug: 'mini-planter',
    title: 'Mini Planter',
    symbol: '🪴',
    category: 'gifts',
    priceCents: 500,
    description: 'Palm-sized ceramic planter with matte glass glaze.',
    tags: ['home'],
    inStock: true,
    createdAt: '2024-02-02T10:00:00Z',
    popularity: 87
  },
  {
    id: 'gift-sticker-pack',
    slug: 'luminous-sticker-pack',
    title: 'Luminous Sticker Pack',
    symbol: '🌟',
    category: 'gifts',
    priceCents: 200,
    description: 'Set of three die-cut vinyl stickers featuring neon wireframes.',
    tags: ['limited', 'sticker'],
    inStock: true,
    createdAt: '2024-01-20T10:00:00Z',
    popularity: 73
  }
];
