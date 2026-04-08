import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Hotel } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export function HotelCard({ hotel }: { hotel: Hotel & { min_price?: number } }) {
    const t = useTranslations('hotel');

    return (
        <Link href={`/hotels/${hotel.slug}`}>
            <Card className="overflow-hidden hover:shadow-md transition-shadow h-full cursor-pointer flex flex-col">
                <div className="relative w-full aspect-video bg-slate-200">
                    {hotel.image_url && (
                        <img
                            src={hotel.image_url}
                            alt={hotel.name_ko}
                            className="object-cover w-full h-full rounded-t-xl"
                        />
                    )}
                </div>
                <CardContent className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-bold line-clamp-1">{hotel.name_ko}</h3>
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
                    <div className="mt-4 pt-2 border-t border-slate-50">
                        {hotel.min_price ? (
                            <p className="text-blue-600 font-bold text-xl">{formatPrice(hotel.min_price)}~</p>
                        ) : (
                            <p className="text-gray-400 font-medium tracking-tight">{t('priceCollecting')}</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
