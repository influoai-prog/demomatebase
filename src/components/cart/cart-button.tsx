'use client';

import { useEffect, useMemo, useState } from 'react';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from './cart-provider';
import { calculateCartTotals, formatCurrency, truncateAddress } from '@/lib/utils';
import { useBaseAccount } from '@/components/wallet/base-account-provider';
import { toast } from 'sonner';

export function CartButton() {
  const { items, itemCount, totalCents, removeItem, clear, isOpen, setOpen, openCart } = useCart();
  const {
    subAccount,
    universalAddress,
    connect,
    ensureSubAccount,
    payInvoice,
    autoSpendEnabled,
    isConnecting,
    error,
  } = useBaseAccount();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isPayingInvoice, setIsPayingInvoice] = useState(false);
  const [invoicePaid, setInvoicePaid] = useState(false);

  const totals = useMemo(() => calculateCartTotals(items), [items]);
  const invoiceCents = 10;

  useEffect(() => {
    if (!isOpen) {
      setInvoicePaid(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!items.length) {
      setInvoicePaid(false);
    }
  }, [items.length]);

  const handlePayInvoice = async () => {
    if (!items.length) {
      toast.error('Add an item to the cart before paying the invoice.');
      return;
    }
    setIsPayingInvoice(true);
    try {
      if (!universalAddress) {
        await connect();
      }
      const ensured = await ensureSubAccount();
      if (!ensured) {
        throw new Error('Unable to provision Base sub account');
      }
      await payInvoice();
      setInvoicePaid(true);
      toast.success('Base invoice settled. You can finish checkout now.');
    } catch (invoiceError) {
      const fallback = invoiceError instanceof Error ? invoiceError.message : 'Invoice payment failed';
      toast.error(fallback);
      setInvoicePaid(false);
    } finally {
      setIsPayingInvoice(false);
    }
  };

  const handleCheckout = async () => {
    if (!items.length) {
      toast.error('Add an item to the cart before checking out.');
      return;
    }
    if (!invoicePaid) {
      toast.error('Pay the $0.10 Base invoice before completing checkout.');
      return;
    }
    setIsCheckingOut(true);
    try {
      if (!universalAddress) {
        await connect();
      }
      const ensured = await ensureSubAccount();
      if (!ensured) {
        throw new Error('Unable to provision Base sub account');
      }
      toast.success(`Order confirmed through ${truncateAddress(ensured.address)}`);
      clear();
      setOpen(false);
      setInvoicePaid(false);
    } catch (checkoutError) {
      const fallback = checkoutError instanceof Error ? checkoutError.message : 'Checkout failed';
      toast.error(fallback);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="lg"
          className="group gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80 hover:border-white/40 hover:bg-white/10 hover:text-white"
          onClick={() => {
            if (!isOpen) {
              openCart();
            }
          }}
        >
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white">
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-sky-500 px-1 text-[11px] font-semibold text-white">
                {itemCount}
              </span>
            )}
          </span>
          <span className="text-left">
            <span className="block text-[11px] uppercase tracking-[0.3em] text-white/50">Cart</span>
            <span className="block text-sm font-semibold text-white">{formatCurrency(totalCents)}</span>
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <div className="mt-10 flex flex-1 flex-col gap-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Your Cart</h2>
            <p className="text-sm text-white/60">Curate a handful of micro-gifts before checking out on Base.</p>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {items.length === 0 ? (
              <p className="text-sm text-white/50">Your shelf is empty. Browse the collection to add something luminous.</p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-white/80"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-white/50">
                      {item.quantity} × {formatCurrency(item.priceCents)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-white">{formatCurrency(item.priceCents * item.quantity)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="border border-white/10 bg-white/5 text-white/60 hover:border-red-400/40 hover:bg-red-500/20 hover:text-red-100"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove {item.title}</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(totals.subtotalCents)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Estimated tax</span>
              <span>{formatCurrency(totals.taxCents)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold text-white">
              <span>Total</span>
              <span>{formatCurrency(totals.totalCents)}</span>
            </div>
            <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/50">
                <span>Base invoice</span>
                <span className="font-semibold text-white">{formatCurrency(invoiceCents)}</span>
              </div>
              <p className="text-xs text-white/60">
                A $0.10 authorization keeps your sub account active and enables auto spend so you can skip future approvals.
              </p>
              <Button
                size="sm"
                className="w-full rounded-full border border-sky-400/30 bg-sky-500/20 text-[0.78rem] font-semibold uppercase tracking-[0.28em] text-white hover:bg-sky-500/30"
                onClick={handlePayInvoice}
                disabled={isPayingInvoice || isConnecting}
              >
                {isPayingInvoice || isConnecting ? 'Processing…' : invoicePaid ? 'Invoice Paid' : 'Pay $0.10 Invoice'}
              </Button>
            </div>
            {autoSpendEnabled && subAccount && (
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-xs text-emerald-100">
                Auto spend ready on <span className="font-semibold">{truncateAddress(subAccount.address)}</span>.
              </div>
            )}
            {error && (
              <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-xs text-red-100">{error}</div>
            )}
            <Button
              size="lg"
              className="w-full rounded-full border border-sky-400/40 bg-sky-500/20 text-[0.84rem] font-semibold uppercase tracking-[0.26em] text-white hover:bg-sky-500/30"
              onClick={handleCheckout}
              disabled={isCheckingOut || isConnecting || !invoicePaid}
            >
              {isCheckingOut || isConnecting ? 'Finalizing…' : 'Complete Checkout'}
            </Button>
            <Button
              variant="ghost"
              className="w-full text-xs uppercase tracking-[0.3em] text-white/50 hover:text-white"
              onClick={() => {
                clear();
                setInvoicePaid(false);
              }}
              disabled={!items.length}
            >
              Clear Cart
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
