'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/data/products';

export type CartLine = {
  productId: string;
  quantity: number;
};

export type CartState = {
  lines: CartLine[];
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      addItem: (product, quantity = 1) => {
        const current = get().lines;
        const existing = current.find((line) => line.productId === product.id);
        if (existing) {
          set({
            lines: current.map((line) =>
              line.productId === product.id
                ? { ...line, quantity: line.quantity + quantity }
                : line,
            )
          });
        } else {
          set({ lines: [...current, { productId: product.id, quantity }] });
        }
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ lines: get().lines.filter((line) => line.productId !== productId) });
          return;
        }
        set({
          lines: get().lines.map((line) =>
            line.productId === productId ? { ...line, quantity } : line,
          )
        });
      },
      removeItem: (productId) => {
        set({ lines: get().lines.filter((line) => line.productId !== productId) });
      },
      clear: () => set({ lines: [] })
    }),
    {
      name: 'glass-gift-shop-cart'
    },
  ),
);
