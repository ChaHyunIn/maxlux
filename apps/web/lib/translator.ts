import type { ApiTermKey } from './i18nTypes';

export const CHINESE_TO_KEY: Record<string, ApiTermKey> = {
    '大床': 'kingBed',
    '双床': 'twinBed',
    '单人': 'singleBed',
    '套房': 'suite',
    '标准': 'standard',
    '高级': 'superior',
    '豪华': 'deluxe',
    '行政': 'executive',
    '尊贵': 'premium',
    '总统': 'presidential',
    '海景': 'oceanView',
    '江景': 'riverView',
    '湖景': 'lakeView',
    '山景': 'mountainView',
    '城景': 'cityView',
    '市景': 'cityView',
    '园景': 'gardenView',
    '景观': 'view',
    '无窗': 'noWindow',
    '一居室': 'oneBedroom',
    '两居室': 'twoBedroom',
    '三居室': 'threeBedroom',
    '房': 'room',
    '双早': 'breakfast2',
    '单早': 'breakfast1',
    '无早': 'roomOnly',
    '含早': 'breakfastInc',
    '含': 'included',
    '早餐': 'breakfast',
    '会员专属': 'memberExclusive',
    '会员专享': 'memberExclusive',
    '会员价': 'memberRate',
    '会员': 'member',
    '特惠': 'specialOffer',
    '促销': 'promotion',
    '连住': 'consecutive',
    '提前预订': 'earlyBird',
    '早鸟': 'earlyBird',
    '尊享': 'special',
    '礼遇': 'benefit',
    '免费': 'free',
    '取消': 'cancel',
    '灵活': 'flexible',
    '不可': 'non',
    '预付': 'prepaid'
};

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
