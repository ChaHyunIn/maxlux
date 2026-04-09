import type { NextRequest } from 'next/server';
import { getOtaPrices } from '@/lib/supabase/queries/ota';
import { errorResponse, successResponse } from '@/lib/apiResponse';

export async function GET(req: NextRequest) {
    const hotelId = req.nextUrl.searchParams.get('hotelId');
    const stayDate = req.nextUrl.searchParams.get('stayDate');

    if (!hotelId || !stayDate) {
        return errorResponse('Missing hotelId or stayDate', 400);
    }

    try {
        const prices = await getOtaPrices(hotelId, stayDate);
        return successResponse({ prices });
    } catch {
        return errorResponse('Failed to fetch OTA prices', 500);
    }
}
