'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, LogOut, Sparkles, Wallet2 } from 'lucide-react';
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
  } = useBaseAccount();
  const isConnected = Boolean(universalAddress);
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

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
          <p className="px-2 pb-3 text-xs uppercase tracking-[0.35em] text-white/40">Wallet</p>
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs uppercase tracking-[0.25em] text-white/60">
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
