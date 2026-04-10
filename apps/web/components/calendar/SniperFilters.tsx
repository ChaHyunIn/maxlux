'use client'
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCalendarStore } from '@/stores/calendarStore';

export function SniperFilters() {
    const { sniperMode, setSniperMode } = useCalendarStore();
    const t = useTranslations('calendar');

    const handleToggle = (mode: 'fri_sat' | 'holiday_low' | 'cheapest_sat') => {
        setSniperMode(sniperMode === mode ? 'none' : mode);
    };

    const chips = [
        { id: 'fri_sat', label: t('friSatOnly') },
        { id: 'cheapest_sat', label: t('cheapestSat') },
        { id: 'holiday_low', label: t('holidayLow') }
    ] as const;

    return (
        <div className="flex flex-wrap gap-2">
            {chips.map(chip => {
                const isActive = sniperMode === chip.id;
                return (
                    <Badge
                        key={chip.id}
                        variant="outline"
                        onClick={() => handleToggle(chip.id)}
                        className={cn(
                            "cursor-pointer px-3 py-1.5 rounded-full transition-colors font-medium border border-slate-200",
                            isActive ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-white text-slate-600 hover:bg-slate-100"
                        )}
                    >
                        {chip.label}
                    </Badge>
                );
            })}
        </div>
    );
}
