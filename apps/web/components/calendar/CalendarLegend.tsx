'use client'
import { PRICE_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function CalendarLegend() {
    return (
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded-full", PRICE_COLORS.low.bg)} />
                <span>저렴 (하위25%)</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded-full", PRICE_COLORS.mid.bg)} />
                <span>보통</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded-full", PRICE_COLORS.high.bg)} />
                <span>비쌈 (상위25%)</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded-full", PRICE_COLORS.soldOut.bg)} />
                <span className="line-through text-slate-400">매진</span>
            </div>
        </div>
    );
}
