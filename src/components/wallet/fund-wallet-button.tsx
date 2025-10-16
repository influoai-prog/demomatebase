'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Copy, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useBaseAccount } from './base-account-provider';
import { formatTokenBalance, truncateAddress } from '@/lib/utils';
import { FAUCET_BALANCE_THRESHOLD } from '@/lib/faucet';
import { formatUnits } from 'viem';
import { toast } from 'sonner';

const FUND_HELP_URL =
  process.env.NEXT_PUBLIC_BASE_FAUCET_URL ?? 'https://docs.base.org/tools/network-faucets';

export function FundWalletButton() {
  const {
    fundingAddress,
    spendTokenBalance,
    spendTokenDecimals,
    refreshBalance,
    universalAddress,
  } = useBaseAccount();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [faucetError, setFaucetError] = useState<string | null>(null);

  const formattedBalance = useMemo(
    () => formatTokenBalance(spendTokenBalance, spendTokenDecimals) ?? '—',
    [spendTokenBalance, spendTokenDecimals],
  );

  useEffect(() => {
    if (!open) {
      setCopied(false);
      setFaucetError(null);
      return;
    }
    void refreshBalance();
  }, [open, refreshBalance]);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  const handleCopy = async () => {
    const addressToCopy = fundingAddress ?? universalAddress;
    if (!addressToCopy) return;
    try {
      await navigator.clipboard.writeText(addressToCopy);
      setCopied(true);
    } catch (error) {
      console.warn('Unable to copy Base address', error);
      setCopied(false);
    }
  };

  const handleFaucet = async () => {
    const addressToFund = fundingAddress ?? universalAddress;
    if (!addressToFund) {
      toast.error('Connect your Base wallet to request funds.');
      return;
    }
    setIsFunding(true);
    setFaucetError(null);
    const loadingId = toast.loading('Requesting testnet USDC…');
    try {
      const response = await fetch('/api/faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addressToFund }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        reason?: string;
        explorerUrl?: string;
      };

      if (!response.ok) {
        const message = payload.error ?? 'Unable to request faucet funds.';
        setFaucetError(payload.reason ?? message);
        throw new Error(message);
      }

      toast.dismiss(loadingId);
      toast.success('USDC sent to your wallet!', {
        description: payload.explorerUrl ? `View on BaseScan: ${payload.explorerUrl}` : 'Refresh balance after a moment.',
      });
      await refreshBalance();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to request faucet funds.';
      toast.dismiss(loadingId);
      toast.error(message);
    } finally {
      setIsFunding(false);
    }
  };

  const displayAddress = fundingAddress ?? universalAddress ?? '';
  const numericBalance = useMemo(() => {
    if (spendTokenBalance === null) {
      return null;
    }
    try {
      return Number(formatUnits(spendTokenBalance, spendTokenDecimals));
    } catch {
      return null;
    }
  }, [spendTokenBalance, spendTokenDecimals]);

  const canUseFaucet = Boolean(displayAddress) && (numericBalance === null || numericBalance < FAUCET_BALANCE_THRESHOLD);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full border-white/30 bg-white/10 px-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/80 transition hover:bg-white/20 sm:px-5 sm:text-xs sm:tracking-[0.35em]"
        >
          <span className="hidden sm:inline">Fund Wallet</span>
          <span className="sm:hidden">Fund</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Fund your Mate Shop wallet</DialogTitle>
        <DialogDescription>
          Send USDC to the Base address below and it will appear in your balance. Need testnet funds?{' '}
          <Link href={FUND_HELP_URL} target="_blank" rel="noreferrer" className="text-white underline">
            Visit the Base faucet
          </Link>
          .
        </DialogDescription>
        <div className="mt-6 space-y-5 text-sm text-white/70">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Deposit address</p>
            {displayAddress ? (
              <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="break-all font-mono text-sm text-white">{displayAddress}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.3em] text-white/70">
                    {truncateAddress(displayAddress, 6)}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-2 rounded-full border-white/30 bg-white/10 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white/20"
                    onClick={handleCopy}
                  >
                    <Copy className="h-3 w-3" />
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="rounded-3xl border border-dashed border-white/20 bg-white/5 p-4 text-center text-sm text-white/60">
                Connect your Base wallet to view the deposit address.
              </p>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 p-4">
              <span className="text-xs uppercase tracking-[0.35em] text-white/50">Current balance</span>
              <span className="text-base font-semibold text-white">{formattedBalance}</span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 hover:text-white"
              onClick={() => {
                void refreshBalance();
              }}
            >
              <RefreshCcw className="h-3 w-3" /> Refresh balance
            </Button>
            {canUseFaucet ? (
              <Button
                type="button"
                size="sm"
                className="w-full gap-2 rounded-full bg-sky-500/90 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-[0_10px_40px_-20px_rgba(56,189,248,0.8)] hover:bg-sky-400"
                onClick={handleFaucet}
                disabled={isFunding}
              >
                {isFunding ? 'Requesting…' : 'Request testnet USDC'}
              </Button>
            ) : (
              <p className="text-xs text-white/60">
                Faucet available for balances below {FAUCET_BALANCE_THRESHOLD} USDC. Current balance{' '}
                {numericBalance?.toFixed(2) ?? '0.00'} USDC.
              </p>
            )}
            {faucetError && <p className="text-xs text-red-300">{faucetError}</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
