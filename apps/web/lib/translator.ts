import mappings from './data/mappings.json';
import type { ApiTermKey } from './i18nTypes';

/**
 * Maps Chinese keywords found in OTA API responses/OCR to normalized translation keys.
 * Data is centralized in mappings.json to maintain consistency with benefit and brand mappers.
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const CHINESE_TO_KEY: Record<string, ApiTermKey> = mappings.apiTerms as Record<string, ApiTermKey>;

export function getLocalizedText(
    en: string | null,
    local: string | null,
    t: (key: ApiTermKey) => string,
    locale: string
): string {
    const hasChinese = (str: string | null) => str ? /[\u4e00-\u9fa5]/.test(str) : false;
    const isChineseLocale = locale === 'zh';
    const isEnglishLocale = locale === 'en';

    // Valid English name available and no Chinese characters
    if (en && !hasChinese(en)) {
        return en;
    }

    const textToTranslate = local || en || '';
    if (!textToTranslate) return '';

    let result = textToTranslate;
    
    // Sort by length descending to match longer phrases first (e.g., "会员专属" before "会员")
    const sortedEntries = Object.entries(CHINESE_TO_KEY).sort((a, b) => b[0].length - a[0].length);
    
    sortedEntries.forEach(([cnText, key]) => {
        if (result.includes(cnText)) {
            let replacement = '';
            try {
                replacement = t(key);
                if (isEnglishLocale) replacement += ' ';
            } catch {
                // Fallback to English key name (better than Chinese)
                replacement = key.replace(/([A-Z])/g, ' $1').trim();
                replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1);
                if (isEnglishLocale) replacement += ' ';
            }
            result = result.split(cnText).join(replacement);
        }
    });

    // Clean up any remaining Chinese characters for non-Chinese locales
    if (!isChineseLocale) {
        result = result.replace(/[\u4e00-\u9fa5]+/g, '').trim();
    }

    return result.replace(/\s+/g, ' ').trim();
}
