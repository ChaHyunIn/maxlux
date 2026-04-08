import type { DailyRate } from '@/lib/types';
import { DayCell } from './DayCell';
import { format, parseISO, getDaysInMonth, getDay, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';

interface MonthGridProps {
    monthStart: string; // ISO string or 'yyyy-MM-dd' of the start of the month
    rates: DailyRate[];
    p25: number;
    p75: number;
}

export function MonthGrid({ monthStart, rates, p25, p75 }: MonthGridProps) {
    const startDate = parseISO(monthStart);
    const monthName = format(startDate, 'yyyy년 M월', { locale: ko });

    const daysInMonth = getDaysInMonth(startDate);
    const startDayOfWeek = getDay(startDate); // 0=Sun

    // Map rates by date string for O(1) lookup
    const rateMap = new Map<string, DailyRate>();
    rates.forEach(r => rateMap.set(r.stay_date, r));

    // Pad empty cells for the start of the month
    const cells = Array.from({ length: startDayOfWeek }).map((_, i) => (
        <div key={`empty-${i}`} className="min-h-[60px] p-2 bg-transparent" />
    ));

    // Generate days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = addDays(startDate, day - 1);
        const dateStr = format(date, 'yyyy-MM-dd');
        const rate = rateMap.get(dateStr) || null;

        cells.push(
            <DayCell
                key={dateStr}
                date={date}
                rate={rate}
                p25={p25}
                p75={p75}
            />
        );
    }

    return (
        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden flex flex-col h-full bg-white">
            <div className="bg-muted/40 p-4 border-b text-center font-bold text-lg text-primary">
                {monthName}
            </div>
            <div className="p-3 sm:p-5 grid grid-cols-7 gap-1 sm:gap-2 flex-1 content-start">
                {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-muted-foreground mb-2">
                        {day}
                    </div>
                ))}
                {cells}
            </div>
        </div>
    );
}
