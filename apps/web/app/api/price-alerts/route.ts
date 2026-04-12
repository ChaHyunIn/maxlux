import { errorResponse, successResponse } from '@/lib/apiResponse';
import { rateLimit } from '@/lib/rateLimit';
import { createPriceAlert, getActiveAlerts, deactivateAlert } from '@/lib/supabase/mutations/alerts';
import { isValidEmail } from '@/lib/validation';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * 가격 알림 API
 *
 * 보안 메모:
 * - 모든 엔드포인트에 IP 기반 rate limiting 적용.
 * - POST: anon INSERT만 허용 (RLS).
 * - GET/DELETE: service_role key로 실행 (adminSupabase).
 * - TODO(Phase 7): reCAPTCHA 또는 Turnstile 토큰 검증 추가하여
 *   이메일 열거 공격(email enumeration) 방지 강화.
 *   구현 시 POST body에 `captchaToken` 필드를 추가하고
 *   Cloudflare Turnstile (https://developers.cloudflare.com/turnstile/)
 *   서버 사이드 검증을 수행할 것.
 */

export async function POST(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(ip, 'write'))) {
        return errorResponse('RATE_LIMITED', 429);
    }
    try {
        const body = await req.json();
        const { hotel_id, email, target_price, stay_date_from, stay_date_to, locale, currency } = body;

        if (!hotel_id || !email || !target_price) {
            return errorResponse('MISSING_FIELDS', 400);
        }

        const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!UUID_REGEX.test(hotel_id)) {
            return errorResponse('INVALID_PARAMS', 400);
        }

        if (!isValidEmail(email)) {
            return errorResponse('INVALID_EMAIL', 400);
        }

        if (typeof target_price !== 'number' || target_price <= 0) {
            return errorResponse('INVALID_PRICE', 400);
        }

        const alert = await createPriceAlert({
            hotel_id,
            email,
            target_price,
            stay_date_from,
            stay_date_to,
            locale,
            currency,
        });

        return successResponse({ alert });
    } catch {
        return errorResponse('CREATE_FAILED', 500);
    }
}

export async function GET(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(`get-alerts-${ip}`, 'read'))) {
        return errorResponse('RATE_LIMITED', 429);
    }

    const email = req.nextUrl.searchParams.get('email');
    const hotelId = req.nextUrl.searchParams.get('hotelId');

    if (!email) {
        return errorResponse('MISSING_FIELDS', 400);
    }

    if (!isValidEmail(email)) {
        return errorResponse('INVALID_EMAIL', 400);
    }

    try {
        const alerts = await getActiveAlerts(email, hotelId || undefined);
        return successResponse({ alerts });
    } catch {
        return errorResponse('FETCH_FAILED', 500);
    }
}

export async function DELETE(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!(await rateLimit(`delete-alert-${ip}`, 'write'))) {
        return errorResponse('RATE_LIMITED', 429);
    }

    const alertId = req.nextUrl.searchParams.get('id');
    const email = req.nextUrl.searchParams.get('email');

    if (!alertId || !email) {
        return errorResponse('MISSING_FIELDS', 400);
    }

    if (!isValidEmail(email)) {
        return errorResponse('INVALID_EMAIL', 400);
    }

    try {
        const parsed = parseInt(alertId, 10);
        if (isNaN(parsed) || parsed <= 0) {
            return errorResponse('INVALID_ID', 400);
        }
        await deactivateAlert(parsed, email);
        return successResponse();
    } catch {
        return errorResponse('DELETE_FAILED', 500);
    }
}
