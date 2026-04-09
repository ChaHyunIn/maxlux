import { supabase } from '../anon';
import type { OtaPrice } from '../../types';

export async function getOtaPrices(hotelId: string, stayDate: string): Promise<OtaPrice[]> {
    const { data, error } = await supabase
        .from('ota_prices')
        .select('*')
        .eq('hotel_id', hotelId)
        .eq('stay_date', stayDate)
        .order('price_krw');
    if (error) return [];
    return data;
}

export async function getOtaSources(): Promise<{ code: string; name_ko: string; name_en: string; logo_url: string | null }[]> {
    const { data, error } = await supabase
        .from('ota_sources')
        .select('code, name_ko, name_en, logo_url')
        .eq('is_active', true);
    if (error) return [];
    return data;
}
