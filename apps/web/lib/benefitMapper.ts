/**
 * Maps raw HotelLux benefit objects/strings to user-friendly text with locale support.
 */

interface RawBenefit {
    name?: string;
    type?: string;
    [key: string]: unknown;
}

const BENEFIT_NAME_MAP: Record<string, { ko: string; en: string }> = {
    '会员礼遇': { ko: 'HotelLux VIP 특별 혜택', en: 'HotelLux VIP Exclusive Benefit' },
    'FHR': { ko: '아멕스 FHR 혜택 (해당 시)', en: 'Amex FHR Benefit (where applicable)' },
};

export function mapBenefitText(benefit: string | RawBenefit, locale: string = 'ko'): string {
    if (typeof benefit === 'string') {
        return benefit;
    }
    if (benefit?.name) {
        const mapped = BENEFIT_NAME_MAP[benefit.name];
        if (mapped) return locale === 'en' ? mapped.en : mapped.ko;
        if (benefit?.type === 'luxury') return locale === 'en' ? 'HotelLux VIP Exclusive Benefit' : 'HotelLux VIP 특별 혜택';
        return benefit.name;
    }
    return locale === 'en' ? 'Exclusive Partner Benefit' : '독점 제휴 혜택';
}
