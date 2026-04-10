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
    const isFriEve = tag === 'FRI_EVE' || tag === 'HOL_EVE';
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
        // Highlight Fri/Sat if either Fri-Eve/Sat-Eve (tag) or literal Saturday (dayOfWeek)
        // dayOfWeek !== 5: 금요일이 공휴일(HOL)일 때도 금/토 필터에 표시하기 위한 조건
        if (sniperMode === 'fri_sat' && !isFriEve && !isSat && dayOfWeek !== 5) opacityClass = 'opacity-20';
        if (sniperMode === 'holiday_low' && !isHoliday && !isFriEve) opacityClass = 'opacity-20';
        if (sniperMode === 'cheapest_sat' && !isSat) opacityClass = 'opacity-20';
    }

    const priceText = is_sold_out ? t('soldOut') : (
        currency === 'USD'
            ? (formatPrice(price_krw, 'USD') ?? '')
            : `${Math.round(price_krw / LOCALE_DEFAULTS.priceUnitManDivisor)}${t('priceUnit')}`
        // NOTE: 캘린더 셀은 공간이 작으므로 만원 단위 축약 유지.
        // formatPrice()는 전체 원가를 표시하므로 여기서는 의도적으로 별도 포맷 사용.
    );

    const handleClick = () => {
        openDayDetail(rate);
    };

    return (
        <div
            onClick={handleClick}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
            className={cn(
                "min-h-[60px] sm:min-h-[70px] rounded-md p-1.5 flex flex-col items-center justify-between cursor-pointer transition-all hover:ring-2 hover:ring-black/20 hover:scale-[1.02] active:scale-[0.98]",
                style.bg, style.text, opacityClass
            )}
            aria-label={`${day}: ${priceText}`}
            role="button"
            tabIndex={0}
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
