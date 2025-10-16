'use client';

import { createContext, useCallback, useContext, useMemo, useReducer, useState } from 'react';
import type { Product } from '@/data/products';

type CartItem = {
  id: string;
  title: string;
  priceCents: number;
  quantity: number;
};

type CartAction =
  | { type: 'add'; product: Product }
  | { type: 'remove'; id: string }
  | { type: 'clear' };

type CartContextValue = {
  items: CartItem[];
  totalCents: number;
  itemCount: number;
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  openCart: () => void;
};

function reducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'add': {
      const existing = state.find((item) => item.id === action.product.id);
      if (existing) {
        return state.map((item) =>
          item.id === action.product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [
        ...state,
        {
          id: action.product.id,
          title: action.product.title,
          priceCents: action.product.priceCents,
          quantity: 1,
        },
      ];
    }
    case 'remove': {
      return state.filter((item) => item.id !== action.id);
    }
    case 'clear': {
      return [];
    }
    default:
      return state;
  }
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(reducer, []);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((product: Product) => dispatch({ type: 'add', product }), []);
  const removeItem = useCallback((id: string) => dispatch({ type: 'remove', id }), []);
  const clear = useCallback(() => dispatch({ type: 'clear' }), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const setOpen = useCallback((open: boolean) => setIsOpen(open), []);

  const totalCents = useMemo(
    () => items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0),
    [items],
  );
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const value = useMemo<CartContextValue>(
    () => ({ items, totalCents, itemCount, addItem, removeItem, clear, isOpen, setOpen, openCart }),
    [items, totalCents, itemCount, addItem, removeItem, clear, isOpen, openCart, setOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
