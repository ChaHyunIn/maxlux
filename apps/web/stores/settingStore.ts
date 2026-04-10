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
        }
    )
);
