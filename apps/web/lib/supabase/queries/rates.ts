import { supabase } from '../anon';
import type { DailyRate, RoomRate, PriceChange } from '../../types';

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

/**
 * 서버 RPC get_percentiles는 현재 미사용 상태입니다.
 * 클라이언트 측 useCalendarData 훅에서 동일한 백분위 계산을 수행하므로
 * 이 함수 및 DB RPC는 Phase 7에서 제거하거나,
 * 반대로 클라이언트 계산을 제거하고 이 RPC를 사용하는 방향으로 통일할 수 있습니다.
 *
 * 현재 유지하는 이유: alert_checker(Python)에서 get_percentiles RPC를 참조할 가능성.
 */
// export async function getPercentiles(hotelId: string): Promise<PricePercentiles> {
//     const { data } = await supabase.rpc('get_percentiles', { hotel_uuid: hotelId });
//     return data ?? FALLBACK_PERCENTILES;
// }

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
