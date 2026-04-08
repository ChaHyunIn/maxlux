"use client";

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Hotel } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { Building2, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';

export function HotelCard({ hotel }: { hotel: Hotel & { min_price?: number } }) {
    const t = useTranslations('hotel');
    const locale = useLocale();
    const [imageError, setImageError] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const favs = JSON.parse(localStorage.getItem('maxlux_favorites') || '[]');
        setIsFavorite(favs.includes(hotel.id));
    }, [hotel.id]);

    const toggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        const favs = JSON.parse(localStorage.getItem('maxlux_favorites') || '[]');
        if (favs.includes(hotel.id)) {
            const newFavs = favs.filter((id: string) => id !== hotel.id);
            localStorage.setItem('maxlux_favorites', JSON.stringify(newFavs));
            setIsFavorite(false);
        } else {
            favs.push(hotel.id);
            localStorage.setItem('maxlux_favorites', JSON.stringify(favs));
            setIsFavorite(true);
        }
    };

    return (
        <Link href={`/hotels/${hotel.slug}`}>
            <Card className="overflow-hidden hover:shadow-md transition-shadow h-full cursor-pointer flex flex-col">
                <div className="relative w-full aspect-[4/3] bg-slate-200 flex items-center justify-center overflow-hidden">
                    {hotel.image_url && !imageError ? (
                        <Image
                            src={hotel.image_url}
                            alt={locale === 'en' ? hotel.name_en : hotel.name_ko}
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
                    {hotel.min_price && hotel.min_price <= 350000 && (
                        <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white border-0 z-10 shadow-lg">
                            🔥 특가
                        </Badge>
                    )}
                    <button
                        onClick={toggleFavorite}
                        className="absolute top-3 left-3 z-10 p-2 rounded-full bg-white/70 backdrop-blur-md shadow-sm hover:bg-white transition-colors"
                        aria-label="Toggle favorite"
                    >
                        <Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
                    </button>
                </div>
                <CardContent className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-bold line-clamp-1">{locale === 'en' ? hotel.name_en : hotel.name_ko}</h3>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            {hotel.brand && (
                                <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-700">
                                    {hotel.brand}
                                </Badge>
                            )}
                            <span className="text-sm text-gray-500">{hotel.city || t('defaultCity')}</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex flex-col gap-3">
                        {hotel.min_price ? (
                            <div className="flex flex-col items-end gap-1">
                                <p className="text-blue-600 font-bold text-xl">{formatPrice(hotel.min_price)}~</p>
                                <p className="text-xs text-red-500 font-medium">📉 최근 가격 변동 있음</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-end gap-1">
                                <p className="text-gray-400 font-medium tracking-tight">{t('priceCollecting')}</p>
                            </div>
                        )}
                        <button
                            className="w-full mt-1 py-2 text-sm text-blue-600 font-semibold border border-blue-100 rounded-lg bg-blue-50/50 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                            onClick={(e) => {
                                e.preventDefault();
                                // TODO: Connect to explicit notification hook (Spec 5)
                            }}
                        >
                            🔔 가격 알림 받기
                        </button>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
