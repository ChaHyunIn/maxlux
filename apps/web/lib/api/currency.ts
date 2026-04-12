import { unstable_cache } from 'next/cache';
import * as Sentry from '@sentry/nextjs';
import { LOCALE_DEFAULTS } from '@/lib/constants';
import { supabase } from '@/lib/supabase/anon';

export interface ExchangeRate {
    rate: number;
    source: string;
    date: string;
}

const FALLBACK_RATE = LOCALE_DEFAULTS.exchangeRateUsd;

/**
 * DB에서 최신 USD/KRW 환율 정보를 가져옵니다.
 * unstable_cache를 활용하여 1시간(3600초) 동안 캐싱하여
 * 매 페이지 요청마다 Supabase를 호출하지 않도록 합니다.
 */
export const getExchangeRate = unstable_cache(
    async (): Promise<ExchangeRate> => {
        try {
            const { data } = await supabase
                .from('system_settings')
                .select('value')
                .eq('key', 'exchange_rate_usd')
                .single();

            if (!data) {
                return { rate: FALLBACK_RATE, source: 'fallback', date: new Date().toISOString() };
            }

            const val = data.value;
            if (typeof val !== 'object' || val === null || !('rate' in val)) {
                return { rate: FALLBACK_RATE, source: 'invalid_data', date: new Date().toISOString() };
            }

            // Bracket notation with explicit dual suppression for strict production lint rules
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
            const v = val as any;
            const rate = typeof v['rate'] === 'number' ? v['rate'] : FALLBACK_RATE;
            const source = typeof v['source'] === 'string' ? v['source'] : 'db';
            const date = typeof v['date'] === 'string' ? v['date'] : new Date().toISOString();

            // 환율 값 유효성 검증
            if (rate <= 0 || rate > 100000) {
                return { rate: FALLBACK_RATE, source: 'fallback_invalid', date: new Date().toISOString() };
            }

            return {
                rate,
                source,
                date,
            };
        } catch (e) {
            Sentry.captureException(e, { tags: { service: 'getExchangeRate' } });
            return { rate: FALLBACK_RATE, source: 'error_fallback', date: new Date().toISOString() };
        }
    },
    ['exchange-rate-usd'],
    { revalidate: 3600 } // 1시간 캐시
);
