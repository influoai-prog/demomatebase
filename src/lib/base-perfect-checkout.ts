'use client';

import { pay, type PaymentOptions, type PaymentResult } from '@base-org/account';
import { isAddress } from 'viem';
import { centsToUsdAmount } from '@/lib/utils';

type PerfectCheckoutOptions = {
  recipient?: `0x${string}`;
  testnet?: boolean;
  payerInfo?: PaymentOptions['payerInfo'];
};

const configuredRecipient = process.env.NEXT_PUBLIC_BASE_CHECKOUT_RECIPIENT ?? process.env.NEXT_PUBLIC_BASE_INVOICE_RECIPIENT;
const walletUrl = process.env.NEXT_PUBLIC_BASE_WALLET_URL;

function resolveRecipient(override?: `0x${string}`): `0x${string}` {
  if (override && isAddress(override)) {
    return override;
  }
  if (configuredRecipient && isAddress(configuredRecipient)) {
    return configuredRecipient;
  }
  throw new Error('No valid checkout recipient configured');
}

export async function runPerfectCheckout(totalCents: number, options: PerfectCheckoutOptions = {}): Promise<PaymentResult> {
  if (totalCents <= 0) {
    throw new Error('Cart total must be greater than zero before checkout.');
  }

  const amount = centsToUsdAmount(totalCents);
  const recipient = resolveRecipient(options.recipient);

  return pay({
    amount,
    to: recipient,
    testnet: options.testnet ?? false,
    payerInfo: options.payerInfo,
    walletUrl: walletUrl || undefined,
  });
}
