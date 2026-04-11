import { unstable_cache } from 'next/cache';
import { supabase } from '@/lib/supabase/anon';

export interface ExchangeRate {
    rate: number;
    source: string;
    date: string;
}

const FALLBACK_RATE = Number(process.env['NEXT_PUBLIC_EXCHANGE_RATE_USD']) || 1400;

/**
 * DB에서 최신 USD/KRW 환율 정보를 가져옵니다.
 * unstable_cache를 활용하여 1시간(3600초) 동안 캐싱하여
 * 매 페이지 요청마다 Supabase를 호출하지 않도록 합니다.
 */
export const getExchangeRate = unstable_cache(
    async (): Promise<ExchangeRate> => {
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
            const rate = value.rate;

            // 환율 값 유효성 검증: 0 이하이거나 비정상적으로 크면 fallback
            if (!rate || rate <= 0 || rate > 100000) {
                console.warn('Exchange rate out of valid range:', rate);
                return { rate: FALLBACK_RATE, source: 'fallback_invalid', date: new Date().toISOString() };
            }

            return {
                rate,
                source: value.source || 'db',
                date: value.date || new Date().toISOString(),
            };
        } catch (e) {
            console.error('Exchange rate fetch exception:', e);
            return { rate: FALLBACK_RATE, source: 'error_fallback', date: new Date().toISOString() };
        }
    },
    ['exchange-rate-usd'],
    { revalidate: 3600 } // 1시간 캐시
);
