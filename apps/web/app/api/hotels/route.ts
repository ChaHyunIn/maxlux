import { getHotels } from '@/lib/supabase/queries/hotels';
import { errorResponse, successResponse } from '@/lib/apiResponse';

export async function GET() {
    try {
        const hotels = await getHotels();
        return successResponse({ hotels });
    } catch {
        return errorResponse('FETCH_FAILED', 500);
    }
}
