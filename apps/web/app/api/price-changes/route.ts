import type { NextRequest } from 'next/server';
import { getPriceChanges } from '@/lib/supabase/queries/rates';
import { errorResponse, successResponse } from '@/lib/apiResponse';

export async function GET(req: NextRequest) {
    const hotelId = req.nextUrl.searchParams.get('hotelId');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20', 10);

    if (!hotelId) {
        return errorResponse('MISSING_HOTEL_ID', 400);
    }

    try {
        const changes = await getPriceChanges(hotelId, limit);
        return successResponse({ changes });
    } catch {
        return errorResponse('FETCH_FAILED', 500);
    }
}
