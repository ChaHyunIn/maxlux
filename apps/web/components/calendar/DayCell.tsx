'use client';

import type { DailyRate } from '@/lib/types';
import { PRICE_COLORS, LOCALE_DEFAULTS } from '@/lib/constants';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSettingStore } from '@/stores/settingStore';

interface DayCellProps {
    date: Date;
    rate: DailyRate | null;
    p25: number;
    p75: number;
}

export function DayCell({ date, rate, p25, p75 }: DayCellProps) {
    const dayNum = format(date, 'd');
    const { currency } = useSettingStore();

    if (!rate) {
        return (
            <div className="flex flex-col items-center justify-center p-1 sm:p-2 border rounded-md min-h-[60px] sm:min-h-[70px] bg-muted/20 text-muted-foreground opacity-50">
                <span className="text-xs sm:text-sm font-medium">{dayNum}</span>
                <span className="text-[10px] sm:text-xs mt-1">정보없음</span>
            </div>
        );
    }

    if (rate.is_sold_out) {
        const style = PRICE_COLORS.soldOut;
        return (
            <div
                className={cn(
                    "flex flex-col items-center justify-center p-1 sm:p-2 rounded-md min-h-[60px] sm:min-h-[70px] cursor-pointer transition-colors border shadow-sm",
                    style.bg,
                    style.text
                )}
            >
                <span className="text-xs sm:text-sm font-medium">{dayNum}</span>
                <div className="flex items-center gap-0.5 mt-1">
                    <span className="text-[10px] sm:text-xs font-bold leading-none">{style.icon} 매진</span>
                </div>
            </div>
        );
    }

    const price = rate.price_krw;
    let style: { bg: string; text: string; icon: string } = PRICE_COLORS.mid;
    if (price <= p25) style = PRICE_COLORS.low;
    else if (price >= p75) style = PRICE_COLORS.high;

    // Currency-aware price formatting
    let displayPrice: string;
    let displaySuffix = '';
    if (currency === 'USD') {
        displayPrice = `$${Math.round(price / LOCALE_DEFAULTS.exchangeRateUsd).toLocaleString()}`;
    } else {
        displayPrice = Math.floor(price / LOCALE_DEFAULTS.priceUnitManDivisor).toString();
        displaySuffix = '만';
    }

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center p-1 sm:p-2 rounded-md min-h-[60px] sm:min-h-[70px] cursor-pointer transition-transform hover:scale-105 hover:shadow-md border shadow-sm",
                style.bg,
                style.text
            )}
        >
            <span className="text-xs sm:text-sm font-medium">{dayNum}</span>
            <div className="flex items-center gap-0.5 mt-1 sm:mt-1.5">
                <span className="text-[10px] sm:text-xs">{style.icon}</span>
                <span className="text-[10px] sm:text-[13px] font-bold leading-none tracking-tighter">
                    {displayPrice}{displaySuffix}
                </span>
            </div>
        </div>
    );
}
