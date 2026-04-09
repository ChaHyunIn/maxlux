import type { Hotel } from './types';

/**
 * Standardizes hotel name selection based on current locale.
 * Prioritizes name_en for 'en' locale, otherwise uses name_ko.
 */
export function getHotelName(hotel: Pick<Hotel, 'name_ko' | 'name_en'>, locale: string): string {
    return locale === 'en' ? hotel.name_en : hotel.name_ko;
}
