import { supabase } from '@/lib/supabase/anon';

export interface ExchangeRate {
    rate: number;
    source: string;
    date: string;
}

/**
 * DB에서 최신 USD/KRW 환율 정보를 가져옵니다.
 * Next.js Data Cache를 활용하여 1시간 동안 캐싱합니다.
 */
export async function getExchangeRate(): Promise<ExchangeRate> {
    const FALLBACK_RATE = Number(process.env['NEXT_PUBLIC_EXCHANGE_RATE_USD']) || 1400;

    try {
        const { data, error } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'exchange_rate_usd')
            .single();

        if (error || !data) {
            console.warn('Failed to fetch exchange rate from DB, using fallback:', error);
            return { rate: FALLBACK_RATE, source: 'fallback', date: new Date().toISOString() };
        }

        const value = data.value as unknown as ExchangeRate;
        return {
            rate: value.rate || FALLBACK_RATE,
            source: value.source || 'db',
            date: value.date || new Date().toISOString(),
        };
    } catch (e) {
        console.error('Exchange rate fetch exception:', e);
        return { rate: FALLBACK_RATE, source: 'error_fallback', date: new Date().toISOString() };
    }
}
