import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getHotelBySlug, getRates } from '@/lib/supabase/server';
import { HeatmapCalendar } from '@/components/calendar/HeatmapCalendar';
import { Badge } from '@/components/ui/badge';

export const revalidate = 3600; // 1 hour

export default async function HotelDetailPage({ params }: { params: { slug: string } }) {
    const hotel = await getHotelBySlug(params.slug);
    if (!hotel) {
        notFound();
    }

    const rates = await getRates(hotel.id);

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="mb-8 p-6 bg-white rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-1/3 aspect-video relative rounded-xl overflow-hidden bg-slate-100">
                    {hotel.image_url && (
                        <Image src={hotel.image_url} alt={hotel.name_ko} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                    )}
                </div>
                <div className="flex-1 space-y-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            {hotel.brand && (
                                <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-0">{hotel.brand}</Badge>
                            )}
                            <span className="text-gray-500 text-sm">{hotel.city || '서울'}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">{hotel.name_ko}</h1>
                        <p className="text-gray-500 text-sm">{hotel.name_en}</p>
                    </div>
                </div>
            </div>

            <HeatmapCalendar rates={rates} hotel={hotel} />
        </div>
    );
}
