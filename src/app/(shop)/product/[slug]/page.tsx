import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts } from '@/lib/product-service';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/product/product-card';
import { AddToCartButton } from './sections/add-to-cart';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) return notFound();
  const related = await getRelatedProducts(product);

  return (
    <div className="space-y-12">
      <section className="grid gap-10 lg:grid-cols-[1.2fr,1fr]">
        <div className="glass-card flex flex-col gap-6 p-10">
          <div className="flex items-center gap-2">
            <Badge>{product.category}</Badge>
            {product.tags.map((tag) => (
              <Badge key={tag} className="text-white/70">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-semibold text-white">{product.title}</h1>
            <p className="text-white/60">{product.description}</p>
            <p className="text-2xl font-semibold text-white">{formatCurrency(product.priceCents)}</p>
          </div>
          <div className="rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-10">
            <div className="flex items-center justify-center" dangerouslySetInnerHTML={{ __html: product.imageSvg }} />
          </div>
          <AddToCartButton product={product} />
          <div className="flex gap-3 text-sm text-white/60">
            <span>In stock: {product.inStock ? 'Yes' : 'No'}</span>
            <span>Added {new Date(product.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <aside className="glass-card flex flex-col gap-4 p-8">
          <h2 className="text-lg font-semibold text-white">Need help?</h2>
          <p className="text-sm text-white/70">
            Connect your Base account, create a sub account, and authorize auto-spend to checkout in under a minute.
          </p>
          <Button asChild className="rounded-full">
            <Link href="/checkout">Proceed to checkout</Link>
          </Button>
        </aside>
      </section>

      {related.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Related items</h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
