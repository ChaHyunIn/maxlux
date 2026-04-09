import { getHotelBySlug } from '@/lib/supabase/queries/hotels';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { getHotelName } from '@/lib/hotelUtils';

interface Props {
    params: { locale: string; slug: string; 'yyyy-mm': string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const hotel = await getHotelBySlug(params.slug);
    if (!hotel) return {};

    const t = await getTranslations({ locale: params.locale, namespace: 'seo' });
    const name = getHotelName(hotel, params.locale);

    return {
        title: t('monthlyTitle', { name, month: params['yyyy-mm'] }),
        description: t('monthlyDescription', { name, month: params['yyyy-mm'] }),
    };
}

export default async function MonthlyLandingPage({ params }: Props) {
    setRequestLocale(params.locale);
    const t = await getTranslations('seo');

    const hotel = await getHotelBySlug(params.slug);
    if (!hotel) notFound();

    return (
        <div>
            <h1>{getHotelName(hotel, params.locale)} - {params['yyyy-mm']}</h1>
            <p>{t('monthlyLandingTodo')}</p>
        </div>
    );
}
