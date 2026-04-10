/**
 * Centralized brand name display mapping for localization.
 * Handles translation of raw database strings (e.g., Hanja/Chinese) to display names.
 * NOTE: For large-scale multi-language support, consider migrating this to a translation hook/utility.
 */

export const BRAND_DISPLAY_MAP: Record<string, BrandKey> = {
    // Four Seasons
    '四季': 'four_seasons',
    '四季酒店': 'four_seasons',

    // LHW
    '立鼎世': 'lhw',
    '立鼎世酒店集团': 'lhw',

    // Marriott
    '万豪': 'marriott',
    'JW万豪': 'jw_marriott',

    // Other common ones
    '半岛': 'peninsula',
    '瑰丽': 'rosewood',
    '费尔蒙': 'fairmont',
    '蒙德里安': 'mondrian',
    '몬드리안': 'mondrian',
    '柏悦': 'park_hyatt',
    '파크 하얏트': 'park_hyatt',
    '파크하얏트': 'park_hyatt',
    '朝鲜皇宫': 'josun_palace',
    '조선 팰리스': 'josun_palace',
    '조선팰리스': 'josun_palace',
    '洲际': 'intercontinental',
    '인터컨티넨탈': 'intercontinental',
    '新罗': 'shilla',
    '신라호텔': 'shilla',
    '신라': 'shilla',
    '君悦': 'grand_hyatt',
    '그랜드 하얏트': 'grand_hyatt',
    '그랜드하얏트': 'grand_hyatt',
    '康莱德': 'conrad',
    '콘래드': 'conrad',
    '索菲特': 'sofitel',
    '소피텔': 'sofitel',
    '安达仕': 'andaz',
    '안다즈': 'andaz',
    'JW 메리어트': 'jw_marriott',
    '메리어트': 'marriott',
    '노보텔': 'novotel',
    '보코': 'voco',
    '엠갤러리': 'mgallery',
    '웨스틴': 'westin',
    '럭셔리 컬렉션': 'luxury_collection',
    'The Luxury Collection': 'luxury_collection',
    'SLH (스몰 럭셔리 전통 호텔)': 'slh',
    'SLH (스몰 럭셔리 호텔)': 'slh',
    'SLH': 'slh',
    '기타': 'others',
};

/**
 * Returns the translation key for a given brand name (from DB).
 * Usage: t(`brand.${getBrandKey(brand)}`)
 */
import type { BrandKey } from './i18nTypes'

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

    // 3. Partial match for common prefixes
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
