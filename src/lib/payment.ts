import { bufferAmount, calculateCartTotals } from './utils';
import type { CartLine } from './cart-store';
import { getProductById } from './product-service';
import type { Product } from '@/data/products';

const MOCK_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000';
const MOCK_STORE_ADDRESS = '0x5d5b47Fb9137E8ffFD9472A5480C219c2B33Ff22';

type SummaryItem = Product & { quantity: number };

export async function createPaymentSummary(lines: CartLine[]) {
  const enriched = await Promise.all(
    lines.map(async (line) => {
      const product = await getProductById(line.productId);
      if (!product) return null;
      return { ...product, quantity: line.quantity } as SummaryItem;
    }),
  );

  const items = enriched.filter(Boolean) as SummaryItem[];
  const { subtotalCents, taxCents, totalCents } = calculateCartTotals(
    items.map((item) => ({ priceCents: item.priceCents, quantity: item.quantity })),
  );

  const bufferedTotal = bufferAmount(totalCents);

  return {
    items,
    subtotalCents,
    taxCents,
    totalCents,
    bufferedTotal,
    tokenAddress: (process.env.NEXT_PUBLIC_PAYMENT_TOKEN as `0x${string}`) ?? (MOCK_TOKEN_ADDRESS as `0x${string}`),
    recipient: (process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT as `0x${string}`) ?? (MOCK_STORE_ADDRESS as `0x${string}`)
  };
}
