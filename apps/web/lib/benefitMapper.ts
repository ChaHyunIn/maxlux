import mappings from './data/mappings.json';
import type { BenefitKey } from './i18nTypes';

/**
 * Maps database benefit strings to normalized translation keys.
 * Data is centralized in mappings.json to keep this logic file clean of hardcoded literals.
 */
const BENEFIT_MAP: Record<string, BenefitKey> = mappings.benefits as Record<string, BenefitKey>;

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
