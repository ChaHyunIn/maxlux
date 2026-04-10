import { errorResponse, successResponse } from '@/lib/apiResponse';
import { getPriceChanges } from '@/lib/supabase/queries/rates';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    const hotelId = req.nextUrl.searchParams.get('hotelId');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20', 10);

    if (!hotelId) {
        return errorResponse('MISSING_HOTEL_ID', 400);
    }

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_REGEX.test(hotelId)) {
        return errorResponse('INVALID_PARAMS', 400);
    }

    try {
        const changes = await getPriceChanges(hotelId, limit);
        return successResponse({ changes });
    } catch {
        return errorResponse('FETCH_FAILED', 500);
    }
}
