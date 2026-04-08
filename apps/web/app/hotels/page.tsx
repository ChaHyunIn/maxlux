import { getHotels } from '@/lib/supabase/server';
import { HotelList } from '@/components/hotel/HotelList';
import type { Hotel } from '@/lib/types';

export default async function HotelsPage() {
    let hotels: (Hotel & { min_price?: number })[] = [];
    try {
        hotels = await getHotels();
    } catch {
        // DB not yet connected
    }

    return <HotelList hotels={hotels} />;
}
