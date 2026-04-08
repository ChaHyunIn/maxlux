import { getHotelBySlug, getRates, getPercentiles } from '@/lib/supabase/server';
import { HeatmapCalendar } from '@/components/calendar/HeatmapCalendar';
import { HotelHeroHeader } from '@/components/hotel/HotelHeroHeader';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface Props {
    params: { slug: string };
}

export const revalidate = 300; // 5 minutes ISR

export default async function HotelDetailPage({ params }: Props) {
    const hotel = await getHotelBySlug(params.slug);
    if (!hotel) notFound();

    const [rates, percentiles] = await Promise.all([
        getRates(hotel.id),
        getPercentiles(hotel.id),
    ]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-500">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" />
                호텔 목록으로 돌아가기
            </Link>

            <HotelHeroHeader hotel={hotel} />

            <section className="mb-12">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight mb-2">요금 캘린더</h2>
                        <p className="text-muted-foreground text-lg">기본 스탠다드 룸 기준 최저가 히트맵을 확인하세요.</p>
                    </div>
                </div>
                <HeatmapCalendar hotel={hotel} rates={rates} percentiles={percentiles} />
            </section>
        </div>
    );
}
