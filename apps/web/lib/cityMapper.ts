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

// Dev-time check for missing mappings
if (process.env.NODE_ENV === 'development') {
    SUPPORTED_CITIES.forEach(city => {
        if (!CITY_DISPLAY_MAP[city]) {
            console.warn(`[cityMapper] Missing display mapping for supported city: ${city}`);
        }
    });
}

export function getCityDisplayName(citySlug: string, locale: string = 'ko'): string {
    const entry = CITY_DISPLAY_MAP[citySlug.toLowerCase()];
    if (!entry) return citySlug;
    return locale === 'en' ? entry.en : entry.ko;
}
