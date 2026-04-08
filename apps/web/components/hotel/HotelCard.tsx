import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Hotel } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
// If there is a cityMapper, you could use it here. For now falling back to hotel.city.

export function HotelCard({ hotel }: { hotel: Hotel & { min_price?: number } }) {
    return (
        <Link href={`/hotels/${hotel.slug}`}>
            <Card className="overflow-hidden hover:shadow-md transition-shadow h-full cursor-pointer flex flex-col">
                <div className="relative w-full aspect-video bg-slate-200">
                    {hotel.image_url && (
                        <Image
                            src={hotel.image_url}
                            alt={hotel.name_ko}
                            fill
                            className="object-cover rounded-t-xl"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                            <span className="text-sm text-gray-500">{hotel.city || '서울'}</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-2 border-t border-slate-50">
                        {hotel.min_price ? (
                            <p className="text-blue-600 font-bold text-xl">{formatPrice(hotel.min_price)}~</p>
                        ) : (
                            <p className="text-gray-400 font-medium tracking-tight">가격 수집 중</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
