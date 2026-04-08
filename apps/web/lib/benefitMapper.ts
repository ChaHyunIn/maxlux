/**
 * Maps raw HotelLux benefit objects/strings to user-friendly Korean text.
 */

interface RawBenefit {
    name?: string;
    type?: string;
    [key: string]: unknown;
}

const BENEFIT_NAME_MAP: Record<string, string> = {
    '会员礼遇': 'HotelLux VIP 특별 혜택',
    'FHR': '아멕스 FHR 혜택 (해당 시)',
};

export function mapBenefitText(benefit: string | RawBenefit): string {
    if (typeof benefit === 'string') {
        return benefit;
    }
    if (benefit?.name) {
        if (BENEFIT_NAME_MAP[benefit.name]) return BENEFIT_NAME_MAP[benefit.name];
        if (benefit?.type === 'luxury') return 'HotelLux VIP 특별 혜택';
        return benefit.name;
    }
    return '독점 제휴 혜택';
}
