import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'ko' | 'en';
type Currency = 'KRW' | 'USD';

interface SettingState {
    language: Language;
    currency: Currency;
    setLanguage: (lang: Language) => void;
    setCurrency: (curr: Currency) => void;
}

const DEFAULT_CURRENCY: Record<Language, Currency> = {
    ko: 'KRW',
    en: 'USD',
};

export const useSettingStore = create<SettingState>()(
    persist(
        (set) => ({
            language: 'ko',
            currency: 'KRW',
            setLanguage: (lang) => {
                // Rule: When switching language, always set to that language's default currency.
                // Manual override via setCurrency is always independent.
                set({
                    language: lang,
                    currency: DEFAULT_CURRENCY[lang],
                });
            },
            setCurrency: (curr) => {
                set({ currency: curr });
            },
        }),
        {
            name: 'maxlux-settings',
        }
    )
);
