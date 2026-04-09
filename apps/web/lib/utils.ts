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

export function getRelativeTime(scraped_at: string | null | undefined, locale: string = 'ko'): string {
  if (!scraped_at) return locale === 'en' ? 'Unknown' : '알 수 없음';
  const now = new Date();
  const scraped = new Date(scraped_at);
  const diffMs = now.getTime() - scraped.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (locale === 'en') {
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    return `${diffDay}d ago`;
  }
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  return `${diffDay}일 전`;
}
