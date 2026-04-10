import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { HeatmapCalendar } from '@/components/calendar/HeatmapCalendar';
import { HotelHeroHeader } from '@/components/hotel/HotelHeroHeader';
import { PriceTrendChart } from '@/components/hotel/PriceTrendChart';
import { REVALIDATE_SECONDS } from '@/lib/constants';
import { getHotelBySlug } from '@/lib/supabase/queries/hotels';
import { getRates } from '@/lib/supabase/queries/rates';
import type { Metadata } from 'next';

export const revalidate = REVALIDATE_SECONDS.hotelDetail;

export async function generateMetadata(props: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
    const params = await props.params;
    const hotel = await getHotelBySlug(params.slug);
    if (!hotel) return { title: 'Hotel Not Found' };

    const name = params.locale === 'ko' ? hotel.name_ko : hotel.name_en;
    return {
        title: `${name} | MaxLux`,
        description: `Track prices and find hot deals for ${name}.`,
    };
}

export default async function HotelDetailPage(props: { params: Promise<{ locale: string; slug: string }> }) {
    const params = await props.params;
    setRequestLocale(params.locale);

    const hotel = await getHotelBySlug(params.slug);
    if (!hotel) notFound();

    const rates = await getRates(hotel.id);

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <HotelHeroHeader hotel={hotel} />
            <PriceTrendChart rates={rates} />
            <div className="mt-8">
                <HeatmapCalendar rates={rates} hotel={hotel} />
            </div>
        </div>
    );
}
