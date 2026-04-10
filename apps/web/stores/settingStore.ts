import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/lib/constants';

interface SettingState {
    currency: 'KRW' | 'USD';
    setCurrency: (currency: 'KRW' | 'USD') => void;
}

export const useSettingStore = create<SettingState>()(
    persist(
        (set) => ({
            currency: 'KRW',
            setCurrency: (currency) => set({ currency }),
        }),
        {
            name: STORAGE_KEYS.SETTINGS,
            version: 1,
            migrate: (persistedState: unknown, _version: number) => {
                // v0 → v1: 이전 키 'maxlux-settings'에서 마이그레이션
                if (typeof window !== 'undefined') {
                    // eslint-disable-next-line no-restricted-syntax
                    const oldData = localStorage.getItem(STORAGE_KEYS.LEGACY_SETTINGS);
                    if (oldData) {
                        // eslint-disable-next-line no-restricted-syntax
                        localStorage.removeItem(STORAGE_KEYS.LEGACY_SETTINGS);
                    }
                }
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                return persistedState as SettingState;
            },
        }
    )
);
