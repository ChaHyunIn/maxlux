import { create } from 'zustand';

type SniperMode = 'none' | 'fri_sat' | 'cheapest_sat' | 'holiday_low';

interface CalendarState {
    sniperMode: SniperMode;
    setSniperMode: (mode: SniperMode) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
    sniperMode: 'none',
    setSniperMode: (mode) => set({ sniperMode: mode }),
}));
