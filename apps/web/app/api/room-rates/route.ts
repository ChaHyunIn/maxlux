import type { NextRequest } from 'next/server';
import { getRoomRates } from '@/lib/supabase/queries/rates';
import { errorResponse, successResponse } from '@/lib/apiResponse';

export async function GET(req: NextRequest) {
    const hotelId = req.nextUrl.searchParams.get('hotelId');
    const stayDate = req.nextUrl.searchParams.get('stayDate');

    if (!hotelId || !stayDate) {
        return errorResponse('hotelId and stayDate are required', 400);
    }

    try {
        const data = await getRoomRates(hotelId, stayDate);
        return successResponse({ data });
    } catch {
        return errorResponse('Failed to fetch room rates', 500);
    }
}
