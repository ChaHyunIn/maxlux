import * as Sentry from '@sentry/nextjs';
import { supabase } from '../anon';
import type { OtaPrice } from '../../types';

export async function getOtaPrices(hotelId: string, stayDate: string): Promise<OtaPrice[]> {
    try {
        const { data, error } = await supabase
            .from('ota_prices')
            .select('*')
            .eq('hotel_id', hotelId)
            .eq('stay_date', stayDate)
            .order('price_krw');
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('getOtaPrices error:', error, { hotelId, stayDate });
        Sentry.captureException(error, { tags: { query: 'getOtaPrices', hotelId, stayDate } });
        return [];
    }
}

export async function getOtaSources(): Promise<{ code: string; name_ko: string; name_en: string; logo_url: string | null }[]> {
    try {
        const { data, error } = await supabase
            .from('ota_sources')
            .select('code, name_ko, name_en, logo_url')
            .eq('is_active', true);
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('getOtaSources error:', error);
        Sentry.captureException(error, { tags: { query: 'getOtaSources' } });
        return [];
    }
}
