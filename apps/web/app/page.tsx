import { getHotels } from '@/lib/supabase/server';
import { HotelList } from '@/components/hotel/HotelList';
import type { Hotel } from '@/lib/types';

export const revalidate = 300; // 5 minutes ISR

export default async function HomePage() {
    let hotels: (Hotel & { min_price?: number })[] = [];

    try {
        hotels = await getHotels();
    } catch {
        // DB not yet connected
    }

    if (hotels.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-gray-500 text-lg">데이터 수집 중입니다...</p>
            </div>
        );
    }

    return <HotelList hotels={hotels} />;
}
