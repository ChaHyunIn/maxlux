import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getRates } from '@/lib/supabase/queries/rates';

interface Props {
    params: { hotelId: string };
}

export async function GET(_req: Request, { params }: Props) {
    try {
        const rates = await getRates(params.hotelId);
        return successResponse({ rates });
    } catch {
        return errorResponse('FETCH_FAILED', 500);
    }
}
