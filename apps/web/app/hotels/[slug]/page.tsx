import { notFound } from 'next/navigation';
import { getHotelBySlug, getRates } from '@/lib/supabase/server';
import { HeatmapCalendar } from '@/components/calendar/HeatmapCalendar';
import { HotelHeroHeader } from '@/components/hotel/HotelHeroHeader';

export const revalidate = 3600;

export default async function HotelDetailPage({ params }: { params: { slug: string } }) {
    const hotel = await getHotelBySlug(params.slug);
    if (!hotel) {
        notFound();
    }

    const rates = await getRates(hotel.id);

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <HotelHeroHeader hotel={hotel} />
            <HeatmapCalendar rates={rates} hotel={hotel} />
        </div>
    );
}
