import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(cents / 100);
}

export function formatTokenEstimate(cents: number, tokenPriceUsd: number): string {
  const tokens = cents / 100 / tokenPriceUsd;
  return tokens.toFixed(6);
}

export function calculateCartTotals(lines: Array<{ priceCents: number; quantity: number }>) {
  const subtotalCents = lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);
  const taxRate = 0.0825;
  const taxCents = Math.round(subtotalCents * taxRate);
  const totalCents = subtotalCents + taxCents;
  return { subtotalCents, taxCents, totalCents };
}

export function bufferAmount(cents: number, bufferPercentage = 0.05) {
  return Math.round(cents * (1 + bufferPercentage));
}

export function truncateAddress(address?: string | null, lead = 4, tail = 4): string {
  if (!address) return '';
  if (address.length <= lead + tail + 2) {
    return address;
  }
  return `${address.slice(0, lead + 2)}…${address.slice(-tail)}`;
}
