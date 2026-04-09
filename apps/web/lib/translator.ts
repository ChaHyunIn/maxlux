export const CHINESE_TO_KEY: Record<string, string> = {
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
    t: (key: any) => string,
    isEnglishLocale: boolean
): string {
    const hasChinese = (str: string | null) => str ? /[\u4e00-\u9fa5]/.test(str) : false;

    // Valid English name available
    if (en && !hasChinese(en)) {
        return en;
    }

    // Only Chinese is left. Translate it using next-intl keys.
    const textToTranslate = local || en || '';
    if (!textToTranslate) return '';

    let result = textToTranslate;
    Object.entries(CHINESE_TO_KEY).forEach(([cnText, key]) => {
        // If the Chinese text exists in our string, replace it
        if (result.includes(cnText)) {
            let replacement = '';
            try {
                // @ts-ignore
                replacement = t(key);
                if (isEnglishLocale) replacement += ' ';
            } catch {
                replacement = cnText; // fallback
            }
            result = result.split(cnText).join(replacement);
        }
    });

    return result.replace(/\s+/g, ' ').trim();
}
