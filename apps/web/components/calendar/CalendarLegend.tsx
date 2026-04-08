'use client'
import { PRICE_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export function CalendarLegend() {
    const t = useTranslations('calendar');

    return (
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded-full", PRICE_COLORS.low.bg)} />
                <span>{t('legendLow')}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded-full", PRICE_COLORS.mid.bg)} />
                <span>{t('legendMid')}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded-full", PRICE_COLORS.high.bg)} />
                <span>{t('legendHigh')}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded-full", PRICE_COLORS.soldOut.bg)} />
                <span className="line-through text-slate-400">{t('legendSoldOut')}</span>
            </div>
        </div>
    );
}
