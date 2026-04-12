import mappings from './data/mappings.json';
import type { BrandKey } from './i18nTypes';

/**
 * Maps raw database strings (e.g., Korean/Chinese keywords) to normalized brand keys.
 * Data is centralized in mappings.json to keep this logic file clean of hardcoded literals.
 */
const BRAND_DISPLAY_MAP: Record<string, BrandKey> = mappings.brands as Record<string, BrandKey>;

/**
 * Returns the translation key for a given brand name (from DB).
 * Usage: t(`brand.${getBrandKey(brand)}`)
 */
export function getBrandKey(brand: string | null | undefined): BrandKey | null {
    if (!brand) return null;

    const normalized = brand.trim();

    // 1. Direct match
    if (BRAND_DISPLAY_MAP[normalized]) return BRAND_DISPLAY_MAP[normalized];

    // 2. Case-insensitive match
    const upper = normalized.toUpperCase();
    for (const [key, value] of Object.entries(BRAND_DISPLAY_MAP)) {
        if (key.toUpperCase() === upper) return value;
    }

    // 3. Partial match for common prefixes (English-only hardcoding is acceptable for technical identification)
    if (upper.includes('SLH')) return 'slh';
    if (upper.includes('JW')) return 'jw_marriott';
    if (upper.includes('MARRIOTT') || upper.includes('메리어트')) return 'marriott';
    if (upper.includes('SHILLA') || upper.includes('신라')) return 'shilla';
    if (upper.includes('HYATT') || upper.includes('하얏트')) {
        if (upper.includes('PARK') || upper.includes('파크')) return 'park_hyatt';
        if (upper.includes('GRAND') || upper.includes('그랜드')) return 'grand_hyatt';
        if (upper.includes('ANDAZ') || upper.includes('안다즈')) return 'andaz';
    }

    // Fallback
    return null;
}
