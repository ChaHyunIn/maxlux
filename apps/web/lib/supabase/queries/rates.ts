import { supabase } from '../anon';
import type { DailyRate, PricePercentiles, RoomRate, PriceChange } from '../../types';
import { FALLBACK_PERCENTILES } from '../../constants';

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
    return data ?? FALLBACK_PERCENTILES;
}

export async function getRoomRates(hotelId: string, stayDate: string): Promise<RoomRate[]> {
    const { data, error } = await supabase
        .from('room_rates')
        .select('*')
        .eq('hotel_id', hotelId)
        .eq('stay_date', stayDate)
        .eq('source', 'hotellux')
        .order('price_krw');
    if (error) return [];
    return data;
}

export async function getPriceChanges(hotelId: string, limit = 20): Promise<PriceChange[]> {
    const { data, error } = await supabase
        .from('price_changes')
        .select('*')
        .eq('hotel_id', hotelId)
        .order('changed_at', { ascending: false })
        .limit(limit);
    if (error) return [];
    return data;
}
