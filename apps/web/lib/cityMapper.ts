import mappings from './data/mappings.json';
import type { CityKey } from './i18nTypes';

/**
 * City mappings from raw DB strings to normalized translation keys.
 * Data is centralized in mappings.json to keep this logic file clean of hardcoded literals.
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const CITY_MAP: Record<string, CityKey> = mappings.cities as Record<string, CityKey>;

/**
 * Returns the translation key for a given city string.
 * Usage: t(`cities.${getCityKey(city)}`)
 */
export function getCityKey(city: string | null | undefined): CityKey | null {
    if (!city) return null;
    return CITY_MAP[city] || CITY_MAP[city.toLowerCase()] || null;
}
