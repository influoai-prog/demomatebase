'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Clipboard, Coins, Loader2, LogOut, Sparkles, Wallet2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBaseAccount } from './base-account-provider';
import { truncateAddress } from '@/lib/utils';

export function ConnectWalletButton() {
  const {
    connect,
    disconnect,
    isConnecting,
    universalAddress,
    subAccount,
    autoSpendEnabled,
    balance,
    refreshBalance,
  } = useBaseAccount();
  const isConnected = Boolean(universalAddress);
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

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

  useEffect(() => {
    if (!menuOpen) return;
    void refreshBalance();
  }, [menuOpen, refreshBalance]);

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

  const formattedBalance = useMemo(() => {
    if (!balance) return null;
    const numeric = Number.parseFloat(balance);
    if (Number.isNaN(numeric)) return null;
    return `${numeric.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })} ETH`;
  }, [balance]);

  const fundAddress = subAccount?.address ?? universalAddress ?? '';

  const handleFundWallet = async () => {
    if (!fundAddress) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(fundAddress);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = fundAddress;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch (error) {
      console.warn('Unable to copy wallet address', error);
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 2000);
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
        <span>{isConnected ? truncateAddress(subAccount?.address ?? universalAddress ?? '') : 'Connect Base Wallet'}</span>
        {isConnected && autoSpendEnabled && (
          <span className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.3em] text-white/70">
            <Sparkles className="h-3 w-3" />
            Auto Spend
          </span>
        )}
      </Button>
      {menuOpen && (
        <div className="absolute right-0 z-50 mt-2 w-52 rounded-2xl border border-white/10 bg-slate-950/90 p-3 text-sm text-white/80 shadow-[0_25px_70px_-35px_rgba(56,189,248,0.7)] backdrop-blur-xl">
          <p className="px-2 pb-2 text-xs uppercase tracking-[0.35em] text-white/40">Wallet</p>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Balance</p>
            <p className="mt-1 text-sm font-semibold text-white/90">{formattedBalance ?? '—'}</p>
            {fundAddress && (
              <p className="mt-2 truncate rounded-md bg-black/40 px-2 py-1 font-mono text-[11px] text-white/60">{truncateAddress(fundAddress, 6, 6)}</p>
            )}
          </div>
          <button
            className="mt-2 flex w-full items-center gap-3 rounded-xl border border-sky-400/30 bg-sky-500/15 px-3 py-2 text-left text-sm transition hover:border-sky-300/40 hover:bg-sky-500/25"
            onClick={handleFundWallet}
            disabled={!fundAddress}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10">
              <Coins className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-white">Fund wallet</p>
              <p className="text-[11px] text-white/60">Copy address to top up</p>
            </div>
            <div className="text-white/70">
              {copyState === 'copied' ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
            </div>
          </button>
          <div className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs uppercase tracking-[0.25em] text-white/60">
            <Sparkles className="h-4 w-4" />
            {autoSpendEnabled ? 'Auto Spend Ready' : 'Awaiting Invoice' }
          </div>
          <button
            className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition hover:bg-white/10"
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
