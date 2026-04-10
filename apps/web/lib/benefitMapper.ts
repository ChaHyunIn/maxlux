import type { BenefitKey } from './i18nTypes'

/**
 * Maps database benefit strings to translation keys.
 */
export const BENEFIT_MAP: Record<string, BenefitKey> = {
    'VIP': 'exclusive',
    'EXCLUSIVE': 'exclusive',
    '럭셔리': 'exclusive',
    'AMEX FHR': 'amex_fhr',
    'FHR': 'amex_fhr',
    '포시즌베네핏': 'fs_benefit',
    'FS': 'fs_benefit',
    '무료': 'free',
    '100USD': 'credit',
    '100美元': 'credit',
    '크레딧': 'credit',
    'UPGRADE': 'upgrade',
    '升级': 'upgrade',
    '升級': 'upgrade',
    '업그레이드': 'upgrade',
    'EARLY': 'earlyCheckin',
    '提前入住': 'earlyCheckin',
    '早到': 'earlyCheckin',
    '얼리체크인': 'earlyCheckin',
    'LATE': 'lateCheckout',
    '延迟退房': 'lateCheckout',
    '延退': 'lateCheckout',
    '레이트체크아웃': 'lateCheckout',
    '会员礼遇': 'exclusive',
};

/**
 * Returns the translation key for a benefit.
 * Usage: t(`benefits.${getBenefitKey(benefit)}`)
 */
export function getBenefitKey(benefit: string | null | undefined): BenefitKey | null {
    if (!benefit) return null;

    // Systematic Guardrail: If it contains Chinese characters and is NOT in our map, block it.
    const hasChinese = /[\u4e00-\u9fa5]/.test(benefit);

    // Check direct mapping
    if (benefit in BENEFIT_MAP) {
        const mapped = BENEFIT_MAP[benefit];
        if (mapped) return mapped;
    }

    // Fallback search
    for (const [key, value] of Object.entries(BENEFIT_MAP)) {
        if (benefit.toUpperCase().includes(key.toUpperCase())) {
            return value;
        }
    }

    // If it contains Chinese and we reached here, it's unmapped -> block it to ensure Chinese-free UI
    if (hasChinese) {
        return null;
    }

    return null;
}
