'use client';

import { createConfig, http } from 'wagmi';
import { baseSepolia, base } from 'wagmi/chains';
import { coinbaseWallet, injected } from 'wagmi/connectors';

const network = process.env.NEXT_PUBLIC_NETWORK ?? 'base-sepolia';
const chain = network === 'base' ? base : baseSepolia;

export const wagmiConfig = createConfig({
  chains: [chain],
  transports: {
    [chain.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL)
  },
  connectors: [
    injected({
      target: 'base',
      shimDisconnect: true
    }),
    coinbaseWallet({ appName: 'Glass Gift Shop', preference: 'smartWalletOnly' })
  ]
});
