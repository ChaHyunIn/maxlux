import mappings from './data/mappings.json';
import type { BrandKey } from './i18nTypes';

/**
 * Maps raw database strings (e.g., Korean/Chinese keywords) to normalized brand keys.
 * Data is centralized in mappings.json to keep this logic file clean of hardcoded literals.
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const BRAND_DISPLAY_MAP: Record<string, BrandKey> = mappings.brands as Record<string, BrandKey>;

/**
 * Normalizes brand names for UI display and filtering.
 */
export function getBrandKey(brandName: string | null | undefined): BrandKey | null {
    if (!brandName) return null;
    return BRAND_DISPLAY_MAP[brandName] || BRAND_DISPLAY_MAP[brandName.toLowerCase()] || null;
}
