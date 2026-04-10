import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HotelList } from '@/components/hotel/HotelList';
import { REVALIDATE_SECONDS } from '@/lib/constants';
import { getHotels } from '@/lib/supabase/queries/hotels';
import type { Hotel } from '@/lib/types';

export const revalidate = REVALIDATE_SECONDS.homePage;

export default async function HomePage(props: { params: Promise<{ locale: string }> }) {
    const { locale } = await props.params;
    setRequestLocale(locale);
    const t = await getTranslations('common');

    let hotels: (Hotel & { min_price?: number })[] = [];
    try {
        hotels = await getHotels();
    } catch (e) {
        console.error('Failed to fetch hotels:', e);
    }

    if (hotels.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-gray-500 text-lg">{t('dataLoading')}</p>
            </div>
        );
    }

    return <HotelList hotels={hotels} />;
}
