import { listProducts } from '@/lib/product-service';
import { ProductCard } from '@/components/product/product-card';

export default async function HomePage() {
  const featured = (await listProducts({ sort: 'popularity' })).slice(0, 6);

  return (
    <div className="space-y-16">
      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">On-Chain Curated</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">Mate Shop</h1>
          <p className="max-w-2xl text-base text-white/70">
            Discover Base-powered gifting experiences built on sub-accounts, live balances, and automated spend
            permissions.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Featured this week</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
