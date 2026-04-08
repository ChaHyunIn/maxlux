import { getHotelsByCity } from '@/lib/supabase/server';
import { HotelList } from '@/components/hotel/HotelList';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import type { Hotel } from '@/lib/types';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { locale: string; city: string } }): Promise<Metadata> {
    const cityCapitalized = params.city.charAt(0).toUpperCase() + params.city.slice(1);
    const title = params.locale === 'ko'
        ? `${cityCapitalized} 호텔 가격 비교 | 최저가 스나이퍼`
        : `${cityCapitalized} Hotel Deals | Best Price Sniper`;

    return {
        title,
        description: params.locale === 'ko'
            ? `${cityCapitalized} 럭셔리 호텔의 최신 가격 정보 및 최저가 비교`
            : `Compare the best luxury hotel prices in ${cityCapitalized}.`,
    };
}

export default async function CityPage({ params }: { params: { locale: string; city: string } }) {
    setRequestLocale(params.locale);
    const t = await getTranslations('common');

    let hotels: (Hotel & { min_price?: number })[] = [];
    try {
        hotels = await getHotelsByCity(params.city);
    } catch (e) {
        console.error("Failed to load hotels for city:", params.city, e);
    }

    return (
        <div className="w-full">
            <HotelList hotels={hotels} />
        </div>
    );
}
