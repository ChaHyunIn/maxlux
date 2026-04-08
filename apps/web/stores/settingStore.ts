import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Currency = 'KRW' | 'USD';

interface SettingState {
    currency: Currency;
    setCurrency: (curr: Currency) => void;
}

export const useSettingStore = create<SettingState>()(
    persist(
        (set) => ({
            currency: 'KRW',
            setCurrency: (curr) => set({ currency: curr }),
        }),
        { name: 'maxlux-settings' }
    )
);
