import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { LOCALE_DEFAULTS, TIME_MS } from "./constants"
import type { useTranslations } from 'next-intl';

/** utility for tailwind class merging */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(
  price_krw: number | undefined | null, 
  currency: 'KRW' | 'USD' = 'KRW', 
  exchangeRate?: number
): string {
  if (price_krw === undefined || price_krw === null) return '';
  if (currency === 'USD') {
    const rate = exchangeRate || LOCALE_DEFAULTS.exchangeRateUsd;
    return `$${Math.round(price_krw / rate).toLocaleString()}`;
  }
  return `₩${Math.round(price_krw).toLocaleString()}`;
}

export function getPriceLevel(price: number, p25: number, p75: number): 'low' | 'mid' | 'high' {
  if (p25 === p75) return 'mid'; // p25와 p75가 같을 경우(데이터 부족 등) 기본 mid 반환
  if (price <= p25) return 'low';
  if (price >= p75) return 'high';
  return 'mid';
}

export function getRelativeTime(scraped_at: string | null | undefined, t: ReturnType<typeof useTranslations>): string {
  if (!scraped_at) return t('unknown');
  const now = new Date();
  const scraped = new Date(scraped_at);
  const diffMs = now.getTime() - scraped.getTime();
  const diffMin = Math.floor(diffMs / TIME_MS.MINUTE);
  const diffHour = Math.floor(diffMs / TIME_MS.HOUR);
  const diffDay = Math.floor(diffMs / TIME_MS.DAY);

  if (diffMin < 1) return t('justNow');
  if (diffMin < 60) return t('minutesAgo', { count: diffMin });
  if (diffHour < 24) return t('hoursAgo', { count: diffHour });
  return t('daysAgo', { count: diffDay });
}

export function formatAbsoluteTime(dateString: string, locale: string, t: ReturnType<typeof useTranslations>): string {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  // We can use a format string from i18n if we want specific order
  const datePart = t('monthDayFormat', { month, day });
  return `${datePart} ${hours}:${minutes}`;
}
