import { CheckoutFlow } from '@/components/checkout/checkout-flow';

export default function CheckoutPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">On-chain checkout</h1>
        <p className="text-sm text-white/70">
          Connect your Base account, mint a sub account, authorize auto spend, and submit payment with a single confirmation.
        </p>
      </div>
      <CheckoutFlow />
    </div>
  );
}
