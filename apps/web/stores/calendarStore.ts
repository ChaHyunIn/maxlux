import { create } from 'zustand';

interface CalendarState {
    visibleMonthOffset: number; // 0 = current month
    selectedDate: string | null;
    setMonthOffset: (offset: number) => void;
    setSelectedDate: (date: string | null) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
    visibleMonthOffset: 0,
    selectedDate: null,
    setMonthOffset: (offset) => set({ visibleMonthOffset: offset }),
    setSelectedDate: (date) => set({ selectedDate: date }),
}));
