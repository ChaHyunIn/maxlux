import { ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { isOtaKey } from '@/lib/i18nTypes';
import { OTA_DISPLAY } from '@/lib/ota';
import { formatPrice } from '@/lib/utils';

interface PriceEntry {
    source: string;
    price_krw: number;
    url: string | null;
    is_sold_out: boolean;
    refund_policy: string;
}

interface OtaPriceListProps {
    loading: boolean;
    allPrices: PriceEntry[];
    lowestPrice: number;
    currency: 'KRW' | 'USD';
    exchangeRate?: number;
    t: ReturnType<typeof useTranslations>;
}

export function OtaPriceList({ loading, allPrices, lowestPrice, currency, exchangeRate, t }: OtaPriceListProps) {
    const tOta = useTranslations('ota');

    return (
        <div className="border rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b">
                <h3 className="text-sm font-semibold text-slate-700">{t('priceComparison')}</h3>
            </div>
            <div className="divide-y">
                {loading ? (
                    <div className="p-4 space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : (
                    allPrices.map((p, idx) => {
                        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                        const display = OTA_DISPLAY[p.source as keyof typeof OTA_DISPLAY] || { nameKey: p.source, color: 'bg-slate-100 text-slate-700' };
                        const isLowest = !p.is_sold_out && p.price_krw === lowestPrice && p.price_krw > 0;
                        const otaName = isOtaKey(display.nameKey) ? tOta(display.nameKey) : p.source;

                        return (
                            <div key={`${p.source}-${idx}`} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/50 transition-colors">
                                <div className="flex items-center gap-2">
                                    <Badge className={`text-xs ${display.color} border-none`}>
                                        {otaName}
                                    </Badge>
                                    {isLowest && (
                                        <Badge className="bg-emerald-500 text-white text-[10px] border-none px-1.5">
                                            {t('lowestBadge')}
                                        </Badge>
                                    )}
                                    {p.refund_policy && p.refund_policy !== 'unknown' && (
                                        <Badge variant="outline" className={`text-[10px] ${p.refund_policy === 'refundable'
                                            ? 'bg-green-50 text-green-600 border-green-200'
                                            : 'bg-red-50 text-red-600 border-red-200'
                                            }`}>
                                            {p.refund_policy === 'refundable' ? t('refundable') : t('nonRefundable')}
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`font-bold ${isLowest ? 'text-emerald-700' : 'text-slate-800'}`}>
                                        {p.is_sold_out ? t('soldOut') : formatPrice(p.price_krw, currency, exchangeRate)}
                                    </span>
                                    {p.url && !p.is_sold_out && (
                                        <a
                                            href={p.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-slate-400 hover:text-blue-600 transition-colors"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}

                {!loading && allPrices.length === 1 && (
                    <div className="px-4 py-3 text-sm text-slate-400 text-center">
                        {t('noOtaData')}
                    </div>
                )}
            </div>
        </div>
    );
}
