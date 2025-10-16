'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-store';
import { createPaymentSummary } from '@/lib/payment';
import { formatCurrency, formatTokenEstimate, truncateAddress } from '@/lib/utils';
import { useBaseAccount } from '@/components/wallet/base-account-provider';
import { toast } from 'sonner';

const TOKEN_PRICE_USD = 3200;

type CheckoutStep = 'connect' | 'configure' | 'invoice' | 'complete';
type ProcessingAction = CheckoutStep | null;

export function CheckoutFlow() {
  const {
    connect,
    ensureSubAccount,
    requestAutoSpend,
    payInvoice,
    subAccount,
    universalAddress,
    fundingAddress,
    autoSpendEnabled,
    refreshBalance,
  } = useBaseAccount();
  const lines = useCart((state) => state.lines);
  const clearCart = useCart((state) => state.clear);
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof createPaymentSummary>> | null>(null);
  const [step, setStep] = useState<CheckoutStep>('connect');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [permissionId, setPermissionId] = useState<string | null>(null);
  const [validUntil, setValidUntil] = useState<string | null>(null);
  const [processing, setProcessing] = useState<ProcessingAction>(null);

  useEffect(() => {
    let isMounted = true;
    createPaymentSummary(lines).then((result) => {
      if (isMounted) {
        setSummary(result);
      }
    });
    setStep('connect');
    setOrderId(null);
    setPermissionId(null);
    setValidUntil(null);
    return () => {
      isMounted = false;
    };
  }, [lines]);

  useEffect(() => {
    if (autoSpendEnabled && step === 'configure') {
      setStep('invoice');
    }
  }, [autoSpendEnabled, step]);

  const cartTotals = useMemo(() => {
    if (!summary) {
      return null;
    }
    return {
      subtotal: formatCurrency(summary.subtotalCents),
      tax: formatCurrency(summary.taxCents),
      total: formatCurrency(summary.totalCents),
      buffer: formatCurrency(summary.bufferedTotal),
      totalEstimate: formatTokenEstimate(summary.totalCents, TOKEN_PRICE_USD),
    };
  }, [summary]);

  const runWithProcessing = async (action: ProcessingAction, callback: () => Promise<void>) => {
    setProcessing(action);
    try {
      await callback();
    } finally {
      setProcessing(null);
    }
  };

  const handlePrepare = async () => {
    if (!summary || lines.length === 0) {
      toast.error('Add items to your cart before checking out.');
      return;
    }

    await runWithProcessing('connect', async () => {
      try {
        await connect();
        const ensured = await ensureSubAccount();
        if (!ensured) {
          throw new Error('Unable to provision Base sub account');
        }

        const response = await fetch('/api/checkout/prepare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lines,
            subAccountId: ensured.address,
            totalCents: summary.totalCents,
            bufferedTotal: summary.bufferedTotal,
            tokenAddress: summary.tokenAddress,
            recipient: summary.recipient,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to prepare checkout');
        }

        const data = (await response.json()) as {
          orderId: string;
          permissionId: string;
          validUntil: string;
        };

        setOrderId(data.orderId);
        setPermissionId(data.permissionId);
        setValidUntil(data.validUntil);
        toast.success('Base wallet connected');
        setStep('configure');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to prepare checkout';
        toast.error(message);
        setStep('connect');
      }
    });
  };

  const handleAutoSpend = async () => {
    await runWithProcessing('configure', async () => {
      try {
        await requestAutoSpend();
        toast.success('Auto spend ready');
        setStep('invoice');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Auto spend request failed';
        toast.error(message);
      }
    });
  };

  const handlePayInvoice = async () => {
    await runWithProcessing('invoice', async () => {
      try {
        await payInvoice();
        await refreshBalance();
        toast.success('Payment submitted', {
          description: 'Order will be added to your account shortly.',
        });
        clearCart();
        setStep('complete');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Invoice payment failed';
        toast.error(message);
      }
    });
  };

  if (!summary || lines.length === 0) {
    return (
      <div className="glass-card p-10 text-center text-white/70">
        Your cart is empty. Continue exploring the collection.
      </div>
    );
  }

  return (
    <div className="glass-card flex flex-col gap-8 p-8">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Checkout with Base</h2>
        <p className="text-sm text-white/70">
          Connect your Base wallet, configure auto spend, and settle the invoice powering this order.
        </p>
      </div>

      <div className="grid gap-4 text-sm text-white/70 md:grid-cols-2">
        <div className="space-y-2 rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Order totals</p>
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-white">{cartTotals?.subtotal}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Estimated tax</span>
            <span className="font-semibold text-white/80">{cartTotals?.tax}</span>
          </div>
          <div className="flex items-center justify-between text-base font-semibold text-white">
            <span>Total</span>
            <span>{cartTotals?.total}</span>
          </div>
          <p className="text-xs text-white/60">~{cartTotals?.totalEstimate} ETH with a 5% buffer to cover gas.</p>
          <p className="text-xs text-white/60">Buffer authorization: {cartTotals?.buffer}</p>
        </div>
        <div className="space-y-2 rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Wallet state</p>
          <div className="space-y-1 text-xs">
            <p>
              Connected wallet:{' '}
              <span className="font-semibold text-white">
                {universalAddress ? truncateAddress(universalAddress) : 'Not connected'}
              </span>
            </p>
            <p>
              Funding account:{' '}
              <span className="font-semibold text-white">
                {fundingAddress ? truncateAddress(fundingAddress) : 'Awaiting deposit'}
              </span>
            </p>
            <p>
              Sub account:{' '}
              <span className="font-semibold text-white">
                {subAccount?.address ? truncateAddress(subAccount.address) : 'Needs provisioning'}
              </span>
            </p>
            {permissionId && <p className="text-white/60">Auto spend permission: {permissionId}</p>}
            {validUntil && <p className="text-white/60">Valid until: {new Date(validUntil).toLocaleString()}</p>}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Step 1</p>
            <h3 className="text-sm font-semibold text-white">Connect Base wallet</h3>
            <p className="mt-1 text-xs text-white/60">
              We will reuse your universal account as the funding wallet for deposits and spend permissions.
            </p>
          </div>
          <Button
            onClick={handlePrepare}
            disabled={processing !== null || step !== 'connect'}
            className="w-full rounded-full"
          >
            {processing === 'connect' ? 'Connecting…' : step === 'configure' ? 'Connected' : 'Connect wallet'}
          </Button>
        </div>
        <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Step 2</p>
            <h3 className="text-sm font-semibold text-white">Authorize auto spend</h3>
            <p className="mt-1 text-xs text-white/60">
              Grant a daily spend limit so invoices can settle without additional prompts.
            </p>
          </div>
          <Button
            onClick={handleAutoSpend}
            disabled={processing !== null || step !== 'configure'}
            className="w-full rounded-full"
          >
            {autoSpendEnabled || step === 'invoice'
              ? 'Auto spend ready'
              : processing === 'configure'
                ? 'Requesting…'
                : 'Request auto spend'}
          </Button>
        </div>
        <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Step 3</p>
            <h3 className="text-sm font-semibold text-white">Pay Base invoice</h3>
            <p className="mt-1 text-xs text-white/60">Use your funding wallet balance to settle the $0.10 invoice.</p>
          </div>
          <Button
            onClick={handlePayInvoice}
            disabled={processing !== null || step !== 'invoice'}
            className="w-full rounded-full"
          >
            {processing === 'invoice' ? 'Paying…' : 'Pay invoice'}
          </Button>
        </div>
      </div>

      {step === 'complete' && (
        <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-6 text-sm text-emerald-100">
          <p className="font-semibold text-white">Order confirmed</p>
          {orderId && <p className="mt-2 text-emerald-50">Order ID: {orderId}</p>}
          <p className="mt-3 text-emerald-50">
            Your Base invoice is settled. Orders will appear in your account shortly.
          </p>
        </div>
      )}
    </div>
  );
}
