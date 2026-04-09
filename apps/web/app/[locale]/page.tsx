import { getHotels } from '@/lib/supabase/queries/hotels';
import { HotelList } from '@/components/hotel/HotelList';
import type { Hotel } from '@/lib/types';
import { getTranslations, setRequestLocale } from 'next-intl/server';

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
