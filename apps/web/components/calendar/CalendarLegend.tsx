import { PRICE_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function CalendarLegend() {
    return (
        <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-full border shadow-sm text-sm">
            <div className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded-sm border", PRICE_COLORS.low.bg)}></div>
                <span className="text-muted-foreground mr-2">저렴 (<span className="text-[10px]">{PRICE_COLORS.low.icon}</span>)</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded-sm border", PRICE_COLORS.mid.bg)}></div>
                <span className="text-muted-foreground mr-2">보통 (<span className="text-[10px]">{PRICE_COLORS.mid.icon}</span>)</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded-sm border", PRICE_COLORS.high.bg)}></div>
                <span className="text-muted-foreground">비쌈 (<span className="text-[10px]">{PRICE_COLORS.high.icon}</span>)</span>
            </div>
        </div>
    );
}
