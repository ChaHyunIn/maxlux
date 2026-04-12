import * as Sentry from '@sentry/nextjs';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HotelList } from '@/components/hotel/HotelList';
import { getCityKey } from '@/lib/cityMapper';
import { REVALIDATE_SECONDS } from '@/lib/constants';
import { getHotelsByCity } from '@/lib/supabase/queries/hotels';
import type { Hotel } from '@/lib/types';
import type { Metadata } from 'next';

export const revalidate = REVALIDATE_SECONDS.cityPage;

export async function generateMetadata(props: { params: Promise<{ locale: string; city: string }> }): Promise<Metadata> {
    const params = await props.params;
    const tCity = await getTranslations({ locale: params.locale, namespace: 'city' });
    const tSeo = await getTranslations({ locale: params.locale, namespace: 'seo' });
    const cityKey = getCityKey(params.city);
    const cityName = cityKey ? tCity(cityKey) : params.city;

    return {
        title: tSeo('cityTitle', { city: cityName }),
        description: tSeo('cityDescription', { city: cityName }),
    };
}

export default async function CityPage(props: { params: Promise<{ locale: string; city: string }> }) {
    const params = await props.params;
    setRequestLocale(params.locale);

    let hotels: (Hotel & { min_price?: number })[] = [];
    try {
        hotels = await getHotelsByCity(params.city);
    } catch (e) {
        // eslint-disable-next-line no-console
        if (process.env.NODE_ENV === 'development') console.error('[CityPage] Failed to fetch hotels:', params.city, e);
        Sentry.captureException(e, { tags: { page: 'city', city: params.city } });
    }

    return (
        <div className="w-full">
            <HotelList hotels={hotels} />
        </div>
    );
}
