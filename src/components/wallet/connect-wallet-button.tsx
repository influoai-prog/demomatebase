'use client';

import { useEffect, useRef, useState } from 'react';
import { Copy, ExternalLink, Loader2, LogOut, RefreshCw, Sparkles, Wallet2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBaseAccount } from './base-account-provider';
import { formatEthBalance, truncateAddress } from '@/lib/utils';
import { toast } from 'sonner';

export function ConnectWalletButton() {
  const {
    connect,
    disconnect,
    isConnecting,
    universalAddress,
    ownerAddress,
    funderAddress,
    subAccount,
    autoSpendEnabled,
    universalBalance,
    ownerBalance,
    subAccountBalance,
    refreshBalances,
    isFetchingBalances,
    balanceError,
    isTestnet,
    walletUrl,
    fundSubAccount,
    defaultSubAccountFundingWei,
  } = useBaseAccount();
  const isConnected = Boolean(ownerAddress ?? universalAddress);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [isFundingSubAccount, setIsFundingSubAccount] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const displayAddress = ownerAddress ?? universalAddress ?? subAccount?.address ?? '';
  const subAccountAddress = subAccount?.address ?? null;
  const faucetUrl = isTestnet ? 'https://www.coinbase.com/faucets/base-sepolia-testnet' : null;
  const defaultFundingLabel = formatEthBalance(defaultSubAccountFundingWei, 6);
  const isCopied = (address: string | null) =>
    Boolean(address && copiedAddress && copiedAddress.toLowerCase() === address.toLowerCase());

  useEffect(() => {
    if (!copiedAddress) return;
    const timeout = window.setTimeout(() => setCopiedAddress(null), 2000);
    return () => window.clearTimeout(timeout);
  }, [copiedAddress]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!buttonRef.current) return;
      if (!buttonRef.current.parentElement?.contains(target)) {
        setMenuOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [menuOpen]);

  const handleButtonClick = () => {
    if (!isConnected) {
      void connect();
    } else {
      setMenuOpen((prev) => !prev);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    setMenuOpen(false);
  };

  const handleCopy = async (address: string | null) => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
    } catch (copyError) {
      console.warn('Failed to copy Base address', copyError);
    }
  };

  const handleRefreshBalances = () => {
    void refreshBalances();
  };

  const handleFundSubAccount = async () => {
    if (!subAccount?.address) {
      toast.error('Connect a Base wallet before funding the sub account.');
      return;
    }

    setIsFundingSubAccount(true);
    try {
      await fundSubAccount();
      toast.success(`Sent ${defaultFundingLabel} ETH to ${truncateAddress(subAccount.address, 6, 6)}`);
    } catch (fundError) {
      const fallback = fundError instanceof Error ? fundError.message : 'Funding failed';
      toast.error(fallback);
    } finally {
      setIsFundingSubAccount(false);
    }
  };

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        size="lg"
        className="gap-3 rounded-full border border-sky-400/40 bg-sky-500/20 px-6 text-sm font-semibold text-white shadow-[0_10px_40px_-20px_rgba(56,189,248,0.8)] hover:bg-sky-500/30"
        onClick={handleButtonClick}
        disabled={isConnecting}
      >
        {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet2 className="h-4 w-4" />}
        <span>{isConnected ? truncateAddress(displayAddress) : 'Connect Base Wallet'}</span>
        {isConnected && autoSpendEnabled && (
          <span className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.3em] text-white/70">
            <Sparkles className="h-3 w-3" />
            Auto Spend
          </span>
        )}
      </Button>
      {menuOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-xs rounded-2xl border border-white/10 bg-slate-950/90 p-4 text-sm text-white/80 shadow-[0_25px_70px_-35px_rgba(56,189,248,0.7)] backdrop-blur-xl">
          <p className="px-1 pb-3 text-xs uppercase tracking-[0.35em] text-white/40">Wallet</p>
          <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">Connected Base Account</p>
                <p className="mt-1 font-mono text-xs text-white/80">
                  {truncateAddress(universalAddress ?? displayAddress, 6, 6) || '—'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(universalAddress ?? displayAddress ?? null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:text-white"
                  aria-label="Copy connected address"
                >
                  {isCopied(universalAddress ?? displayAddress ?? null) ? (
                    <Sparkles className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleRefreshBalances}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:text-white"
                  aria-label="Refresh balances"
                >
                  {isFetchingBalances ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-white/50">
              <span>Balance</span>
              <span className="font-mono text-white/80">
                {isFetchingBalances
                  ? 'Updating…'
                  : universalBalance !== null
                    ? `${formatEthBalance(universalBalance)} ETH`
                    : '—'}
              </span>
            </div>
            {balanceError && <p className="text-[11px] leading-snug text-rose-300/80">{balanceError}</p>}
          </div>

          <div className="mt-3 space-y-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">Signing Wallet · Funder</p>
                <p className="mt-1 font-mono text-xs text-white/80">
                  {truncateAddress(funderAddress ?? ownerAddress ?? displayAddress, 6, 6) || '—'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(funderAddress ?? ownerAddress ?? displayAddress ?? null)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/70 transition hover:text-white"
                aria-label="Copy signing wallet"
              >
                {isCopied(funderAddress ?? ownerAddress ?? displayAddress ?? null) ? (
                  <Sparkles className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] leading-relaxed text-white/70">
              This wallet signs Base Account requests and can top up the sub account when balances run low.
            </p>
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-white/50">
              <span>Balance</span>
              <span className="font-mono text-white/80">
                {isFetchingBalances ? 'Updating…' : ownerBalance !== null ? `${formatEthBalance(ownerBalance)} ETH` : '—'}
              </span>
            </div>
            <Button
              size="sm"
              className="w-full rounded-full border border-white/20 bg-white/10 text-[0.75rem] font-semibold uppercase tracking-[0.28em] text-white hover:bg-white/20"
              onClick={handleFundSubAccount}
              disabled={isFundingSubAccount || isConnecting || !subAccountAddress}
            >
              {isFundingSubAccount ? 'Funding…' : `Fund Sub Account (${defaultFundingLabel} ETH)`}
            </Button>
          </div>

          {subAccountAddress && (
            <div className="mt-3 space-y-3 rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">Sub Account · Auto Spend</p>
                  <p className="mt-1 font-mono text-xs text-white/80">{truncateAddress(subAccountAddress, 6, 6)}</p>
                </div>
                <Sparkles className={`h-4 w-4 ${autoSpendEnabled ? 'text-sky-200' : 'text-white/50'}`} />
              </div>
              <p className="text-[11px] leading-relaxed text-white/60">
                Auto-spend permissions let this account settle Perfect Checkout without repeated approvals.
              </p>
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-white/50">
                <span>Balance</span>
                <span className="font-mono text-white/80">
                  {isFetchingBalances
                    ? 'Updating…'
                    : subAccountBalance !== null
                      ? `${formatEthBalance(subAccountBalance)} ETH`
                      : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-white/50">
                <span>Funded By</span>
                <span className="font-mono text-white/80">
                  {truncateAddress(funderAddress ?? ownerAddress ?? displayAddress, 4, 4) || '—'}
                </span>
              </div>
              {!autoSpendEnabled && (
                <p className="text-[11px] text-white/70">
                  Enable auto spend from the cart before completing checkout.
                </p>
              )}
            </div>
          )}

          <div className="mt-3 space-y-2">
            {faucetUrl && (
              <a
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-left text-xs font-medium uppercase tracking-[0.3em] text-white/80 transition hover:bg-white/20"
                href={faucetUrl}
                target="_blank"
                rel="noreferrer"
              >
                <span>Open Base Faucet</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <a
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-left text-xs font-medium uppercase tracking-[0.3em] text-white/70 transition hover:bg-white/15"
              href={walletUrl}
              target="_blank"
              rel="noreferrer"
            >
              <span>Deposit Manually</span>
              <ExternalLink className="h-4 w-4" />
            </a>
            <a
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-left text-xs font-medium uppercase tracking-[0.3em] text-white/70 transition hover:bg-white/15"
              href="https://github.com/stephancill/sub-accounts-fc-demo"
              target="_blank"
              rel="noreferrer"
            >
              <span>Reference Demo</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <button
            className="mt-4 flex w-full items-center gap-2 rounded-xl px-4 py-2 text-left transition hover:bg-white/10"
            onClick={handleDisconnect}
          >
            <LogOut className="h-4 w-4" />
            <span className="flex-1 text-xs font-medium uppercase tracking-[0.25em] text-white/70">Disconnect</span>
          </button>
        </div>
      )}
    </div>
  );
}
