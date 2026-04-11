import { useTranslations, useLocale } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getBenefitKey } from '@/lib/benefitMapper';
import { BENEFIT_COLORS } from '@/lib/constants';
import { getLocalizedText } from '@/lib/translator';
import { formatPrice } from '@/lib/utils';
import type { RoomRate } from '@/lib/types';

interface RoomRateListProps {
    roomRatesLoading: boolean;
    roomRates: RoomRate[];
    t: ReturnType<typeof useTranslations>;
    tTerm: ReturnType<typeof useTranslations>;
    currency: 'KRW' | 'USD';
    exchangeRate?: number;
}

export function RoomRateList({ roomRatesLoading, roomRates, t, tTerm, currency, exchangeRate }: RoomRateListProps) {
    const tBenefits = useTranslations('benefits');
    const locale = useLocale();
    
    return (
        <div className="border rounded-xl overflow-hidden mt-4">
            <div className="bg-slate-50 px-4 py-2.5 border-b flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-700">{t('roomRates')}</h3>
            </div>
            <div className="divide-y relative pb-2 bg-white max-h-[300px] overflow-y-auto w-full">
                {roomRatesLoading ? (
                    <div className="p-4 space-y-3">
                        <Skeleton className="h-6 w-1/2 mb-2" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : roomRates.length === 0 ? (
                    <div className="px-4 py-8 text-sm text-slate-400 text-center">
                        {t('noRoomData')}
                    </div>
                ) : (
                    Array.from(new Set(roomRates.map(r => getLocalizedText(r.room_name_en, r.room_name, tTerm, locale)))).map(roomName => {
                        const ratesForRoom = roomRates.filter(r => getLocalizedText(r.room_name_en, r.room_name, tTerm, locale) === roomName);
                        return (
                            <div key={roomName} className="pb-3 border-b border-slate-100 last:border-b-0 w-full overflow-hidden">
                                <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 sticky top-0 z-10 w-full truncate">
                                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0" />
                                        <span className="truncate">{roomName}</span>
                                    </h4>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {ratesForRoom.map((rate, idx) => {
                                        const tagStrings = rate.benefit_tags || [];
                                        return (
                                            <div key={`rate-${rate.id || idx}`} className="px-4 py-2.5 hover:bg-slate-50/50 transition-colors flex justify-between items-start gap-3">
                                                <div className="flex-1 min-w-0 flex flex-col gap-1.5 pt-0.5">
                                                    <div className="text-[13px] font-medium text-slate-700 leading-tight">
                                                        {getLocalizedText(rate.rate_name_en, rate.rate_name, tTerm, locale)}
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 border-none ${rate.is_refundable ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-500'}`}>
                                                            {rate.is_refundable ? t('cancelable') : t('nonCancelable')}
                                                        </Badge>
                                                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 border-none ${rate.has_breakfast ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                                                            {rate.has_breakfast ? t('breakfastIncluded') : t('breakfastNotIncluded')}
                                                        </Badge>
                                                        {tagStrings.map((tag, tIdx) => {
                                                            const bKey = getBenefitKey(tag);
                                                            if (!bKey) return null;
                                                            return (
                                                                <Badge key={tIdx} variant="outline" className={`text-[9px] px-1.5 py-0 border-none ${BENEFIT_COLORS[bKey] || 'bg-slate-50 text-slate-600'}`}>
                                                                    {tBenefits(bKey)}
                                                                </Badge>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="text-right whitespace-nowrap pt-0.5 shrink-0">
                                                    <div className="font-bold text-slate-800 text-[14px]">
                                                        {formatPrice(rate.price_krw, currency, exchangeRate)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
