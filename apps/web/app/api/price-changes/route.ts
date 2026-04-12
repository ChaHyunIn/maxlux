import { errorResponse, successResponse } from '@/lib/apiResponse';
import { getPriceChanges } from '@/lib/supabase/queries/rates';
import { isValidUUID } from '@/lib/validation';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const hotelId = req.nextUrl.searchParams.get('hotelId');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20', 10);

    if (!hotelId) {
        return errorResponse('MISSING_HOTEL_ID', 400);
    }

    if (!isValidUUID(hotelId)) {
        return errorResponse('INVALID_PARAMS', 400);
    }

    try {
        const changes = await getPriceChanges(hotelId, limit);
        return successResponse({ changes });
    } catch {
        return errorResponse('FETCH_FAILED', 500);
    }
}
