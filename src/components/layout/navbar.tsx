'use client';

import { Sparkles } from 'lucide-react';
import { CartButton } from '@/components/cart/cart-button';
import { ConnectWalletButton } from '../wallet/connect-wallet-button';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/60 backdrop-blur-3xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white shadow-[0_20px_60px_-30px_rgba(148,163,184,0.75)]">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="space-y-0.5">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Glass Gift</p>
            <p className="text-lg font-semibold text-white">Micro Shop</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <CartButton />
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  );
}
