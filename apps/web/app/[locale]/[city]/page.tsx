import { getHotelsByCity } from '@/lib/supabase/queries/hotels';
import { HotelList } from '@/components/hotel/HotelList';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import type { Hotel } from '@/lib/types';
import { getCityKey } from '@/lib/cityMapper';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { locale: string; city: string } }): Promise<Metadata> {
    const t = await getTranslations({ locale: params.locale, namespace: 'city' });
    const cityKey = getCityKey(params.city);
    const cityName = cityKey ? t(cityKey) : params.city;

    const title = params.locale === 'ko'
        ? `${cityName} 호텔 가격 비교 | 최저가 스나이퍼`
        : `${cityName} Hotel Deals | Best Price Sniper`;

    return {
        title,
        description: params.locale === 'ko'
            ? `${cityName} 럭셔리 호텔의 최신 가격 정보 및 최저가 비교`
            : `Compare the best luxury hotel prices in ${cityName}.`,
    };
}

export default async function CityPage({ params }: { params: { locale: string; city: string } }) {
    setRequestLocale(params.locale);

    let hotels: (Hotel & { min_price?: number })[] = [];
    try {
        hotels = await getHotelsByCity(params.city);
    } catch (e) {
        // Log is fine for server side
        console.error("Failed to load hotels for city:", params.city, e);
    }

    return (
        <div className="w-full">
            <HotelList hotels={hotels} />
        </div>
    );
}
