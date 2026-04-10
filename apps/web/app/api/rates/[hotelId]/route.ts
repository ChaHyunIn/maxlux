import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getRates } from '@/lib/supabase/queries/rates';

interface Props {
    params: Promise<{ hotelId: string }>;
}

export async function GET(_req: Request, { params: paramsPromise }: Props) {
    const params = await paramsPromise;
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_REGEX.test(params.hotelId)) {
        return errorResponse('INVALID_PARAMS', 400);
    }

    try {
        const rates = await getRates(params.hotelId);
        return successResponse({ rates });
    } catch {
        return errorResponse('FETCH_FAILED', 500);
    }
}
