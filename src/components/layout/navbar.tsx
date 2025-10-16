'use client';

import Link from 'next/link';
import { ConnectWalletButton } from '../wallet/connect-wallet-button';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/50 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="glass-button text-xs font-semibold uppercase tracking-[0.4em]">
          Glass Gift Shop
        </Link>
        <ConnectWalletButton />
      </div>
    </header>
  );
}
