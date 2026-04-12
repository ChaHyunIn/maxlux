import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getRates } from '@/lib/supabase/queries/rates';
import { isValidUUID } from '@/lib/validation';

interface Props {
    params: Promise<{ hotelId: string }>;
}

export async function GET(_req: Request, { params: paramsPromise }: Props) {
    const params = await paramsPromise;
    if (!isValidUUID(params.hotelId)) {
        return errorResponse('INVALID_PARAMS', 400);
    }

    try {
        const rates = await getRates(params.hotelId);
        return successResponse({ rates });
    } catch {
        return errorResponse('FETCH_FAILED', 500);
    }
}
