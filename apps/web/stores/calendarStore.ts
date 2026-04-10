import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DailyRate } from '@/lib/types';

export type SniperMode = 'none' | 'fri_sat' | 'cheapest_sat' | 'holiday_low';

interface CalendarState {
    sniperMode: SniperMode;
    setSniperMode: (mode: SniperMode) => void;
    // DayDetail modal state
    selectedRate: DailyRate | null;
    modalOpen: boolean;
    openDayDetail: (rate: DailyRate) => void;
    closeDayDetail: () => void;
    // Hydration
    _hydrated: boolean;
    setHydrated: (h: boolean) => void;
}

export const useCalendarStore = create<CalendarState>()(
    persist(
        (set) => ({
            sniperMode: 'none',
            setSniperMode: (mode) => set({ sniperMode: mode }),
            // DayDetail modal
            selectedRate: null,
            modalOpen: false,
            openDayDetail: (rate) => set({ selectedRate: rate, modalOpen: true }),
            closeDayDetail: () => set({ selectedRate: null, modalOpen: false }),
            // Hydration
            _hydrated: false,
            setHydrated: (h) => set({ _hydrated: h }),
        }),
        {
            name: 'maxlux-calendar-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ sniperMode: state.sniperMode }),
            onRehydrateStorage: () => (state) => {
                state?.setHydrated(true);
            },
        }
    )
);
