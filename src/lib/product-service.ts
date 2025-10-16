import { products, type Category, type Product } from '@/data/products';

export type ProductFilters = {
  categories?: Category[];
  search?: string;
  inStock?: boolean;
  priceRange?: [number, number];
  sort?: 'popularity' | 'new' | 'price-asc' | 'price-desc';
};

export async function listProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const normalizedSearch = filters.search?.trim().toLowerCase();
  let filtered = [...products];

  if (filters.categories && filters.categories.length > 0) {
    filtered = filtered.filter((product) => filters.categories?.includes(product.category));
  }

  if (normalizedSearch) {
    filtered = filtered.filter((product) =>
      product.title.toLowerCase().includes(normalizedSearch) ||
      product.description.toLowerCase().includes(normalizedSearch) ||
      product.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch ?? '')),
    );
  }

  if (filters.inStock) {
    filtered = filtered.filter((product) => product.inStock);
  }

  if (filters.priceRange) {
    const [min, max] = filters.priceRange;
    filtered = filtered.filter((product) => {
      const price = product.priceCents / 100;
      return price >= min && price <= max;
    });
  }

  switch (filters.sort) {
    case 'popularity':
      filtered.sort((a, b) => b.popularity - a.popularity);
      break;
    case 'new':
      filtered.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
    case 'price-asc':
      filtered.sort((a, b) => a.priceCents - b.priceCents);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.priceCents - a.priceCents);
      break;
    default:
      filtered.sort((a, b) => b.popularity - a.popularity);
  }

  return filtered;
}

export async function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getRelatedProducts(product: Product, limit = 4) {
  return products
    .filter((item) => item.category === product.category && item.slug !== product.slug)
    .slice(0, limit);
}

export async function getProductById(id: string) {
  return products.find((product) => product.id === id) ?? null;
}
