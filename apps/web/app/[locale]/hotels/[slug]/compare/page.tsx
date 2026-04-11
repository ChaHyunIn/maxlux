import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getHotelBySlug } from '@/lib/supabase/queries/hotels';
import { getRates } from '@/lib/supabase/queries/rates';
import { getHotelName } from '@/lib/hotelUtils';
import { formatPrice } from '@/lib/utils';
import MonthlyComparisonChart from '@/components/hotel/MonthlyComparisonChart';
import { History, ArrowLeft, CalendarDays } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

interface PageProps {
    params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const { locale, slug } = await props.params;
    const hotel = await getHotelBySlug(slug);
    if (!hotel) return {};

    const t = await getTranslations({ locale, namespace: 'compare' });
    const hotelName = getHotelName(hotel, locale);

    // 실제 데이터 기반 최저월 추출 로직 대신 타이틀 위주 구성 (상세 내용은 본문에서 처리)
    return {
        title: t('metaTitle', { name: hotelName }),
        description: t('metaDescription', { name: hotelName, cheapestMonth: '...' }),
    };
}

export default async function ComparePage(props: PageProps) {
    const { locale, slug } = await props.params;
    const t = await getTranslations({ locale, namespace: 'compare' });
    
    const hotel = await getHotelBySlug(slug);
    if (!hotel) notFound();

    const hotelName = getHotelName(hotel, locale);
    const rates = await getRates(hotel.id);
    
    // 월별 평균가 집계
    const activeRates = rates.filter(r => !r.is_sold_out && r.price_krw > 0);
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
            <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                <p className="text-slate-500">{t('noData')}</p>
            </div>
        );
    }

    // 최저가 월 찾기
    const minAvg = Math.min(...stats.map(s => s.avgPrice));
    const cheapestStat = stats.find(s => s.avgPrice === minAvg);
    if (cheapestStat) cheapestStat.isCheapest = true;

    const formattedMonthlyStats = stats.map(s => ({
        ...s,
        month: t('monthlyAvg', { month: parseInt(s.month.split('-')[1]) })
    }));

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <Link href={`/hotels/${slug}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-8 transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                {t('backToHotel')}
            </Link>

            <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-50 rounded-xl">
                        <History className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                        {t('title', { name: hotelName })}
                    </h1>
                </div>
                <p className="text-slate-500 text-lg leading-relaxed">
                    {t('metaDescription', { 
                        name: hotelName, 
                        cheapestMonth: cheapestStat ? t('monthlyAvg', { month: parseInt(cheapestStat.month.split('-')[1]) }) : '...' 
                    })}
                </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 mb-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-bold text-slate-800">{t('averagePrice')}</h2>
                    <div className="text-sm text-slate-400 font-medium">Per Night</div>
                </div>
                
                <MonthlyComparisonChart stats={formattedMonthlyStats} />
            </div>

            {cheapestStat && (
                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex items-start gap-4 mb-8">
                    <div className="p-2 bg-emerald-500 rounded-lg text-white">
                        <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-emerald-900 mb-1">MaxLux Insider Tip</h4>
                        <p className="text-emerald-700 text-sm">
                            {t('recommendation', { 
                                name: hotelName, 
                                month: parseInt(cheapestStat.month.split('-')[1]),
                                price: formatPrice(cheapestStat.avgPrice, 'KRW', 1) // Base KRW, exchange handled in store if needed
                            })}
                        </p>
                    </div>
                </div>
            )}

            <div className="flex justify-center">
                <Link href={`/hotels/${slug}`}>
                    <Button variant="outline" size="lg" className="rounded-full px-8">
                        {t('viewCalendar')}
                    </Button>
                </Link>
            </div>
        </div>
    );
}
