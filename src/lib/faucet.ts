import { createPublicClient, formatUnits, http } from 'viem';
import { base, baseSepolia } from 'viem/chains';

const network = (process.env.NEXT_PUBLIC_NETWORK as 'base' | 'base-sepolia' | undefined) ?? 'base-sepolia';
const chain = network === 'base' ? base : baseSepolia;
const defaultSpendTokenAddress = (
  network === 'base'
    ? '0x833589fCD6eDb6E08f4c7C32D4f41d6E548150d9'
    : '0x036cbd53842c5426634e7929541ec2318f3dcf7e'
) as `0x${string}`;

const spendTokenAddress =
  (process.env.NEXT_PUBLIC_BASE_AUTO_SPEND_TOKEN as `0x${string}` | undefined) ?? defaultSpendTokenAddress;

const parsedDecimals = Number.parseInt(process.env.NEXT_PUBLIC_BASE_AUTO_SPEND_TOKEN_DECIMALS ?? '6', 10);
export const spendTokenDecimals = Number.isNaN(parsedDecimals) ? 6 : parsedDecimals;

const parsedThreshold = Number.parseFloat(process.env.NEXT_PUBLIC_BASE_FAUCET_THRESHOLD ?? '0.25');
export const FAUCET_BALANCE_THRESHOLD = Number.isFinite(parsedThreshold) ? parsedThreshold : 0.25;

const defaultRpcUrl = network === 'base' ? 'https://mainnet.base.org' : 'https://sepolia.base.org';
const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL ?? defaultRpcUrl;

const ERC20_BALANCE_OF_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
] as const;

export async function isEligibleForFaucet(address: string) {
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  const balance = await publicClient.readContract({
    address: spendTokenAddress,
    abi: ERC20_BALANCE_OF_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
  });

  const balanceFormatted = Number(formatUnits(balance, spendTokenDecimals));

  if (!Number.isFinite(balanceFormatted)) {
    return {
      eligible: false,
      balance: '0',
      reason: 'Unable to determine current balance.',
    } as const;
  }

  if (balanceFormatted > FAUCET_BALANCE_THRESHOLD) {
    return {
      eligible: false,
      balance: balanceFormatted.toFixed(4),
      reason: `Balance (${balanceFormatted.toFixed(2)} USDC) is above the ${FAUCET_BALANCE_THRESHOLD} USDC faucet threshold.`,
    } as const;
  }

  return {
    eligible: true,
    balance: balanceFormatted.toFixed(4),
  } as const;
}
