/**
 * City mappings from DB strings to translation keys.
 */
export const CITY_MAP: Record<string, CityKey> = {
    '首尔': 'seoul',
    'SEOUL': 'seoul',
    'seoul': 'seoul',
    '부산': 'busan',
    '釜山': 'busan',
    'BUSAN': 'busan',
    'busan': 'busan',
    '제주': 'jeju',
    'JEJU': 'jeju',
    'jeju': 'jeju',
};

/**
 * Returns the translation key for a given city string.
 * Usage: t(`city.${getCityKey(city)}`)
 */
import type { CityKey } from './i18nTypes'

export function getCityKey(city: string | null | undefined): CityKey | null {
    if (!city) return null;
    return CITY_MAP[city] || CITY_MAP[city.toLowerCase()] || null;
}
