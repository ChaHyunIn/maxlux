import { errorResponse, successResponse } from '@/lib/apiResponse';
import { getHotelName } from '@/lib/hotelUtils';
import { getHotelBySlug } from '@/lib/supabase/queries/hotels';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function GET(req: Request, { params: paramsPromise }: Props) {
    const params = await paramsPromise;
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get('locale') || 'ko';

    const hotel = await getHotelBySlug(params.slug);
    if (!hotel) {
        return errorResponse('NOT_FOUND', 404);
    }

    const name = getHotelName(hotel, locale);

    // TODO: @vercel/og 패키지를 설치하고 ImageResponse로 OG 이미지 생성.
    // 현재는 호텔 이름 JSON만 반환하는 placeholder 상태.
    // 실제 OG 이미지가 필요하지 않으면 이 라우트 삭제 고려.
    return successResponse({ hotel: name });
}
