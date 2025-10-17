import { type ClassValue, clsx } from 'clsx';
import { formatUnits } from 'viem';
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

function formatWithPrecision(raw: string, maximumFractionDigits: number) {
  const numeric = Number.parseFloat(raw);
  if (!Number.isFinite(numeric)) {
    return raw;
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(numeric);
}

export function centsToUsdAmount(cents: number): string {
  const isNegative = cents < 0;
  const absolute = Math.abs(cents);
  const whole = Math.floor(absolute / 100);
  const remainder = absolute % 100;
  const value = `${whole}.${remainder.toString().padStart(2, '0')}`;
  return isNegative ? `-${value}` : value;
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

export function formatTokenBalance(value: bigint, decimals: number, maximumFractionDigits = 4): string {
  return formatWithPrecision(formatUnits(value, decimals), maximumFractionDigits);
}
