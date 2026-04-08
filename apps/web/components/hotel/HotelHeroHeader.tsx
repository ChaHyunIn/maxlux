'use client'
import { MapPin, Building, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { HotelHeroImage } from '@/components/hotel/HotelHeroImage';
import { mapBenefitText } from '@/lib/benefitMapper';
import { getCityDisplayName } from '@/lib/cityMapper';
import type { Hotel } from '@/lib/types';
import { useLocale, useTranslations } from 'next-intl';

export function HotelHeroHeader({ hotel }: { hotel: Hotel }) {
    const t = useTranslations('hotel');
    const locale = useLocale();
    const primaryName = locale === 'en' ? hotel.name_en : hotel.name_ko;
    const secondaryName = locale === 'en' ? hotel.name_ko : hotel.name_en;

    return (
        <div className="mb-12 rounded-3xl overflow-hidden border bg-card text-card-foreground shadow-sm relative group">
            <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-muted overflow-hidden">
                <HotelHeroImage url={hotel.image_url || ''} alt={hotel.name_ko} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-12 text-white">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {hotel.brand && (
                            <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md">
                                <Building className="w-3 h-3 mr-1" />
                                {hotel.brand}
                            </Badge>
                        )}
                        <Badge variant="secondary" className="bg-black/40 hover:bg-black/50 text-white border-none backdrop-blur-md">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span className="capitalize">{getCityDisplayName(hotel.city)}</span>
                        </Badge>
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 text-balance leading-tight drop-shadow-md">
                        {primaryName}
                    </h1>
                    <p className="text-slate-200 text-lg md:text-xl font-medium drop-shadow-md">{secondaryName}</p>
                    {hotel.address && (
                        <div className="flex items-center text-slate-300 mt-5 text-sm md:text-base max-w-2xl">
                            <MapPin className="w-4 h-4 md:w-5 md:h-5 mr-2 flex-shrink-0" />
                            <span>{hotel.address}</span>
                        </div>
                    )}
                </div>
            </div>
            {hotel.benefits && hotel.benefits.length > 0 && (
                <div className="p-6 md:p-8 bg-muted/20 border-t">
                    <h3 className="font-semibold flex items-center gap-2 mb-4 text-primary text-lg">
                        <Sparkles className="w-5 h-5" />
                        {t('benefitsTitle')}
                    </h3>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                        {hotel.benefits.map((benefit, i) => (
                            <Badge key={i} variant="outline" className="bg-background px-3 py-1 text-sm shadow-sm transition-colors hover:bg-muted">
                                {mapBenefitText(benefit)}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
