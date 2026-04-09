 /**
  * Centralized city name display mapping with locale support.
  * Used in HotelHeroHeader.
  * NOTE: Must be kept in sync with SUPPORTED_CITIES in @/lib/constants.
  */
 
 import { SUPPORTED_CITIES } from './constants';
 
 export const CITY_DISPLAY_MAP: Record<string, { ko: string; en: string }> = {
    seoul: { ko: '서울', en: 'Seoul' },
    busan: { ko: '부산', en: 'Busan' },
    jeju: { ko: '제주', en: 'Jeju' },
};

export function getCityDisplayName(citySlug: string, locale: string = 'ko'): string {
    const entry = CITY_DISPLAY_MAP[citySlug.toLowerCase()];
    if (!entry) return citySlug;
    return locale === 'en' ? entry.en : entry.ko;
}
