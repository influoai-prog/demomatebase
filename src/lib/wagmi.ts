import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';

type SupportedNetwork = 'base' | 'base-sepolia';

const network = (process.env.NEXT_PUBLIC_NETWORK as SupportedNetwork | undefined) ?? 'base-sepolia';
const chain = network === 'base' ? base : baseSepolia;
const customRpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL;
const baseRpc = customRpcUrl && network === 'base' ? customRpcUrl : base.rpcUrls.default.http[0];
const baseSepoliaRpc = customRpcUrl && network === 'base-sepolia' ? customRpcUrl : baseSepolia.rpcUrls.default.http[0];

export const wagmiConfig = createConfig({
  chains: [chain],
  connectors: [],
  transports: {
    [base.id]: http(baseRpc),
    [baseSepolia.id]: http(baseSepoliaRpc),
  },
});

export type WagmiConfig = typeof wagmiConfig;
export { chain as activeChain };
