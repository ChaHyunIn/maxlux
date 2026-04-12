import { notFound } from 'next/navigation';
import { History, ArrowLeft, CalendarDays, Inbox } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import MonthlyComparisonChart from '@/components/hotel/MonthlyComparisonChart';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { getHotelName } from '@/lib/hotelUtils';
import { filterActiveRates } from '@/lib/rateUtils';
import { getHotelBySlug } from '@/lib/supabase/queries/hotels';
import { getRates } from '@/lib/supabase/queries/rates';
import { formatPrice } from '@/lib/utils';
import type { Metadata } from 'next';

interface PageProps {
    params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const { locale, slug } = await props.params;
    const hotel = await getHotelBySlug(slug);
    if (!hotel) return {};

    const t = await getTranslations({ locale, namespace: 'compare' });
    const hotelName = getHotelName(hotel, locale);

    return {
        title: t('metaTitle', { name: hotelName }),
        description: t('metaDescriptionGeneric', { name: hotelName }),
    };
}

export default async function ComparePage(props: PageProps) {
    const { locale, slug } = await props.params;
    const t = await getTranslations({ locale, namespace: 'compare' });
    const tTime = await getTranslations({ locale, namespace: 'time' });
    
    const hotel = await getHotelBySlug(slug);
    if (!hotel) notFound();

    const hotelName = getHotelName(hotel, locale);
    const rates = await getRates(hotel.id);
    
    // 월별 평균가 집계
    const activeRates = filterActiveRates(rates);
    const monthlyData: Record<string, { sum: number; count: number }> = {};
    
    activeRates.forEach(r => {
        const month = r.stay_date.substring(0, 7); // YYYY-MM
        if (!monthlyData[month]) monthlyData[month] = { sum: 0, count: 0 };
        monthlyData[month].sum += r.price_krw;
        monthlyData[month].count++;
    });

    const stats = Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({
            month,
            avgPrice: data.sum / data.count,
            isCheapest: false
        }));

    if (stats.length === 0) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-32 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Inbox className="w-10 h-10 text-slate-200 stroke-[1]" />
                </div>
                <h2 className="text-2xl font-display font-bold text-slate-900 mb-4">{t('noDataTitle')}</h2>
                <p className="text-slate-400 max-w-md mx-auto mb-10 font-light leading-relaxed">
                    {t('noDataDesc')}
                </p>
                <Link href={`/hotels/${slug}`}>
                    <Button variant="outline" className="rounded-full px-10 border-slate-200 hover:bg-slate-50 transition-all font-bold">
                        {t('backToHotel')}
                    </Button>
                </Link>
            </div>
        );
    }

    // 최저가 월 찾기
    const minAvg = Math.min(...stats.map(s => s.avgPrice));
    const cheapestStat = stats.find(s => s.avgPrice === minAvg);
    if (cheapestStat) cheapestStat.isCheapest = true;

    const formattedMonthlyStats = stats.map(s => {
        const monthPart = s.month.split('-')[1] ?? '01';
        return {
            ...s,
            month: t('monthlyAvg', { month: parseInt(monthPart, 10) })
        };
    });

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <Link href={`/hotels/${slug}`} className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-slate-400 hover:text-slate-900 mb-12 transition-all uppercase group">
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                {t('backToHotel')}
            </Link>

            <div className="mb-14">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-brand/10 rounded-2xl">
                        <History className="w-6 h-6 text-brand" strokeWidth={1.5} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand mb-1">{t('sectionLabel')}</div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-950 tracking-tight">
                            {t('title', { name: hotelName })}
                        </h1>
                    </div>
                </div>
                <p className="text-slate-500 text-lg leading-relaxed font-light">
                    {t('metaDescription', { 
                        name: hotelName, 
                        cheapestMonth: cheapestStat ? t('monthlyAvg', { month: parseInt(cheapestStat.month.split('-')[1] ?? '01', 10) }) : tTime('unknown') 
                    })}
                </p>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-luxury p-10 mb-12">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-xl font-display font-bold text-slate-900">{t('averagePrice')}</h2>
                    <div className="text-xs text-slate-400 font-bold tracking-widest uppercase">{t('perNight')}</div>
                </div>
                
                <MonthlyComparisonChart stats={formattedMonthlyStats} />
            </div>

            {cheapestStat && (
                <div className="bg-luxury-emerald-soft rounded-3xl p-8 border border-luxury-emerald/10 flex items-start gap-5 mb-12 shadow-sm">
                    <div className="p-3 bg-luxury-emerald rounded-2xl text-white shadow-lg shadow-luxury-emerald/20">
                        <CalendarDays className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <div>
                        <h4 className="font-display font-bold text-luxury-emerald text-xl mb-2">{t('insiderTip')}</h4>
                        <p className="text-luxury-emerald font-light text-base leading-relaxed">
                            {t('recommendation', { 
                                name: hotelName, 
                                month: parseInt(cheapestStat.month.split('-')[1] ?? '01', 10),
                                price: formatPrice(cheapestStat.avgPrice, 'KRW', 1, locale)
                            })}
                        </p>
                    </div>
                </div>
            )}

            <div className="flex justify-center">
                <Link href={`/hotels/${slug}`}>
                    <Button size="lg" className="rounded-full px-12 h-14 bg-slate-950 text-white font-bold hover:bg-slate-900 transition-all hover:scale-105 active:scale-95 shadow-xl">
                        {t('viewCalendar')}
                    </Button>
                </Link>
            </div>
        </div>
    );
}
