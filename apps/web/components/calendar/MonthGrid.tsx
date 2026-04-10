'use client'
import { useMemo } from 'react';
import { getDaysInMonth, startOfMonth, getDay, format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { DayCell } from './DayCell';
import type { DailyRate } from '@/lib/types';

export function MonthGrid({ year, month, rates, p25, p75 }: { year: number, month: number, rates: DailyRate[], p25: number, p75: number }) {
    const t = useTranslations('calendar');
    const rawWeekdays = t.raw('weekdays');
    const weekdays: string[] = Array.isArray(rawWeekdays)
        ? rawWeekdays.filter((d): d is string => typeof d === 'string')
        : [];
    const header = t('monthFormat', { year: String(year), month: String(month) });

    const daysInMonth = getDaysInMonth(new Date(year, month - 1));
    const startDay = getDay(startOfMonth(new Date(year, month - 1)));

    const cells = [];
    for (let i = 0; i < startDay; i++) {
        cells.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        cells.push(new Date(year, month - 1, i));
    }

    const rateMap = useMemo(() => {
        const map = new Map<string, DailyRate>();
        rates.forEach(r => map.set(r.stay_date, r));
        return map;
    }, [rates]);

    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold mb-4 ml-1">{header}</h3>
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                {weekdays.map((d, i) => (
                    <div key={d} className={`text-center text-xs font-medium py-1 ${i === 0 ? 'text-red-500/80' : i === 6 ? 'text-blue-500/80' : 'text-slate-500'}`}>
                        {d}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {cells.map((d, idx) => {
                    if (!d) return <div key={`empty-${idx}`} className="min-h-[60px]" />;
                    const dateStr = format(d, 'yyyy-MM-dd');
                    const rate = rateMap.get(dateStr) || null;
                    return <DayCell key={dateStr} date={d} rate={rate} p25={p25} p75={p75} />;
                })}
            </div>
        </div>
    );
}
