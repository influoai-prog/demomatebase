'use client';

import { toast } from 'sonner';
import type { LucideIcon } from 'lucide-react';
import { Bath, Candy, Coins, CupSoda, Flower2, KeyRound, Mail, Moon, NotebookPen, Sparkles, Sprout, Star } from 'lucide-react';
import { Product } from '@/data/products';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/components/cart/cart-provider';

const iconMap: Record<string, LucideIcon> = {
  'gift-arcade-token': Coins,
  'gift-glass-pin': Sparkles,
  'food-honey-drops': Candy,
  'food-moon-tea': Moon,
  'gift-lumen-postcard': Mail,
  'gift-prism-notebook': NotebookPen,
  'gift-vapor-keychain': KeyRound,
  'food-cocoa-bite': CupSoda,
  'gift-bath-soak': Bath,
  'gift-scent-sachet': Flower2,
  'gift-mini-planter': Sprout,
  'gift-sticker-pack': Star
};

export function ProductCard({ product }: { product: Product }) {
  const { addItem, openCart } = useCart();
  const Icon = iconMap[product.id] ?? Sparkles;

  const handleAdd = () => {
    addItem(product);
    toast.success(`${product.title} added to your cart.`);
  };

  const handleCheckout = () => {
    addItem(product);
    openCart();
    toast.success(`${product.title} queued for checkout.`);
  };

  return (
    <article className="flex flex-col gap-5 rounded-[28px] border border-white/20 bg-white/10 p-5 text-white/80 shadow-[0_24px_50px_-36px_rgba(148,163,184,0.75)] backdrop-blur-2xl transition duration-200 hover:-translate-y-1 hover:border-white/40 hover:bg-white/20">
      <div className="relative overflow-hidden rounded-[24px] border border-white/25 bg-gradient-to-br from-white/20 via-white/15 to-white/10 p-8 shadow-[0_18px_46px_-32px_rgba(56,189,248,0.75)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.4),rgba(255,255,255,0))]" />
        <Icon className="relative mx-auto h-14 w-14 text-white drop-shadow-[0_6px_32px_rgba(255,255,255,0.55)]" strokeWidth={1.4} />
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.32em] text-white/60">
          <span>{product.category}</span>
          {!product.inStock && <span className="rounded-full border border-white/40 px-3 py-1 text-[10px]">Sold out</span>}
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
      <div className="grid gap-2.5 sm:grid-cols-2">
        <Button
          size="lg"
          className="w-full rounded-full border border-white/20 bg-white/20 text-[0.8rem] font-semibold uppercase tracking-[0.28em] text-white shadow-[0_18px_40px_-28px_rgba(244,244,245,0.6)] hover:bg-white/30"
          onClick={handleAdd}
          disabled={!product.inStock}
        >
          Add to Cart
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="w-full rounded-full border border-sky-400/30 bg-sky-500/10 text-[0.8rem] font-semibold uppercase tracking-[0.28em] text-white hover:border-sky-400/50 hover:bg-sky-500/20"
          onClick={handleCheckout}
          disabled={!product.inStock}
        >
          Checkout
        </Button>
      </div>
    </article>
  );
}
