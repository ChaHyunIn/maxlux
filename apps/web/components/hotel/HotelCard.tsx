'use client';
import { useState } from 'react';
import type { Hotel } from '@/lib/types';
import { useSettingStore } from '@/stores/settingStore';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { getCityDisplayName } from '@/lib/cityMapper';
import { MapPin, Building } from 'lucide-react';

interface HotelCardProps {
    hotel: Hotel & { min_price?: number };
}

export function HotelCard({ hotel }: HotelCardProps) {
    const [imgError, setImgError] = useState(false);
    const { currency } = useSettingStore();

    return (
        <Link href={`/hotels/${hotel.slug}`}>
            <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col group">
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {hotel.image_url && !imgError ? (
                        <Image
                            src={hotel.image_url}
                            alt={hotel.name_ko}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-muted-foreground">
                            <Building className="w-8 h-8 mb-2 opacity-30" />
                            <span className="text-xs font-medium tracking-wide opacity-50 uppercase">Image Unavailable</span>
                        </div>
                    )}
                    {hotel.brand && (
                        <div className="absolute top-3 left-3">
                            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background/90 text-foreground">
                                {hotel.brand}
                            </Badge>
                        </div>
                    )}
                </div>
                <CardContent className="p-4 flex-1 flex flex-col gap-1.5">
                    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                        {hotel.name_ko}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                        {hotel.name_en}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="capitalize">{getCityDisplayName(hotel.city)}</span>
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-end items-baseline gap-1">
                    {hotel.min_price ? (
                        <>
                            <span className="text-xs text-muted-foreground">최저</span>
                            <span className="font-bold text-lg">{formatPrice(hotel.min_price, currency)}</span>
                            <span className="text-sm text-muted-foreground">~</span>
                        </>
                    ) : (
                        <span className="text-sm text-muted-foreground">가격 정보 없음</span>
                    )}
                </CardFooter>
            </Card>
        </Link>
    );
}
