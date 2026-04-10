import { getHotelBySlug } from '@/lib/supabase/queries/hotels';
import { getHotelName } from '@/lib/hotelUtils';
import { NextResponse } from 'next/server';

interface Props {
    params: { slug: string };
}

export async function GET(req: Request, { params }: Props) {
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get('locale') || 'ko';

    const hotel = await getHotelBySlug(params.slug);
    if (!hotel) {
        return new NextResponse('NOT_FOUND', { status: 404 });
    }

    const name = getHotelName(hotel, locale);

    // TODO: Generate OG image using @vercel/og or similar
    return NextResponse.json({ hotel: name });
}
