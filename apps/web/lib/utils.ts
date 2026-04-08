import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { LOCALE_DEFAULTS } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price_krw: number | undefined, currency: 'KRW' | 'USD' = 'KRW'): string {
  if (!price_krw) return "가격 미정";
  if (currency === 'USD') {
    return `$${Math.round(price_krw / LOCALE_DEFAULTS.exchangeRateUsd).toLocaleString()}`;
  }
  return `₩${price_krw.toLocaleString()}`;
}
