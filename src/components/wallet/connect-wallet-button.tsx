'use client';

import { ConnectWallet } from '@coinbase/onchainkit/wallet';

export function ConnectWalletButton() {
  return (
    <ConnectWallet
      text="Connect Wallet"
      className="glass-button inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em]"
      disconnectedLabel="Connect"
    />
  );
}
