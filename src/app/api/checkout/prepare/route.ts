import { NextResponse } from 'next/server';
import { createOrderId } from '@/lib/order';

export async function POST(request: Request) {
  const body = await request.json();
  const { subAccountId, bufferedTotal, recipient } = body as {
    subAccountId: string;
    totalCents: number;
    bufferedTotal: number;
    tokenAddress: `0x${string}`;
    recipient: `0x${string}`;
  };

  if (!subAccountId || !recipient) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }

  const orderId = createOrderId();
  const permissionId = `${subAccountId}-${Date.now()}`;
  const validUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const weiValue = BigInt(Math.round((bufferedTotal / 100 / 3200) * 1e18)).toString(16);

  return NextResponse.json({
    orderId,
    permissionId,
    validUntil,
    payPayload: {
      to: recipient,
      value: `0x${weiValue}`
    }
  });
}
