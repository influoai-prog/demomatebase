import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';

type SupportedNetwork = 'base' | 'base-sepolia';

const network = (process.env.NEXT_PUBLIC_NETWORK as SupportedNetwork | undefined) ?? 'base-sepolia';
const chain = network === 'base' ? base : baseSepolia;
const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL ?? chain.rpcUrls.default.http[0];

const transports = {
  [chain.id]: http(rpcUrl)
} as Record<number, ReturnType<typeof http>>;

export const wagmiConfig = createConfig({
  chains: [chain],
  transports,
  connectors: [
    injected({ shimDisconnect: true }),
    coinbaseWallet({ appName: 'Glass Gift Shop', preference: 'smartWalletOnly' })
  ]
});

export type WagmiConfig = typeof wagmiConfig;
export { chain as activeChain };
