'use client';

import { useState } from 'react';
import { Product } from '@/data/products';
import { useCart } from '@/lib/cart-store';
import { QuantityPicker } from '@/components/product/quantity-picker';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCart((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    addItem(product, quantity);
    toast.success(`${product.title} added to cart`);
  };

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/20 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/70">Quantity</span>
        <QuantityPicker value={quantity} onChange={setQuantity} />
      </div>
      <Button disabled={!product.inStock} onClick={handleAdd} className="rounded-full">
        {product.inStock ? 'Add to cart' : 'Sold out'}
      </Button>
    </div>
  );
}
