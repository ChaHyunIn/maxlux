import { errorResponse, successResponse } from '@/lib/apiResponse';
import { getOtaPrices } from '@/lib/supabase/queries/ota';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    const hotelId = req.nextUrl.searchParams.get('hotelId');
    const stayDate = req.nextUrl.searchParams.get('stayDate');

    if (!hotelId || !stayDate) {
        return errorResponse('MISSING_PARAMS', 400);
    }

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

    if (!UUID_REGEX.test(hotelId) || !DATE_REGEX.test(stayDate)) {
        return errorResponse('INVALID_PARAMS', 400);
    }

    try {
        const prices = await getOtaPrices(hotelId, stayDate);
        return successResponse({ prices });
    } catch {
        return errorResponse('FETCH_FAILED', 500);
    }
}
