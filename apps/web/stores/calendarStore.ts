import { create } from 'zustand';
import type { DailyRate } from '@/lib/types';

type SniperMode = 'none' | 'fri_sat' | 'cheapest_sat' | 'holiday_low';

interface CalendarState {
    sniperMode: SniperMode;
    setSniperMode: (mode: SniperMode) => void;
    // DayDetail modal state
    selectedRate: DailyRate | null;
    modalOpen: boolean;
    openDayDetail: (rate: DailyRate) => void;
    closeDayDetail: () => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
    sniperMode: 'none',
    setSniperMode: (mode) => set({ sniperMode: mode }),
    // DayDetail modal
    selectedRate: null,
    modalOpen: false,
    openDayDetail: (rate) => set({ selectedRate: rate, modalOpen: true }),
    closeDayDetail: () => set({ selectedRate: null, modalOpen: false }),
}));
