import { useMemo } from 'react';
import { getYear, getMonth } from 'date-fns';
import type { DailyRate } from '@/lib/types';
import { FALLBACK_PERCENTILES } from '@/lib/constants';

export function useCalendarData(rates: DailyRate[]) {
    // 4-bucket 폴백 순서에 따른 베이스 요금 결정 (nr_nobf -> nr_bf -> r_nobf -> r_bf)
    const { baseRates, refundableRateMap } = useMemo(() => {
        const byDate: Record<string, DailyRate[]> = {};
        rates.forEach(r => {
            const dayList = byDate[r.stay_date] || [];
            if (dayList.length === 0) {
                byDate[r.stay_date] = dayList;
            }
            dayList.push(r);
        });

        const baseRatesArray: DailyRate[] = [];
        const refMap: Record<string, DailyRate> = {};

        Object.values(byDate).forEach(dayRates => {
            const nr_nobf = dayRates.find(r => r.room_type === 'nr_nobf');
            const nr_bf = dayRates.find(r => r.room_type === 'nr_bf');
            const r_nobf = dayRates.find(r => r.room_type === 'r_nobf');
            const r_bf = dayRates.find(r => r.room_type === 'r_bf');

            // Base Rate
            const base = nr_nobf || nr_bf || r_nobf || r_bf;
            if (base) baseRatesArray.push(base);

            // Refundable Rate
            const ref = r_nobf || r_bf;
            if (ref) refMap[ref.stay_date] = ref;
        });

        return { baseRates: baseRatesArray, refundableRateMap: refMap };
    }, [rates]);

    const { p25, p75 } = useMemo(() => {
        const prices = baseRates.filter(r => !r.is_sold_out && r.price_krw).map(r => r.price_krw).sort((a, b) => a - b);
        if (prices.length === 0) return FALLBACK_PERCENTILES;
        const p25Val = prices[Math.floor(prices.length * 0.25)];
        const p75Val = prices[Math.floor(prices.length * 0.75)];
        return {
            p25: p25Val ?? FALLBACK_PERCENTILES.p25,
            p75: p75Val ?? FALLBACK_PERCENTILES.p75
        };
    }, [baseRates]);

    // rates에서 가장 최신 scraped_at 계산
    const lastScraped = useMemo(() => {
        if (rates.length === 0) return null;
        return rates.reduce<string | null>((latest, r) => {
            if (!r.scraped_at) return latest;
            return !latest || r.scraped_at > latest ? r.scraped_at : latest;
        }, null);
    }, [rates]);

    const groupedByMonth = useMemo(() => {
        const groups: Record<string, DailyRate[]> = {};
        baseRates.forEach(rate => {
            const d = new Date(rate.stay_date);
            const key = `${getYear(d)}-${getMonth(d) + 1}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(rate);
        });
        return Object.entries(groups).sort((a, b) => {
            const partsA = a[0].split('-').map(Number);
            const partsB = b[0].split('-').map(Number);
            const yA = partsA[0] ?? 0;
            const mA = partsA[1] ?? 0;
            const yB = partsB[0] ?? 0;
            const mB = partsB[1] ?? 0;
            return yA !== yB ? yA - yB : mA - mB;
        });
    }, [baseRates]);

    return { baseRates, refundableRateMap, p25, p75, lastScraped, groupedByMonth };
}
