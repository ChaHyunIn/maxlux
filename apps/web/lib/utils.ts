import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { LOCALE_DEFAULTS } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price_krw: number | undefined | null, currency: 'KRW' | 'USD' = 'KRW'): string | null {
  if (price_krw === undefined || price_krw === null) return null;
  if (currency === 'USD') {
    return `$${Math.round(price_krw / LOCALE_DEFAULTS.exchangeRateUsd).toLocaleString()}`;
  }
  return `₩${price_krw.toLocaleString()}`;
}

export function getPriceLevel(price: number, p25: number, p75: number): 'low' | 'mid' | 'high' {
  if (price <= p25) return 'low';
  if (price >= p75) return 'high';
  return 'mid';
}
