export type Category = 'clothing' | 'food' | 'gifts' | 'erotic';

export type Product = {
  id: string;
  slug: string;
  title: string;
  category: Category;
  priceCents: number;
  description: string;
  imageSvg: string;
  tags: string[];
  inStock: boolean;
  createdAt: string;
  popularity: number;
};

const svg = (label: string) => `
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="12" y="12" width="136" height="136" rx="32" opacity="0.18" />
  <path d="M48 88c12-10 24-10 36 0 12 10 24 10 36 0" opacity="0.6" />
  <path d="M60 62c8-8 16-8 24 0 8 8 16 8 24 0" opacity="0.9" />
  <text x="50%" y="138" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="white" opacity="0.8" font-family="'Inter', sans-serif">${label}</text>
</svg>`;

export const products: Product[] = [
  {
    id: 'clo-1',
    slug: 'luminous-silk-robe',
    title: 'Luminous Silk Robe',
    category: 'clothing',
    priceCents: 18900,
    description:
      'A flowing silk robe with translucent sheen and minimal lines for effortless evenings.',
    imageSvg: svg('Silk Robe'),
    tags: ['limited', 'evening'],
    inStock: true,
    createdAt: '2024-04-01T10:00:00Z',
    popularity: 86
  },
  {
    id: 'clo-2',
    slug: 'halo-knit-top',
    title: 'Halo Knit Top',
    category: 'clothing',
    priceCents: 9800,
    description: 'Fine merino knit with luminous threading and sculpted neckline.',
    imageSvg: svg('Knit Top'),
    tags: ['daywear'],
    inStock: true,
    createdAt: '2024-02-14T10:00:00Z',
    popularity: 72
  },
  {
    id: 'clo-3',
    slug: 'glasswave-parka',
    title: 'Glasswave Parka',
    category: 'clothing',
    priceCents: 22800,
    description: 'Ultralight parka with frost-finish panels and magnet closures.',
    imageSvg: svg('Parka'),
    tags: ['outerwear'],
    inStock: false,
    createdAt: '2024-01-10T10:00:00Z',
    popularity: 65
  },
  {
    id: 'clo-4',
    slug: 'chroma-plisse-dress',
    title: 'Chroma Plissé Dress',
    category: 'clothing',
    priceCents: 21500,
    description: 'Pleated midi dress with reflective threads and open back detail.',
    imageSvg: svg('Plissé'),
    tags: ['evening', 'limited'],
    inStock: true,
    createdAt: '2024-05-10T10:00:00Z',
    popularity: 92
  },
  {
    id: 'clo-5',
    slug: 'polar-lounge-set',
    title: 'Polar Lounge Set',
    category: 'clothing',
    priceCents: 12500,
    description: 'Fleece-lined lounge set with tonal piping and weightless comfort.',
    imageSvg: svg('Lounge'),
    tags: ['comfort'],
    inStock: true,
    createdAt: '2024-03-22T10:00:00Z',
    popularity: 77
  },
  {
    id: 'clo-6',
    slug: 'strata-sculpt-leggings',
    title: 'Strata Sculpt Leggings',
    category: 'clothing',
    priceCents: 8800,
    description: 'Compression leggings with contour seams and matte-glass finish.',
    imageSvg: svg('Leggings'),
    tags: ['active'],
    inStock: true,
    createdAt: '2024-05-30T10:00:00Z',
    popularity: 83
  },
  {
    id: 'food-1',
    slug: 'celestial-citrus-truffles',
    title: 'Celestial Citrus Truffles',
    category: 'food',
    priceCents: 4200,
    description: 'Yuzu ganache truffles dusted with sparkling sugar and edible florals.',
    imageSvg: svg('Truffles'),
    tags: ['sweet', 'limited'],
    inStock: true,
    createdAt: '2024-04-05T10:00:00Z',
    popularity: 90
  },
  {
    id: 'food-2',
    slug: 'lumen-honeycomb',
    title: 'Lumen Honeycomb',
    category: 'food',
    priceCents: 3800,
    description: 'Hand-pulled honeycomb candy with pearlescent glaze and sea salt.',
    imageSvg: svg('Honeycomb'),
    tags: ['sweet'],
    inStock: true,
    createdAt: '2024-02-10T10:00:00Z',
    popularity: 74
  },
  {
    id: 'food-3',
    slug: 'aurora-tea-flight',
    title: 'Aurora Tea Flight',
    category: 'food',
    priceCents: 5600,
    description: 'Three shimmering tea blends: crystal jasmine, midnight plum, frost mint.',
    imageSvg: svg('Tea Flight'),
    tags: ['tea', 'wellness'],
    inStock: true,
    createdAt: '2024-05-01T10:00:00Z',
    popularity: 81
  },
  {
    id: 'food-4',
    slug: 'glacier-sea-salt',
    title: 'Glacier Sea Salt',
    category: 'food',
    priceCents: 2400,
    description: 'Mineral-rich finishing salt harvested from Arctic waters.',
    imageSvg: svg('Sea Salt'),
    tags: ['pantry'],
    inStock: true,
    createdAt: '2024-03-05T10:00:00Z',
    popularity: 60
  },
  {
    id: 'food-5',
    slug: 'prism-cold-brew',
    title: 'Prism Cold Brew',
    category: 'food',
    priceCents: 3200,
    description: 'Nitro cold brew with vanilla vapor and notes of smoked cacao.',
    imageSvg: svg('Cold Brew'),
    tags: ['coffee'],
    inStock: false,
    createdAt: '2024-01-28T10:00:00Z',
    popularity: 58
  },
  {
    id: 'food-6',
    slug: 'frosted-fig-preserve',
    title: 'Frosted Fig Preserve',
    category: 'food',
    priceCents: 2800,
    description: 'Fig jam infused with vanilla orchid and crystallized ginger.',
    imageSvg: svg('Fig Preserve'),
    tags: ['pantry'],
    inStock: true,
    createdAt: '2024-06-01T10:00:00Z',
    popularity: 66
  },
  {
    id: 'gift-1',
    slug: 'nebula-incense-set',
    title: 'Nebula Incense Set',
    category: 'gifts',
    priceCents: 5200,
    description: 'Four sculpted incense holders with interstellar fragrance sticks.',
    imageSvg: svg('Incense'),
    tags: ['aroma', 'limited'],
    inStock: true,
    createdAt: '2024-03-18T10:00:00Z',
    popularity: 84
  },
  {
    id: 'gift-2',
    slug: 'glass-orbit-planter',
    title: 'Glass Orbit Planter',
    category: 'gifts',
    priceCents: 6400,
    description: 'Suspended glass planter with microclimate misting reservoir.',
    imageSvg: svg('Planter'),
    tags: ['home'],
    inStock: true,
    createdAt: '2024-02-20T10:00:00Z',
    popularity: 71
  },
  {
    id: 'gift-3',
    slug: 'halo-candela',
    title: 'Halo Candela',
    category: 'gifts',
    priceCents: 3600,
    description: 'Frost-glass candle with notes of white cedar and smoked amber.',
    imageSvg: svg('Candela'),
    tags: ['aroma'],
    inStock: true,
    createdAt: '2024-04-22T10:00:00Z',
    popularity: 79
  },
  {
    id: 'gift-4',
    slug: 'echo-journal-set',
    title: 'Echo Journal Set',
    category: 'gifts',
    priceCents: 4800,
    description: 'Glass-stitched journal with iridescent pen trio.',
    imageSvg: svg('Journal'),
    tags: ['stationery'],
    inStock: true,
    createdAt: '2024-05-12T10:00:00Z',
    popularity: 68
  },
  {
    id: 'gift-5',
    slug: 'lattice-throw',
    title: 'Lattice Throw',
    category: 'gifts',
    priceCents: 7800,
    description: 'Handwoven alpaca throw with geometric gradient weave.',
    imageSvg: svg('Throw'),
    tags: ['home'],
    inStock: true,
    createdAt: '2024-02-04T10:00:00Z',
    popularity: 75
  },
  {
    id: 'gift-6',
    slug: 'strata-soundscape',
    title: 'Strata Soundscape Speaker',
    category: 'gifts',
    priceCents: 14800,
    description: 'Glass acoustic speaker with ambient light halo and Bluetooth sync.',
    imageSvg: svg('Soundscape'),
    tags: ['tech'],
    inStock: true,
    createdAt: '2024-06-08T10:00:00Z',
    popularity: 94
  },
  {
    id: 'ero-1',
    slug: 'velvet-midnight-kit',
    title: 'Velvet Midnight Kit',
    category: 'erotic',
    priceCents: 12200,
    description: 'Soft restraints, satin blindfold, and aromatic oil for intimate rituals.',
    imageSvg: svg('Midnight Kit'),
    tags: ['sensory'],
    inStock: true,
    createdAt: '2024-04-30T10:00:00Z',
    popularity: 88
  },
  {
    id: 'ero-2',
    slug: 'pulseglass-massager',
    title: 'Pulseglass Massager',
    category: 'erotic',
    priceCents: 15800,
    description: 'Hand-blown glass massager with dual-temperature core and ergonomic curve.',
    imageSvg: svg('Massager'),
    tags: ['wellness'],
    inStock: true,
    createdAt: '2024-05-20T10:00:00Z',
    popularity: 91
  },
  {
    id: 'ero-3',
    slug: 'moonlit-fragrance-duo',
    title: 'Moonlit Fragrance Duo',
    category: 'erotic',
    priceCents: 8800,
    description: 'Complementary pheromone mists with iris and smoked tonka accords.',
    imageSvg: svg('Fragrance Duo'),
    tags: ['sensory'],
    inStock: true,
    createdAt: '2024-02-22T10:00:00Z',
    popularity: 67
  },
  {
    id: 'ero-4',
    slug: 'silk-heat-body-oil',
    title: 'Silk Heat Body Oil',
    category: 'erotic',
    priceCents: 4600,
    description: 'Heating body oil infused with orchid, cardamom, and amber resin.',
    imageSvg: svg('Body Oil'),
    tags: ['aroma'],
    inStock: true,
    createdAt: '2024-03-18T10:00:00Z',
    popularity: 70
  },
  {
    id: 'ero-5',
    slug: 'glass-serenade-vibe',
    title: 'Glass Serenade Vibe',
    category: 'erotic',
    priceCents: 18600,
    description: 'Rechargeable vibrator with crystalline casing and quiet pulse modes.',
    imageSvg: svg('Serenade'),
    tags: ['tech'],
    inStock: true,
    createdAt: '2024-06-12T10:00:00Z',
    popularity: 95
  },
  {
    id: 'ero-6',
    slug: 'nocturne-lingerie-set',
    title: 'Nocturne Lingerie Set',
    category: 'erotic',
    priceCents: 13400,
    description: 'Shadow lace lingerie set with iridescent trims and modular straps.',
    imageSvg: svg('Lingerie'),
    tags: ['lingerie'],
    inStock: true,
    createdAt: '2024-05-05T10:00:00Z',
    popularity: 89
  }
];
