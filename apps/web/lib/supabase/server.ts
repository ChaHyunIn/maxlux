import { createClient } from '@supabase/supabase-js';
import type { Hotel, DailyRate, PricePercentiles, OtaPrice, PriceChange } from '../types';
import { FALLBACK_PERCENTILES } from '../constants';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getHotels(): Promise<(Hotel & { min_price?: number })[]> {
    const { data, error } = await supabase
        .from('hotels_with_min_price')
        .select('*')
        .eq('is_active', true)
        .order('name_en');

    if (error) throw error;

    return data as (Hotel & { min_price?: number })[];
}

export async function getHotelsByCity(city: string): Promise<(Hotel & { min_price?: number })[]> {
    const { data, error } = await supabase
        .from('hotels_with_min_price')
        .select('*')
        .eq('is_active', true)
        .eq('city', city)
        .order('name_en');

    if (error) throw error;

    return data as (Hotel & { min_price?: number })[];
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

// ─── Price Alerts ───

export async function createPriceAlert(data: {
    hotel_id: string;
    email: string;
    target_price: number;
    stay_date_from?: string | null;
    stay_date_to?: string | null;
    locale?: string;
}) {
    const { data: result, error } = await supabase
        .from('price_alerts')
        .upsert(
            {
                hotel_id: data.hotel_id,
                email: data.email.toLowerCase().trim(),
                target_price: data.target_price,
                stay_date_from: data.stay_date_from || null,
                stay_date_to: data.stay_date_to || null,
                locale: data.locale || 'ko',
                is_active: true,
            },
            { onConflict: 'hotel_id,email,target_price' }
        )
        .select()
        .single();

    if (error) throw error;
    return result;
}

export async function getActiveAlerts(email: string, hotelId?: string) {
    let query = supabase
        .from('price_alerts')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (hotelId) {
        query = query.eq('hotel_id', hotelId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function deactivateAlert(alertId: number) {
    const { error } = await supabase
        .from('price_alerts')
        .update({ is_active: false })
        .eq('id', alertId);

    if (error) throw error;
}
