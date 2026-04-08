import { createClient } from '@supabase/supabase-js';
import type { Hotel, DailyRate, PricePercentiles } from '../types';
import { FALLBACK_PERCENTILES } from '../constants';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getHotels(): Promise<(Hotel & { min_price?: number })[]> {
    const { data, error } = await supabase
        .from('hotels')
        .select(`
            *,
            daily_rates ( price_krw )
        `)
        .eq('is_active', true)
        .eq('daily_rates.is_sold_out', false)
        .order('name_en');

    if (error) throw error;

    return data.map((hotel: any) => {
        const prices = hotel.daily_rates.map((r: any) => r.price_krw);
        const min_price = prices.length > 0 ? Math.min(...prices) : undefined;
        delete hotel.daily_rates;
        return { ...hotel, min_price };
    });
}

export async function getHotelBySlug(slug: string): Promise<Hotel | null> {
    const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('slug', slug)
        .single();
    if (error) return null;
    return data;
}

export async function getRates(hotelId: string): Promise<DailyRate[]> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
        .from('daily_rates')
        .select('*')
        .eq('hotel_id', hotelId)
        .gte('stay_date', today)
        .order('stay_date');
    if (error) throw error;
    return data;
}

export async function getPercentiles(hotelId: string): Promise<PricePercentiles> {
    const { data } = await supabase.rpc('get_percentiles', { hotel_uuid: hotelId });
    // fallback if RPC not set up yet
    return data ?? FALLBACK_PERCENTILES;
}
