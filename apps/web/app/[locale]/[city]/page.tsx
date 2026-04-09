import { getHotelsByCity } from '@/lib/supabase/queries/hotels';
import { HotelList } from '@/components/hotel/HotelList';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import type { Hotel } from '@/lib/types';
import { getCityKey } from '@/lib/cityMapper';
import { getHotelName } from '@/lib/hotelUtils';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { locale: string; city: string } }): Promise<Metadata> {
    const tCity = await getTranslations({ locale: params.locale, namespace: 'city' });
    const tSeo = await getTranslations({ locale: params.locale, namespace: 'seo' });
    const cityKey = getCityKey(params.city);
    const cityName = cityKey ? tCity(cityKey) : params.city;

    return {
        title: tSeo('cityTitle', { city: cityName }),
        description: tSeo('cityDescription', { city: cityName }),
    };
}

export default async function CityPage({ params }: { params: { locale: string; city: string } }) {
    setRequestLocale(params.locale);

    let hotels: (Hotel & { min_price?: number })[] = [];
    try {
        hotels = await getHotelsByCity(params.city);
    } catch (e) {
        // Fallback to empty array on failure
    }

    return (
        <div className="w-full">
            <HotelList hotels={hotels} />
        </div>
    );
}
