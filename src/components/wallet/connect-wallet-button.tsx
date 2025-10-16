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
  const isConnected = Boolean(ownerAddress ?? universalAddress ?? subAccount?.address);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [isFundingSubAccount, setIsFundingSubAccount] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const connectedAddress = ownerAddress ?? universalAddress ?? subAccount?.address ?? null;
  const displayAddress = connectedAddress ?? '';
  const subAccountAddress = subAccount?.address ?? null;
  const faucetUrl = isTestnet ? 'https://www.coinbase.com/faucets/base-sepolia-testnet' : null;
  const defaultFundingLabel = formatEthBalance(defaultSubAccountFundingWei, 6);
  const ownerDisplayAddress = ownerAddress ?? connectedAddress;
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
        className="gap-3 rounded-full border border-white/10 bg-white/10 px-6 text-sm font-semibold text-white shadow-[0_12px_35px_-20px_rgba(15,118,110,0.8)] hover:bg-white/20"
        onClick={handleButtonClick}
        disabled={isConnecting}
      >
        {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet2 className="h-4 w-4" />}
        <span>{isConnected ? truncateAddress(displayAddress || '') : 'Connect Base Wallet'}</span>
        {isConnected && autoSpendEnabled && (
          <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-white/70">
            <Sparkles className="h-3 w-3" />
            Auto Spend
          </span>
        )}
      </Button>
      {menuOpen && (
        <div className="absolute right-0 z-50 mt-2 w-[22rem] max-w-xs rounded-2xl border border-white/10 bg-slate-950/90 p-4 text-sm text-white/80 shadow-[0_25px_70px_-35px_rgba(8,47,73,0.7)] backdrop-blur-xl">
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/50">Signing wallet</p>
                  <p className="mt-1 font-mono text-sm text-white">
                    {truncateAddress(ownerDisplayAddress ?? null, 6, 6) || '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(ownerDisplayAddress ?? null)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:text-white"
                    aria-label="Copy signing wallet"
                  >
                    {isCopied(ownerDisplayAddress ?? null) ? <Sparkles className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
              <p className="mt-2 text-xs leading-relaxed text-white/60">
                Signs Base Account requests and funds the checkout wallet when balances run low.
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-white/60">
                <span>Balance</span>
                <span className="font-mono text-sm text-white">
                  {isFetchingBalances ? 'Updating…' : ownerBalance !== null ? `${formatEthBalance(ownerBalance)} ETH` : '—'}
                </span>
              </div>
              {subAccountAddress && (
                <div className="mt-3 grid gap-2 text-xs text-white/60">
                  <div className="flex items-center justify-between">
                    <span>Checkout wallet</span>
                    <span className="font-mono text-sm text-white">{truncateAddress(subAccountAddress, 6, 6)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Checkout balance</span>
                    <span className="font-mono text-sm text-white">
                      {isFetchingBalances
                        ? 'Updating…'
                        : subAccountBalance !== null
                          ? `${formatEthBalance(subAccountBalance)} ETH`
                          : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Funded by</span>
                    <span className="font-mono text-sm text-white">
                      {truncateAddress(funderAddress ?? ownerDisplayAddress ?? null, 4, 4) || '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <span className="flex items-center gap-2 font-mono text-sm text-white">
                      <Sparkles className={`h-3 w-3 ${autoSpendEnabled ? 'text-sky-200' : 'text-white/50'}`} />
                      {autoSpendEnabled ? 'Auto spend' : 'Manual approval'}
                    </span>
                  </div>
                </div>
              )}
              {balanceError && <p className="mt-3 text-xs leading-snug text-rose-300/80">{balanceError}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={handleFundSubAccount}
                  disabled={isFundingSubAccount || isConnecting || !subAccountAddress}
                >
                  {isFundingSubAccount ? 'Funding…' : `Send ${defaultFundingLabel} ETH to checkout`}
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              {faucetUrl && (
                <a
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-left text-xs font-medium uppercase tracking-[0.25em] text-white/70 transition hover:bg-white/15"
                  href={faucetUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>Open Base faucet</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              <a
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-left text-xs font-medium uppercase tracking-[0.25em] text-white/70 transition hover:bg-white/15"
                href={walletUrl}
                target="_blank"
                rel="noreferrer"
              >
                <span>Deposit manually</span>
                <ExternalLink className="h-4 w-4" />
              </a>
              <a
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-left text-xs font-medium uppercase tracking-[0.25em] text-white/70 transition hover:bg-white/15"
                href="https://github.com/stephancill/sub-accounts-fc-demo"
                target="_blank"
                rel="noreferrer"
              >
                <span>Reference demo</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 border-transparent text-xs font-semibold uppercase tracking-[0.25em] text-white/70"
              onClick={handleDisconnect}
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
