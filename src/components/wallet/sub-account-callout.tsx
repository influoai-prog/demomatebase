'use client';

import { useState } from 'react';
import { ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBaseAccount } from './base-account-provider';
import { truncateAddress } from '@/lib/utils';

export function SubAccountCallout() {
  const { connect, ensureSubAccount, isConnecting, universalAddress, subAccount, error } = useBaseAccount();
  const [isProvisioning, setIsProvisioning] = useState(false);

  const handleEnsure = async () => {
    setIsProvisioning(true);
    try {
      await ensureSubAccount();
    } finally {
      setIsProvisioning(false);
    }
  };

  const connectionLabel = subAccount
    ? `Sub · ${truncateAddress(subAccount.address)}`
    : universalAddress
      ? `Universal · ${truncateAddress(universalAddress)}`
      : 'Not connected';

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/15 bg-slate-950/70 p-6 text-white/80 backdrop-blur-2xl">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-100">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Base Account</p>
          <p className="text-lg font-semibold text-white">{connectionLabel}</p>
        </div>
      </div>
      <p className="text-sm text-white/60">
        Sub Accounts let you provision an app-scoped wallet with automatic spend permissions so repeat purchases stay frictionless
        for your shoppers.
      </p>
      {subAccount && (
        <div className="flex items-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.3em] text-sky-100">
          <Zap className="h-3.5 w-3.5" /> Auto spend active
        </div>
      )}
      {!subAccount && error && (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs text-red-100">{error}</div>
      )}
      <div className="mt-2 flex flex-wrap gap-3">
        <Button
          size="lg"
          className="rounded-full border border-white/20 bg-white/15 text-sm font-semibold text-white hover:bg-white/25"
          onClick={connect}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting…' : universalAddress ? 'Reconnect' : 'Connect Wallet'}
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="rounded-full border border-emerald-400/30 bg-emerald-500/10 text-sm font-semibold text-emerald-100 hover:border-emerald-400/50 hover:bg-emerald-500/20"
          onClick={handleEnsure}
          disabled={isProvisioning}
        >
          {isProvisioning ? 'Preparing…' : subAccount ? 'Refresh Sub Account' : 'Provision Sub Account'}
        </Button>
      </div>
    </div>
  );
}
