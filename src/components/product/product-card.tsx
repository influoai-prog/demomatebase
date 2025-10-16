'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/lib/cart-store';
import { toast } from 'sonner';

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCart((state) => state.addItem);

  const handleAdd = () => {
    addItem(product, 1);
    toast.success(`${product.title} added to cart`);
  };

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/5 p-6 text-white/80 backdrop-blur-2xl transition hover:-translate-y-1 hover:border-white/40 hover:bg-white/10">
      <div className="flex flex-col gap-5">
        <div className="relative flex aspect-square items-center justify-center rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5">
          <div
            className="pointer-events-none select-none opacity-90 transition group-hover:scale-105"
            dangerouslySetInnerHTML={{ __html: product.imageSvg }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {product.tags.slice(0, 2).map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
          <Link href={`/product/${product.slug}`} className="text-lg font-semibold text-white">
            {product.title}
          </Link>
          <p className="text-sm text-white/60">{product.description}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-white">{formatCurrency(product.priceCents)}</span>
          <div className="flex items-center gap-2">
            {!product.inStock && <Badge className="border-white/40 text-white/60">Sold Out</Badge>}
            <Button onClick={handleAdd} disabled={!product.inStock} size="sm" className="rounded-full">
              <ShoppingCart className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
