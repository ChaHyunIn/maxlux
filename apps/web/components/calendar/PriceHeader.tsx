import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp, Minus, Tag } from 'lucide-react';
import { formatPrice, formatAbsoluteTime, getRelativeTime } from '@/lib/utils';
import type { DailyRate } from '@/lib/types';

interface PriceHeaderProps {
    rate: DailyRate;
    refundableRate?: DailyRate | null;
    t: any;
    currency: 'KRW' | 'USD';
    style: { bg: string; text: string };
    level: string;
    locale: string;
}

export function PriceHeader({ rate, refundableRate, t, currency, style, level, locale }: PriceHeaderProps) {
    return (
        <>
            <div className="space-y-2 mb-4 w-full">
                <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-slate-500 whitespace-nowrap mr-2">{t('nonRefundable')}</span>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                        <div className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-sm font-semibold truncate ${style.bg} ${style.text}`}>
                            {rate.is_sold_out ? t('soldOut') : formatPrice(rate.price_krw, currency)}
                        </div>
                        <Badge variant="outline" className="gap-1 truncate max-w-[100px] sm:max-w-none">
                            <Tag className="w-3 h-3 shrink-0" />
                            <span className="truncate">{t(`tag${rate.tag}` as any) || rate.tag}</span>
                        </Badge>
                        {!rate.is_sold_out && (
                            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 whitespace-nowrap">
                                {level === 'low' && <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />}
                                {level === 'mid' && <Minus className="w-3.5 h-3.5 text-slate-400" />}
                                {level === 'high' && <TrendingUp className="w-3.5 h-3.5 text-red-600" />}
                                {level === 'low' ? t('levelLow') : level === 'high' ? t('levelHigh') : t('levelMid')}
                            </div>
                        )}
                    </div>
                </div>
                {!rate.is_sold_out && (
                    <div className="flex sm:hidden items-center justify-end gap-1 text-[11px] text-slate-500 w-full mt-1">
                        {level === 'low' && <TrendingDown className="w-3. h-3 text-emerald-600" />}
                        {level === 'mid' && <Minus className="w-3 h-3 text-slate-400" />}
                        {level === 'high' && <TrendingUp className="w-3 h-3 text-red-600" />}
                        {level === 'low' ? t('levelLow') : level === 'high' ? t('levelHigh') : t('levelMid')}
                    </div>
                )}
                {refundableRate && !refundableRate.is_sold_out && (
                    <div className="flex flex-wrap items-center justify-between w-full mt-2">
                        <span className="text-xs text-slate-500">{t('refundable')}</span>
                        <div className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-50 text-blue-800">
                            {formatPrice(refundableRate.price_krw, currency)}
                        </div>
                    </div>
                )}
            </div>

            {rate.scraped_at && (
                <p className="text-[11px] text-slate-400 mb-4 -mt-2">
                    {t('scrapedAt', {
                        absoluteTime: formatAbsoluteTime(rate.scraped_at, locale),
                        relativeTime: getRelativeTime(rate.scraped_at, locale)
                    })}
                </p>
            )}
        </>
    );
}
