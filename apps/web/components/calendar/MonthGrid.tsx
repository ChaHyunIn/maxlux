import type { DailyRate } from '@/lib/types';
import { DayCell } from './DayCell';
import { getDaysInMonth, startOfMonth, getDay } from 'date-fns';

export function MonthGrid({ year, month, rates, p25, p75 }: { year: number, month: number, rates: DailyRate[], p25: number, p75: number }) {
    const header = `${year}년 ${month}월`;
    const daysInMonth = getDaysInMonth(new Date(year, month - 1));
    const startDay = getDay(startOfMonth(new Date(year, month - 1))); // 0=Sun

    // Fill empty cells for padding
    const cells = [];
    for (let i = 0; i < startDay; i++) {
        cells.push(null); // empty padding
    }
    for (let i = 1; i <= daysInMonth; i++) {
        cells.push(new Date(year, month - 1, i));
    }

    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold mb-4 ml-1">{header}</h3>
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
                    <div key={d} className={`text-center text-xs font-medium py-1 ${i === 0 ? 'text-red-500/80' : i === 6 ? 'text-blue-500/80' : 'text-slate-500'}`}>
                        {d}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {cells.map((d, idx) => {
                    if (!d) return <div key={`empty-${idx}`} className="min-h-[60px]" />;

                    const dateStr = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
                    const rate = rates.find(r => r.stay_date === dateStr) || null;

                    return <DayCell key={dateStr} date={d} rate={rate} p25={p25} p75={p75} />;
                })}
            </div>
        </div>
    );
}
