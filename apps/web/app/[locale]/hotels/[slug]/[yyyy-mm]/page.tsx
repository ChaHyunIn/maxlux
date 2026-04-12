import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { HeatmapCalendar } from '@/components/calendar/HeatmapCalendar';
import { HotelHeroHeader } from '@/components/hotel/HotelHeroHeader';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { Link } from '@/i18n/navigation';
import { REVALIDATE_SECONDS } from '@/lib/constants';
import { getHotelName } from '@/lib/hotelUtils';
import { getHotelBySlug } from '@/lib/supabase/queries/hotels';
import { getRates } from '@/lib/supabase/queries/rates';
import type { Metadata } from 'next';

export const revalidate = REVALIDATE_SECONDS.hotelDetail;

interface Props {
    params: Promise<{ locale: string; slug: string; 'yyyy-mm': string }>;
}

export async function generateMetadata({ params: paramsPromise }: Props): Promise<Metadata> {
    const params = await paramsPromise;
    const hotel = await getHotelBySlug(params.slug);
    if (!hotel) return {};

    const t = await getTranslations({ locale: params.locale, namespace: 'calendar' });
    const name = getHotelName(hotel, params.locale);

    const [year, month] = params['yyyy-mm'].split('-').map(Number);
    const formattedMonth = t('monthFormat', { year: String(year), month: String(month) });

    const ogImageUrl = `/api/og/${params.slug}?locale=${params.locale}`;

    return {
        title: t('monthlyTitle', { name, month: formattedMonth }),
        description: t('monthlyDescription', { name, month: formattedMonth }),
        openGraph: {
            title: t('monthlyTitle', { name, month: formattedMonth }),
            description: t('monthlyDescription', { name, month: formattedMonth }),
            images: [{ url: ogImageUrl, width: 1200, height: 630 }],
        },
        twitter: {
            card: 'summary_large_image',
            images: [ogImageUrl],
        },
    };
}

export default async function MonthlyLandingPage({ params: paramsPromise }: Props) {
    const params = await paramsPromise;
    setRequestLocale(params.locale);

    const hotel = await getHotelBySlug(params.slug);
    if (!hotel) notFound();

    const t = await getTranslations({ locale: params.locale, namespace: 'calendar' });
    const rates = await getRates(hotel.id);
    const hotelName = getHotelName(hotel, params.locale);

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="mb-6">
                <Link
                    href={`/hotels/${params.slug}`}
                    className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    {t('backToFullCalendar', { name: hotelName })}
                </Link>
            </div>

            <HotelHeroHeader hotel={hotel} />

            <div className="mt-8">
                <ErrorBoundary>
                    <HeatmapCalendar
                        rates={rates}
                        hotel={hotel}
                        targetMonth={params['yyyy-mm']}
                    />
                </ErrorBoundary>
            </div>

            <div className="mt-12 p-8 bg-slate-50 rounded-2xl text-center">
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {t('otherMonthsQuestion')}
                </h3>
                <p className="text-slate-500 mb-6">
                    {t('otherMonthsDescription')}
                </p>
                <Link href={`/hotels/${params.slug}`}>
                    <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg">
                        {t('viewFullCalendar')}
                    </button>
                </Link>
            </div>
        </div>
    );
}
