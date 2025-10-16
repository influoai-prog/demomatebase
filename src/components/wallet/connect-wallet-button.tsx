'use client';

import { Loader2, Sparkles, Wallet2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBaseAccount } from './base-account-provider';
import { truncateAddress } from '@/lib/utils';

export function ConnectWalletButton() {
  const { connect, isConnecting, universalAddress, subAccount } = useBaseAccount();
  const isConnected = Boolean(universalAddress);

  return (
    <Button
      size="lg"
      className="gap-3 rounded-full border border-sky-400/40 bg-sky-500/20 px-6 text-sm font-semibold text-white shadow-[0_10px_40px_-20px_rgba(56,189,248,0.8)] hover:bg-sky-500/30"
      onClick={connect}
      disabled={isConnecting}
    >
      {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet2 className="h-4 w-4" />}
      <span>{isConnected ? truncateAddress(subAccount?.address ?? universalAddress ?? '') : 'Connect Base Wallet'}</span>
      {subAccount && !isConnecting && (
        <span className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.3em] text-white/70">
          <Sparkles className="h-3 w-3" /> Auto Spend
        </span>
      )}
    </Button>
  );
}
