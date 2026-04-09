import { getHotelBySlug } from '@/lib/supabase/queries/hotels';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';

interface Props {
    params: { locale: string; slug: string; 'yyyy-mm': string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const hotel = await getHotelBySlug(params.slug);
    if (!hotel) return {};

    const t = await getTranslations({ locale: params.locale, namespace: 'seo' });
    const name = params.locale === 'en' ? hotel.name_en : hotel.name_ko;

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
            <h1>{params.locale === 'en' ? hotel.name_en : hotel.name_ko} - {params['yyyy-mm']}</h1>
            <p>{t('monthlyLandingTodo')}</p>
        </div>
    );
}
