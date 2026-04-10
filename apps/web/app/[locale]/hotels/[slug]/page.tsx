import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { HeatmapCalendar } from '@/components/calendar/HeatmapCalendar';
import { HotelHeroHeader } from '@/components/hotel/HotelHeroHeader';
import { PriceTrendChart } from '@/components/hotel/PriceTrendChart';
import { getHotelBySlug } from '@/lib/supabase/queries/hotels';
import { getRates } from '@/lib/supabase/queries/rates';

export const revalidate = 3600;

export default async function HotelDetailPage({
    params,
}: {
    params: { locale: string; slug: string };
}) {
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
