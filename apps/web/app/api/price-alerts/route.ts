import type { NextRequest } from 'next/server';
import { createPriceAlert, getActiveAlerts, deactivateAlert } from '@/lib/supabase/mutations/alerts';
import { errorResponse, successResponse } from '@/lib/apiResponse';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { hotel_id, email, target_price, stay_date_from, stay_date_to, locale } = body;

        if (!hotel_id || !email || !target_price) {
            return errorResponse('MISSING_FIELDS', 400);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
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
        });

        return successResponse({ alert });
    } catch (error) {
        console.error('Price alert creation error:', error);
        return errorResponse('CREATE_FAILED', 500);
    }
}

export async function GET(req: NextRequest) {
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
    const alertId = req.nextUrl.searchParams.get('id');
    const email = req.nextUrl.searchParams.get('email');

    if (!alertId || !email) {
        return errorResponse('MISSING_FIELDS', 400);
    }

    try {
        await deactivateAlert(parseInt(alertId, 10), email);
        return successResponse();
    } catch {
        return errorResponse('DELETE_FAILED', 500);
    }
}
