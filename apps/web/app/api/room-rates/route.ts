import type { NextRequest } from 'next/server';
import { getRoomRates } from '@/lib/supabase/queries/rates';
import { errorResponse, successResponse } from '@/lib/apiResponse';

export async function GET(req: NextRequest) {
    const hotelId = req.nextUrl.searchParams.get('hotelId');
    const stayDate = req.nextUrl.searchParams.get('stayDate');

    if (!hotelId || !stayDate) {
        return errorResponse('MISSING_PARAMS', 400);
    }

    try {
        const data = await getRoomRates(hotelId, stayDate);
        return successResponse({ data });
    } catch {
        return errorResponse('FETCH_FAILED', 500);
    }
}
