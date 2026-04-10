import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { LOCALE_DEFAULTS } from "./constants"
import type { useTranslations } from 'next-intl';

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

export function getRelativeTime(scraped_at: string | null | undefined, t: ReturnType<typeof useTranslations>): string {
  if (!scraped_at) return t('unknown');
  const now = new Date();
  const scraped = new Date(scraped_at);
  const diffMs = now.getTime() - scraped.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

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
