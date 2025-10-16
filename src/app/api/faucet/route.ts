import { NextResponse } from 'next/server';
import { CdpClient } from '@coinbase/cdp-sdk';
import { isEligibleForFaucet } from '@/lib/faucet';

const network = (process.env.NEXT_PUBLIC_NETWORK as 'base' | 'base-sepolia' | undefined) ?? 'base-sepolia';

export async function POST(request: Request) {
  try {
    if (network !== 'base-sepolia') {
      return NextResponse.json(
        { error: 'The built-in faucet is only available on Base Sepolia.' },
        { status: 400 },
      );
    }

    const { address } = (await request.json()) as { address?: string };

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const eligibility = await isEligibleForFaucet(address);
    if (!eligibility.eligible) {
      return NextResponse.json(
        {
          error: 'Not eligible for faucet',
          balance: eligibility.balance,
          reason: eligibility.reason,
        },
        { status: 403 },
      );
    }

    const apiKeyId = process.env.CDP_API_KEY_ID;
    const apiKeySecret = process.env.CDP_API_KEY_SECRET;
    const walletSecret = process.env.CDP_WALLET_SECRET;

    if (!apiKeyId || !apiKeySecret || !walletSecret) {
      return NextResponse.json(
        { error: 'Faucet unavailable: missing CDP credentials on the server.' },
        { status: 500 },
      );
    }

    const client = new CdpClient();
    const response = await client.evm.requestFaucet({
      address,
      network: 'base-sepolia',
      token: 'usdc',
    });

    return NextResponse.json({
      ok: true,
      transactionHash: response.transactionHash,
      explorerUrl: `https://sepolia.basescan.org/tx/${response.transactionHash}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected faucet error';
    const status =
      typeof error === 'object' && error && 'response' in error && typeof (error as any).response?.status === 'number'
        ? (error as any).response.status
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
