'use client'
import { useTranslations } from 'next-intl';
import { PRICE_COLORS, LOCALE_DEFAULTS } from '@/lib/constants';
import { getPriceLevel, cn, formatPrice } from '@/lib/utils';
import { useCalendarStore } from '@/stores/calendarStore';
import { useSettingStore } from '@/stores/settingStore';
import type { DailyRate } from '@/lib/types';

export function DayCell({ date, rate, p25, p75 }: { date: Date, rate: DailyRate | null, p25: number, p75: number }) {
    const { sniperMode, openDayDetail } = useCalendarStore();
    const { currency } = useSettingStore();
    const t = useTranslations('calendar');

    const day = date.getDate();
    const dayOfWeek = date.getDay();

    if (!rate) {
        return (
            <div className="min-h-[60px] sm:min-h-[70px] rounded-md p-1 flex flex-col items-center justify-start bg-slate-50 text-slate-300">
                <span className="text-xs font-medium mt-1">{day}</span>
            </div>
        );
    }

    const { price_krw, is_sold_out, tag } = rate;
    const isHoliday = tag === 'HOL';
    const isFriEve = tag === 'FRI_EVE';
    const isSat = dayOfWeek === 6;

    let level: 'low' | 'mid' | 'high' = 'mid';
    let style: { bg: string, text: string, icon: string } = PRICE_COLORS.mid;

    if (is_sold_out) {
        style = PRICE_COLORS.soldOut;
    } else {
        level = getPriceLevel(price_krw, p25, p75);
        if (level === 'low') style = PRICE_COLORS.low;
        if (level === 'high') style = PRICE_COLORS.high;
    }

    let opacityClass = '';
    if (sniperMode !== 'none') {
        if (sniperMode === 'fri_sat' && !isFriEve && !isSat && dayOfWeek !== 5) opacityClass = 'opacity-20';
        if (sniperMode === 'holiday_low' && !isHoliday && !isFriEve) opacityClass = 'opacity-20';
        if (sniperMode === 'cheapest_sat' && !isSat) opacityClass = 'opacity-20';
    }

    const priceText = is_sold_out ? t('soldOut') : (
        currency === 'USD'
            ? (formatPrice(price_krw, 'USD') ?? '')
            : `${Math.round(price_krw / LOCALE_DEFAULTS.priceUnitManDivisor)}${t('priceUnit')}`
    );

    const handleClick = () => {
        openDayDetail(rate);
    };

    return (
        <div
            onClick={handleClick}
            className={cn(
                "min-h-[60px] sm:min-h-[70px] rounded-md p-1.5 flex flex-col items-center justify-between cursor-pointer transition-all hover:ring-2 hover:ring-black/20 hover:scale-[1.02] active:scale-[0.98]",
                style.bg, style.text, opacityClass
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
