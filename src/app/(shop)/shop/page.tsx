import { listProducts } from '@/lib/product-service';
import { ProductCard } from '@/components/product/product-card';
import { FilterClient } from '@/components/product/filter-client';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';

export default async function ShopPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const categories = Array.isArray(searchParams.category)
    ? (searchParams.category as string[])
    : searchParams.category
      ? [searchParams.category as string]
      : [];
  const search = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const inStock = searchParams.stock === 'in';
  const min = Number(searchParams.min ?? 0);
  const max = Number(searchParams.max ?? 500);
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'popularity';

  const products = await listProducts({
    categories: categories as any,
    search,
    inStock,
    priceRange: [min, max],
    sort: sort as any
  });

  const initialFilters = {
    categories,
    search: search ?? '',
    inStock,
    min,
    max,
    sort
  } as const;

  return (
    <div className="grid gap-10 lg:grid-cols-[280px,1fr]">
      <aside className="hidden lg:block">
        <FilterClient initial={initialFilters} />
      </aside>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">All Products</h1>
            <p className="text-sm text-white/60">Choose from luminous clothing, food, gifts, and erotic delights.</p>
          </div>
          <div className="lg:hidden">
            <MobileFilters initial={initialFilters} />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileFilters({ initial }: { initial: Parameters<typeof FilterClient>[0]['initial'] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="rounded-full">
          <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
        </Button>
      </SheetTrigger>
      <SheetContent>
        <FilterClient initial={initial} />
      </SheetContent>
    </Sheet>
  );
}
