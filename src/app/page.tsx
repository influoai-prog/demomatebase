import { listProducts } from '@/lib/product-service';
import { ProductCard } from '@/components/product/product-card';
import { GithubRepoCard } from '@/components/github/github-repo-card';
import { SubAccountCallout } from '@/components/wallet/sub-account-callout';

export default async function HomePage() {
  const products = (await listProducts({ sort: 'popularity' })).slice(0, 12);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12">
      <section className="overflow-hidden rounded-[40px] border border-white/15 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.2),rgba(15,23,42,0.85))] p-10 shadow-[0_60px_120px_-70px_rgba(56,189,248,0.8)] backdrop-blur-3xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">Base Powered</p>
              <h1 className="text-5xl font-semibold tracking-tight text-white">Glass Gift Shelf</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-white/70">
                Twelve luminous curios priced between one and five dollars. Each icon is rendered with a frosted white, pixel-like
                finish, and every checkout routes through a Base Sub Account with auto spend permissions so your wallet feels as
                weightless as the shelf.
              </p>
            </div>
            <div className="max-w-md">
              <GithubRepoCard title="Base Account SDK Quickstart" githubUrl="https://github.com/base/account-sdk" />
            </div>
          </div>
          <SubAccountCallout />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Micro-gifts</h2>
          <p className="text-sm text-white/60">Tap an icon to add it to your cart or jump straight into checkout.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
