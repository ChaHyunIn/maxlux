import { errorResponse, successResponse } from '@/lib/apiResponse';
import { getHotels } from '@/lib/supabase/queries/hotels';

export async function GET() {
    try {
        const hotels = await getHotels();
        return successResponse({ hotels });
    } catch {
        return errorResponse('FETCH_FAILED', 500);
    }
}
