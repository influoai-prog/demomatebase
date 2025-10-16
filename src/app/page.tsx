import { listProducts } from '@/lib/product-service';
import { ProductCard } from '@/components/product/product-card';

export default async function HomePage() {
  const products = (await listProducts({ sort: 'popularity' })).slice(0, 12);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10">
      <div className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">Base Powered</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white">Glass Gift Shelf</h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-white/60">
          A curated shelf of luminous micro-gifts priced between one and five dollars. Connect with Base and pick a
          symbol that speaks to you.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
