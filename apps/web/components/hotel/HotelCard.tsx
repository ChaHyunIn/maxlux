"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useFavorites } from '@/hooks/useFavorites';

import { Building2, Heart, TrendingDown } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import { getBrandKey } from '@/lib/brandMapper';
import { getCityKey } from '@/lib/cityMapper';
import { HOT_DEAL_THRESHOLD } from '@/lib/constants';
import { getHotelName } from '@/lib/hotelUtils';
import { formatPrice, getRelativeTime } from '@/lib/utils';
import { useSettingStore } from '@/stores/settingStore';
import type { Hotel } from '@/lib/types';

export function HotelCard({ hotel }: { hotel: Hotel & { min_price?: number; recent_drops?: number } }) {
    const t = useTranslations('hotel');
    const tBrand = useTranslations('brand');
    const tCity = useTranslations('city');
    const tTime = useTranslations('time');
    const locale = useLocale();
    const [imageError, setImageError] = useState(false);
    const { isFavorite, toggleFavorite } = useFavorites();
    const { currency } = useSettingStore();

    const brandKey = hotel.brand ? getBrandKey(hotel.brand) : null;
    const cityKey = getCityKey(hotel.city);

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        toggleFavorite(hotel.id);
    };

    const hasRecentDrop = hotel.recent_drops !== undefined && hotel.recent_drops > 0;

    return (
        <Link href={`/hotels/${hotel.slug}`}>
            <Card className="overflow-hidden hover:shadow-md transition-shadow h-full cursor-pointer flex flex-col">
                <div className="relative w-full aspect-[4/3] bg-slate-200 flex items-center justify-center overflow-hidden">
                    {hotel.image_url && !imageError ? (
                        <Image
                            src={hotel.image_url}
                            alt={getHotelName(hotel, locale)}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover rounded-t-xl transition-transform hover:scale-105 duration-300"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 absolute inset-0 bg-slate-100 rounded-t-xl z-0">
                            <Building2 className="w-12 h-12 mb-2 opacity-50" />
                        </div>
                    )}
                    {hotel.min_price && hotel.min_price <= HOT_DEAL_THRESHOLD && (
                        <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white border-0 z-10 shadow-lg">
                            {t('hotDeal')}
                        </Badge>
                    )}
                    <button
                        onClick={handleToggleFavorite}
                        className="absolute top-3 left-3 z-10 p-2 rounded-full bg-white/70 backdrop-blur-md shadow-sm hover:bg-white transition-colors"
                        aria-label={t('ariaToggleFavorite')}
                    >
                        <Heart className={`w-5 h-5 transition-colors ${isFavorite(hotel.id) ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
                    </button>
                </div>
                <CardContent className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-bold line-clamp-1">{getHotelName(hotel, locale)}</h3>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            {brandKey && (
                                <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-700">
                                    {tBrand(brandKey)}
                                </Badge>
                            )}
                            {cityKey && <span className="text-sm text-gray-500">{tCity(cityKey)}</span>}
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex flex-col gap-2">
                        {hotel.min_price ? (
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-red-500 font-medium">{t('nonRefundableShort')}</span>
                                    <p className="text-blue-600 font-bold text-xl">{formatPrice(hotel.min_price, currency)}~</p>
                                </div>
                                {hotel.min_price_refundable && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] text-green-600 font-medium">{t('refundableShort')}</span>
                                        <p className="text-gray-500 font-semibold text-sm">{formatPrice(hotel.min_price_refundable, currency)}~</p>
                                    </div>
                                )}
                                {hotel.latest_scraped_at && (
                                    <span className="text-[10px] text-gray-400">
                                        {getRelativeTime(hotel.latest_scraped_at, tTime)}
                                    </span>
                                )}
                                {hasRecentDrop && (
                                    <p className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                        <TrendingDown className="w-3 h-3" />
                                        {t('priceChanged')}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-end gap-1">
                                <p className="text-gray-400 font-medium tracking-tight">{t('priceCollecting')}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
