import { getHotelBySlug } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

interface Props {
    params: { locale: string; slug: string; 'yyyy-mm': string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const hotel = await getHotelBySlug(params.slug);
    if (!hotel) return {};
    return {
        title: `${hotel.name_ko} ${params['yyyy-mm']} 가격 | MaxLux`,
        description: `${hotel.name_ko}의 ${params['yyyy-mm']} 월별 가격을 확인하세요.`,
    };
}

export default async function MonthlyLandingPage({ params }: Props) {
    setRequestLocale(params.locale);

    const hotel = await getHotelBySlug(params.slug);
    if (!hotel) notFound();

    return (
        <div>
            <h1>{hotel.name_ko} - {params['yyyy-mm']}</h1>
            <p>TODO: 월별 SEO 랜딩 페이지</p>
        </div>
    );
}
