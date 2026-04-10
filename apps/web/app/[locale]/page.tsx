import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HotelList } from '@/components/hotel/HotelList';
import { getHotels } from '@/lib/supabase/queries/hotels';
import type { Hotel } from '@/lib/types';

export const revalidate = 300;

export default async function HomePage({ params }: { params: { locale: string } }) {
    setRequestLocale(params.locale);
    const t = await getTranslations('common');

    let hotels: (Hotel & { min_price?: number })[] = [];
    try {
        hotels = await getHotels();
    } catch { }

    if (hotels.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-gray-500 text-lg">{t('dataLoading')}</p>
            </div>
        );
    }

    return <HotelList hotels={hotels} />;
}
