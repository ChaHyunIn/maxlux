import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HeatmapCalendar } from '@/components/calendar/HeatmapCalendar';
import { HotelHeroHeader } from '@/components/hotel/HotelHeroHeader';
import { PriceChangesList } from '@/components/hotel/PriceChangesList';
import { PriceTrendChart } from '@/components/hotel/PriceTrendChart';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { REVALIDATE_SECONDS } from '@/lib/constants';
import { getHotelBySlug } from '@/lib/supabase/queries/hotels';
import { getRates, getPriceChanges } from '@/lib/supabase/queries/rates';
import type { Metadata } from 'next';

export const revalidate = REVALIDATE_SECONDS.hotelDetail;

export async function generateMetadata(props: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
    const params = await props.params;
    const hotel = await getHotelBySlug(params.slug);
    if (!hotel) {
        const tCommon = await getTranslations({ locale: params.locale, namespace: 'common' });
        return { title: tCommon('notFound') };
    }

    const name = params.locale === 'ko' ? hotel.name_ko : hotel.name_en;
    const tSeo = await getTranslations({ locale: params.locale, namespace: 'seo' });
    const ogImageUrl = `/api/og/${params.slug}?locale=${params.locale}`;

    return {
        title: `${name} | MaxLux`,
        description: tSeo('metaDescription'),
        openGraph: {
            title: `${name} | MaxLux`,
            description: tSeo('metaDescription'),
            images: [{ url: ogImageUrl, width: 1200, height: 630 }],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${name} | MaxLux`,
            description: tSeo('metaDescription'),
            images: [ogImageUrl],
        },
    };
}

export default async function HotelDetailPage(props: { params: Promise<{ locale: string; slug: string }> }) {
    const params = await props.params;
    setRequestLocale(params.locale);

    const hotel = await getHotelBySlug(params.slug);
    if (!hotel) notFound();

    const [rates, priceChanges] = await Promise.all([
        getRates(hotel.id),
        getPriceChanges(hotel.id)
    ]);

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <HotelHeroHeader hotel={hotel} />
            <ErrorBoundary>
                <PriceTrendChart rates={rates} />
            </ErrorBoundary>
            <div className="mt-8">
                <ErrorBoundary>
                    <HeatmapCalendar rates={rates} hotel={hotel} />
                </ErrorBoundary>
            </div>
            <ErrorBoundary>
                <PriceChangesList changes={priceChanges} />
            </ErrorBoundary>
        </div>
    );
}
