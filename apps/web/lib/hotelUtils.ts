import { isDayDetailKey } from './i18nTypes';
import type { Hotel } from './types';
import type { useTranslations } from 'next-intl';

/**
 * Standardizes hotel name selection based on current locale.
 * Prioritizes name_en for 'en' locale, otherwise uses name_ko.
 */
export function getHotelName(hotel: Pick<Hotel, 'name_ko' | 'name_en'>, locale: string): string {
    return locale === 'en' ? hotel.name_en : hotel.name_ko;
}

/**
 * Translates room type names into localized labels.
 * Handles camelCase conversion, known i18n keys, and Chinese character filtering.
 */
export function getRoomTypeLabel(
    type: string | undefined | null,
    t: ReturnType<typeof useTranslations>
): string {
    if (!type) return '';
    if (type === 'standard') return t('standardRoom');
    
    // Convert under_score to camelCase for i18n key lookup
    const camelKey = type.replace(/_([a-z])/g, (_: string, letter: string) => letter.toUpperCase());

    if (isDayDetailKey(camelKey)) {
        return t(camelKey);
    }
    
    // filter out strings containing Chinese characters (often found in raw scraper data)
    if (/[\u4e00-\u9fa5]/.test(type)) return '';
    
    return type;
}
