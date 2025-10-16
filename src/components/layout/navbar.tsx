'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ConnectWalletButton } from '../wallet/connect-wallet-button';
import { CartButton } from '@/components/cart/cart-button';
import { useBaseAccount } from '../wallet/base-account-provider';
import { formatTokenBalance } from '@/lib/utils';
import { FundWalletButton } from '../wallet/fund-wallet-button';

export function Navbar() {
  const { spendTokenBalance, spendTokenDecimals } = useBaseAccount();

  const formattedBalance = useMemo(
    () => formatTokenBalance(spendTokenBalance, spendTokenDecimals) ?? '—',
    [spendTokenBalance, spendTokenDecimals],
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/30 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="glass-button text-sm font-semibold uppercase tracking-[0.4em]">
          Mate Shop
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-white/60">
            <span>Balance</span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold normal-case tracking-normal text-white">
              {formattedBalance}
            </span>
          </div>
          <FundWalletButton />
          <ConnectWalletButton />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
