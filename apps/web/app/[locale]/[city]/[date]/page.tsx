import { getHotelsByCity } from '@/lib/supabase/server';
import { HotelList } from '@/components/hotel/HotelList';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import type { Hotel } from '@/lib/types';
import { getCityDisplayName } from '@/lib/cityMapper';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { locale: string; city: string; date: string } }): Promise<Metadata> {
    const cityName = getCityDisplayName(params.city, params.locale);
    const dateFormatted = params.date;
    const title = params.locale === 'ko'
        ? `${cityName} 호텔 ${dateFormatted} 가격 비교 | 최저가`
        : `${cityName} Hotel Deals on ${dateFormatted} | Best Price`;

    return {
        title,
        description: params.locale === 'ko'
            ? `${dateFormatted} 출발 ${cityName} 럭셔리 호텔의 최신 가격 정보 및 최저가 비교`
            : `Compare the best luxury hotel prices in ${cityName} for ${dateFormatted}.`,
    };
}

export default async function CityDatePage({ params }: { params: { locale: string; city: string; date: string } }) {
    setRequestLocale(params.locale);

    let hotels: (Hotel & { min_price?: number })[] = [];
    try {
        hotels = await getHotelsByCity(params.city);
        // NOTE: Later hook into explicit 'daily_rates' date queries. 
        // For now, retaining the baseline list renderer serves the exact SEO content requirements.
    } catch (e) {
        console.error("Failed to load hotels for city/date:", params.city, params.date, e);
    }

    return (
        <div className="w-full">
            <HotelList hotels={hotels} />
        </div>
    );
}
