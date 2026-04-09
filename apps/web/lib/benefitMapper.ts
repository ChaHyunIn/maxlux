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
};

/**
 * Returns the translation key for a benefit.
 * Usage: t(`benefits.${getBenefitKey(benefit)}`)
 */
export function getBenefitKey(benefit: string | null | undefined): BenefitKey | null {
    if (!benefit) return null;
    
    // Check direct mapping
    if (benefit in BENEFIT_MAP) return BENEFIT_MAP[benefit];
    
    // Fallback search
    for (const [key, value] of Object.entries(BENEFIT_MAP)) {
        if (benefit.toUpperCase().includes(key)) {
            return value as BenefitKey;
        }
    }
    
    return 'free';
}
