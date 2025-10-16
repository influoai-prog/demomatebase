'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-store';
import { createPaymentSummary } from '@/lib/payment';
import { formatCurrency, formatTokenEstimate } from '@/lib/utils';
import { useBaseAccountSDK } from '@/lib/base-account';
import { toast } from 'sonner';

const TOKEN_PRICE_USD = 3200; // mocked ETH price

export function CheckoutFlow() {
  const sdk = useBaseAccountSDK();
  const lines = useCart((state) => state.lines);
  const clearCart = useCart((state) => state.clear);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof createPaymentSummary>> | null>(null);
  const [status, setStatus] = useState<string>('connect');
  const [subAccountId, setSubAccountId] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    createPaymentSummary(lines).then(setSummary);
  }, [lines]);

  const connectWallet = async () => {
    const provider = sdk.getProvider();
    const accounts = (await provider.request({ method: 'eth_requestAccounts', params: [] })) as string[];
    if (!accounts || accounts.length === 0) throw new Error('No account');
    return accounts[0];
  };

  const ensureSubAccount = async () => {
    const provider = sdk.getProvider();
    const accounts = (await provider.request({ method: 'eth_requestAccounts', params: [] })) as string[];
    const universal = accounts[0];
    const existing = (await provider.request({
      method: 'wallet_getSubAccounts',
      params: [
        {
          account: universal,
          domain: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
        }
      ]
    })) as { subAccounts: Array<{ address: string }> };

    if (existing?.subAccounts?.[0]) {
      setSubAccountId(existing.subAccounts[0].address);
      return existing.subAccounts[0].address;
    }

    const created = (await provider.request({
      method: 'wallet_addSubAccount',
      params: [
        {
          account: {
            type: 'create'
          }
        }
      ]
    })) as { address: string };

    setSubAccountId(created.address);
    return created.address;
  };

  const prepare = async () => {
    if (!summary) return;
    try {
      setIsPreparing(true);
      setStatus('prepare');
      await connectWallet();
      const subId = await ensureSubAccount();
      const response = await fetch('/api/checkout/prepare', {
        method: 'POST',
        body: JSON.stringify({
          lines,
          subAccountId: subId,
          totalCents: summary.totalCents,
          bufferedTotal: summary.bufferedTotal,
          tokenAddress: summary.tokenAddress,
          recipient: summary.recipient
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to prepare checkout');
      const data = (await response.json()) as {
        orderId: string;
        permissionId: string;
        payPayload: { to: `0x${string}`; value: string };
        validUntil: string;
      };
      setOrderId(data.orderId);
      setStatus('ready');
      toast.success('Spend permission configured');
    } catch (error) {
      console.error(error);
      toast.error('Failed to prepare checkout');
      setStatus('connect');
    } finally {
      setIsPreparing(false);
    }
  };

  const pay = async () => {
    if (!summary) return;
    try {
      setIsPaying(true);
      setStatus('paying');
      const provider = sdk.getProvider();
      const [, sub] = (await provider.request({ method: 'eth_requestAccounts', params: [] })) as string[];
      const toPay = summary.recipient;
      const tx = (await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: sub ?? subAccountId,
            to: toPay,
            value: `0x${Math.round((summary.totalCents / 100 / TOKEN_PRICE_USD) * 1e18).toString(16)}`
          }
        ]
      })) as string;
      setTxHash(tx);
      setStatus('complete');
      clearCart();
      toast.success('Payment submitted');
    } catch (error) {
      console.error(error);
      toast.error('Payment failed');
      setStatus('ready');
    } finally {
      setIsPaying(false);
    }
  };

  if (!summary || lines.length === 0) {
    return (
      <div className="glass-card p-10 text-center text-white/70">
        Your cart is empty. Continue exploring the collection.
      </div>
    );
  }

  return (
    <div className="glass-card flex flex-col gap-6 p-8">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Checkout with Base</h2>
        <p className="text-sm text-white/70">
          A sub account will be provisioned with auto spend permissions covering your order total plus buffer.
        </p>
      </div>
      <div className="flex flex-col gap-3 text-sm text-white/70">
        <p>
          Cart total <span className="font-semibold text-white">{formatCurrency(summary.totalCents)}</span> (~
          {formatTokenEstimate(summary.totalCents, TOKEN_PRICE_USD)} ETH)
        </p>
        <p>
          Auto spend buffer adds 5%: {formatCurrency(summary.bufferedTotal)} maximum authorization.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <Button onClick={prepare} disabled={isPreparing || status === 'ready' || status === 'complete'}>
          {status === 'prepare' || isPreparing ? 'Preparing permissions…' : 'Configure Auto Spend'}
        </Button>
        <Button onClick={pay} disabled={status !== 'ready' || isPaying}>
          {isPaying ? 'Paying…' : 'Pay with Base'}
        </Button>
      </div>
      {status === 'complete' && (
        <div className="rounded-3xl border border-white/20 bg-white/10 p-6 text-sm text-white/70">
          <p className="font-semibold text-white">Order confirmed</p>
          <p className="mt-2">Order ID: {orderId}</p>
          <p className="mt-1 break-all">Transaction hash: {txHash}</p>
        </div>
      )}
    </div>
  );
}
