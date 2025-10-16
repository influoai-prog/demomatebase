import { Product } from '@/data/products';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="flex flex-col gap-5 rounded-3xl border border-white/15 bg-white/5 p-6 text-white/80 backdrop-blur-2xl transition hover:-translate-y-1 hover:border-white/40 hover:bg-white/10">
      <div className="flex aspect-square items-center justify-center rounded-3xl border border-white/20 bg-white/10 text-6xl">
        <span aria-hidden>{product.symbol}</span>
        <span className="sr-only">{product.title}</span>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
          <span>{product.category}</span>
          {!product.inStock && <span className="rounded-full border border-white/30 px-3 py-1 text-[10px]">Sold out</span>}
        </div>
        <h3 className="text-lg font-semibold text-white">{product.title}</h3>
        <p className="text-sm text-white/60">{product.description}</p>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-white">{formatCurrency(product.priceCents)}</span>
        <div className="flex flex-wrap gap-2">
          {product.tags.slice(0, 2).map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      </div>
    </article>
  );
}
