import { NextResponse } from 'next/server';
import { CdpClient } from '@coinbase/cdp-sdk';

const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;
const NETWORK = (process.env.NEXT_PUBLIC_NETWORK ?? 'base-sepolia').toLowerCase();

export async function POST(request: Request) {
  if (NETWORK === 'base') {
    return NextResponse.json(
      { error: 'The faucet is only available on Base Sepolia.' },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const payload = (body && typeof body === 'object' ? body : {}) as { address?: string; token?: string };
  const address = typeof payload.address === 'string' ? payload.address.trim() : '';
  const tokenInput = typeof payload.token === 'string' ? payload.token.trim().toLowerCase() : 'eth';

  if (!ADDRESS_PATTERN.test(address)) {
    return NextResponse.json({ error: 'A valid wallet address is required.' }, { status: 400 });
  }

  const token = tokenInput === 'usdc' ? 'usdc' : 'eth';

  const apiKeyId = process.env.CDP_API_KEY_ID;
  const apiKeySecret = process.env.CDP_API_KEY_SECRET;
  const walletSecret = process.env.CDP_WALLET_SECRET;

  if (!apiKeyId || !apiKeySecret || !walletSecret) {
    return NextResponse.json(
      { error: 'Server configuration error: missing CDP faucet credentials.' },
      { status: 500 },
    );
  }

  try {
    const client = new CdpClient();
    const faucetResponse = await client.evm.requestFaucet({
      address,
      network: 'base-sepolia',
      token,
    });

    return NextResponse.json({
      success: true,
      transactionHash: faucetResponse.transactionHash,
      explorerUrl: `https://sepolia.basescan.org/tx/${faucetResponse.transactionHash}`,
      message: `Faucet request accepted for ${address.slice(0, 6)}…${address.slice(-4)}.`,
    });
  } catch (error) {
    console.error('Faucet request failed', error);

    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as { response?: { status?: number } }).response;
      if (response?.status === 429) {
        return NextResponse.json(
          { error: 'Faucet rate limit reached. Try again in a few minutes.' },
          { status: 429 },
        );
      }
    }

    const message = error instanceof Error ? error.message : 'Unexpected faucet error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
