import { getPriceLevel, cn } from '@/lib/utils';
import type { DailyRate } from '@/lib/types';
import { PRICE_COLORS } from '@/lib/constants';
import { useCalendarStore } from '@/stores/calendarStore';

export function DayCell({ date, rate, p25, p75 }: { date: Date, rate: DailyRate | null, p25: number, p75: number }) {
    const { sniperMode } = useCalendarStore();

    const day = date.getDate();
    const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat

    if (!rate) {
        return (
            <div className="min-h-[60px] sm:min-h-[70px] rounded-md p-1 flex flex-col items-center justify-start bg-slate-50 text-slate-300">
                <span className="text-xs font-medium mt-1">{day}</span>
            </div>
        );
    }

    const { price_krw, is_sold_out, tags } = rate;
    const isHoliday = tags && tags.includes('HOL');
    const isFriEve = tags && tags.includes('FRI_EVE');
    const isSat = dayOfWeek === 6;

    let level: 'low' | 'mid' | 'high' = 'mid';
    let style = PRICE_COLORS.mid;

    if (is_sold_out) {
        style = PRICE_COLORS.soldOut;
    } else {
        level = getPriceLevel(price_krw, p25, p75);
        if (level === 'low') style = PRICE_COLORS.low;
        if (level === 'high') style = PRICE_COLORS.high;
    }

    // Sniper Filter Logic
    let opacityClass = '';
    if (sniperMode !== 'none') {
        if (sniperMode === 'fri_sat' && !isFriEve && !isSat && dayOfWeek !== 5) {
            opacityClass = 'opacity-20';
        }
        if (sniperMode === 'holiday_low' && !isHoliday && !isFriEve) {
            opacityClass = 'opacity-20';
        }
        if (sniperMode === 'cheapest_sat' && !isSat) {
            opacityClass = 'opacity-20';
        }
    }

    const priceText = is_sold_out ? '매진' : `${Math.round(price_krw / 10000)}만`;

    return (
        <div
            onClick={() => console.log(rate)}
            className={cn(
                "min-h-[60px] sm:min-h-[70px] rounded-md p-1.5 flex flex-col items-center justify-between cursor-pointer transition-all hover:ring-2 hover:ring-black/10",
                style.bg,
                style.text,
                opacityClass
            )}
        >
            <span className={cn("text-xs font-semibold self-start", dayOfWeek === 0 ? "text-red-700/80" : dayOfWeek === 6 ? "text-blue-700/80" : "")}>
                {day}
            </span>
            <div className="flex flex-col items-center font-bold tracking-tight">
                <span className="text-[11px] sm:text-[13px]">{priceText}</span>
                {!is_sold_out && <span className="text-xs mt-0.5 leading-none">{style.icon}</span>}
            </div>
        </div>
    );
}
