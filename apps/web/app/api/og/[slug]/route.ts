import { getHotelBySlug } from '@/lib/supabase/queries/hotels';
import { NextResponse } from 'next/server';

interface Props {
    params: { slug: string };
}

export async function GET(req: Request, { params }: Props) {
    const hotel = await getHotelBySlug(params.slug);
    if (!hotel) {
        return new NextResponse('NOT_FOUND', { status: 404 });
    }

    // Default to name_ko but try to find the best match (simplified for now)
    const name = hotel.name_en || hotel.name_ko;

    // TODO: Generate OG image using @vercel/og or similar
    return NextResponse.json({ hotel: name });
}
