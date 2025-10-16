import { listProducts } from '@/lib/product-service';
import { ProductCard } from '@/components/product/product-card';
import { GithubRepoCard } from '@/components/github/github-repo-card';
import { SubAccountCallout } from '@/components/wallet/sub-account-callout';

export default async function HomePage() {
  const products = (await listProducts({ sort: 'popularity' })).slice(0, 12);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10">
      <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),rgba(15,23,42,0.9))] p-8 shadow-[0_40px_100px_-60px_rgba(56,189,248,0.8)] backdrop-blur-3xl">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.45em] text-white/60">Powered by Base</p>
              <h1 className="text-4xl font-semibold tracking-tight text-white md:text-[44px]">Mate Shop</h1>
              <p className="max-w-xl text-sm leading-relaxed text-white/70">
                A curated, single-page set of twelve micro curios. Every item carries a glassy white glyph, costs five dollars or
                less, and flows through Base Sub Accounts with optional auto spend so you can skip repetitive approvals.
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
          <h2 className="text-lg font-semibold text-white">Catalog</h2>
          <p className="text-xs text-white/60">Add a few gifts, settle the $0.10 Base invoice, then finish checkout.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
