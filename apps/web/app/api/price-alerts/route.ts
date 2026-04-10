import { errorResponse, successResponse } from '@/lib/apiResponse';
import { rateLimit } from '@/lib/rateLimit';
import { createPriceAlert, getActiveAlerts, deactivateAlert } from '@/lib/supabase/mutations/alerts';
import { isValidEmail } from '@/lib/validation';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(ip, 10, 60_000)) {
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

        if (target_price <= 0) {
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

// TODO: 이메일 열거 방지를 위해 reCAPTCHA 또는 토큰 인증 추가 고려
export async function GET(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`get-alerts-${ip}`, 20, 60_000)) {
        return errorResponse('RATE_LIMITED', 429);
    }
    const email = req.nextUrl.searchParams.get('email');
    const hotelId = req.nextUrl.searchParams.get('hotelId');

    if (!email) {
        return errorResponse('MISSING_FIELDS', 400);
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
    if (!rateLimit(`delete-alert-${ip}`, 10, 60_000)) {
        return errorResponse('RATE_LIMITED', 429);
    }
    const alertId = req.nextUrl.searchParams.get('id');
    const email = req.nextUrl.searchParams.get('email');

    if (!alertId || !email) {
        return errorResponse('MISSING_FIELDS', 400);
    }

    try {
        const parsed = parseInt(alertId, 10);
        if (isNaN(parsed)) {
            return errorResponse('INVALID_ID', 400);
        }
        await deactivateAlert(parsed, email);
        return successResponse();
    } catch {
        return errorResponse('DELETE_FAILED', 500);
    }
}
