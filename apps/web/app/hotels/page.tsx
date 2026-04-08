import { getHotels } from '@/lib/supabase/server';
import { HotelList } from '@/components/hotel/HotelList';

export default async function HotelsPage() {
    let hotels = [];
    try {
        hotels = await getHotels();
    } catch {
        // DB not yet connected
    }

    return <HotelList hotels={hotels} />;
}
