'use client'
import { Badge } from '@/components/ui/badge';
import { useCalendarStore } from '@/stores/calendarStore';
import { cn } from '@/lib/utils';

export function SniperFilters() {
    const { sniperMode, setSniperMode } = useCalendarStore();

    const handleToggle = (mode: 'fri_sat' | 'holiday_low' | 'cheapest_sat') => {
        setSniperMode(sniperMode === mode ? 'none' : mode);
    };

    const chips = [
        { id: 'fri_sat', label: '금/토만 보기' },
        { id: 'cheapest_sat', label: '가장 싼 토요일' },
        { id: 'holiday_low', label: '연휴 저점 찾기' }
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
