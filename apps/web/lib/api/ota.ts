import * as Sentry from '@sentry/nextjs';
import type { OtaPrice } from '../types';

/**
 * 클라이언트 측에서 OTA 가격 목록을 조회합니다.
 * @param hotelId - 호텔 UUID
 * @param stayDate - 숙박 예정일 (YYYY-MM-DD)
 * @returns OTA 가격 목록 배열
 */
export async function fetchOtaPrices(hotelId: string, stayDate: string): Promise<OtaPrice[]> {
    try {
        const res = await fetch(`/api/ota-prices?hotelId=${hotelId}&stayDate=${stayDate}`);
        if (!res.ok) {
            const data = await res.json();
            // eslint-disable-next-line no-console
            if (process.env.NODE_ENV === 'development') console.error('[OTA] fetchOtaPrices error:', data.error);
            return [];
        }
        const data = await res.json();
        return Array.isArray(data.prices) ? data.prices : [];
    } catch (e) {
        // eslint-disable-next-line no-console
        if (process.env.NODE_ENV === 'development') console.error('[OTA] fetchOtaPrices failed:', e);
        Sentry.captureException(e, { tags: { api: 'fetchOtaPrices', hotelId } });
        return [];
    }
}
