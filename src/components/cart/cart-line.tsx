'use client';

import { X } from 'lucide-react';
import { useCart } from '@/lib/cart-store';
import { getProductById } from '@/lib/product-service';
import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { QuantityPicker } from '@/components/product/quantity-picker';

export function CartLine({ productId, quantity }: { productId: string; quantity: number }) {
  const updateQuantity = useCart((state) => state.updateQuantity);
  const removeItem = useCart((state) => state.removeItem);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState(0);
  const [svg, setSvg] = useState('');

  useEffect(() => {
    getProductById(productId).then((product) => {
      if (!product) return;
      setTitle(product.title);
      setPrice(product.priceCents);
      setSvg(product.imageSvg);
    });
  }, [productId]);

  return (
    <div className="flex gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
        {svg && <div className="opacity-90" dangerouslySetInnerHTML={{ __html: svg }} />}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-base font-semibold text-white">{title}</h4>
            <p className="mt-1 text-sm text-white/60">{formatCurrency(price)}</p>
          </div>
          <button onClick={() => removeItem(productId)} className="rounded-full border border-white/20 p-2 text-white/70 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <QuantityPicker value={quantity} onChange={(value) => updateQuantity(productId, value)} />
          <p className="text-sm text-white/70">Line total {formatCurrency(price * quantity)}</p>
        </div>
      </div>
    </div>
  );
}
