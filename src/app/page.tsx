import Link from 'next/link';
import { listProducts } from '@/lib/product-service';
import { ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const featured = (await listProducts({ sort: 'popularity' })).slice(0, 6);

  return (
    <div className="space-y-16">
      <section className="glass-card relative overflow-hidden px-8 py-16 md:px-16">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5" aria-hidden />
        <div className="relative z-10 flex flex-col gap-8">
          <p className="text-xs uppercase tracking-[0.4em] text-white/70">On-Chain Curated</p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Glass Gift Shop
          </h1>
          <p className="max-w-2xl text-lg text-white/70">
            Ultra-minimal gifts with luminous line art, curated for clothing, food, and intimate moments.
            Checkout flows through Base with automated sub accounts and spend permissions.
          </p>
          <div className="flex flex-wrap gap-3">
            {['Clothing', 'Food', 'Gifts', 'Erotic'].map((category) => (
              <Link
                key={category}
                href={category === 'Erotic' ? '/legal/erotic-gate' : `/shop?category=${category}`}
                className="glass-button"
              >
                {category}
              </Link>
            ))}
          </div>
          <div className="flex gap-3">
            <Button asChild className="rounded-full px-8">
              <Link href="/shop">Browse All</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-8">
              <Link href="/checkout">Checkout Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Featured this week</h2>
          <Link href="/shop" className="text-sm text-white/70 hover:text-white">
            Explore catalog →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
