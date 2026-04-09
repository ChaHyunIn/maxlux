import { getRates } from '@/lib/supabase/queries/rates';
import { successResponse, errorResponse } from '@/lib/apiResponse';

interface Props {
    params: { hotelId: string };
}

export async function GET(_req: Request, { params }: Props) {
    try {
        const rates = await getRates(params.hotelId);
        return successResponse({ rates });
    } catch (error) {
        console.error('API Error: Failed to fetch rates:', error);
        return errorResponse('Failed to fetch rates', 500);
    }
}
