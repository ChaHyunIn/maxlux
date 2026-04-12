import type { DailyRate } from './types';

/**
 * 매진 및 0원 요금을 제외한 활성 요금만 필터링합니다.
 * 프로젝트 전반에서 동일한 필터 조건을 공유하여 일관성을 보장합니다.
 */
export function filterActiveRates(rates: DailyRate[]): DailyRate[] {
    return rates.filter(r => !r.is_sold_out && r.price_krw > 0);
}
