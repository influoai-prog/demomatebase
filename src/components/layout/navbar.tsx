'use client';

import { Sparkles } from 'lucide-react';
import { CartButton } from '@/components/cart/cart-button';
import { ConnectWalletButton } from '../wallet/connect-wallet-button';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white shadow-[0_18px_40px_-26px_rgba(148,163,184,0.75)]">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-[0.5em] text-white/50">Mate Shop</p>
            <p className="text-base font-semibold text-white/90">Base micro market</p>
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
