import { getHotelBySlug } from '@/lib/supabase/queries/hotels';
import { NextResponse } from 'next/server';

interface Props {
    params: { slug: string };
}

export async function GET(_req: Request, { params }: Props) {
    const hotel = await getHotelBySlug(params.slug);
    if (!hotel) {
        return new NextResponse('Not Found', { status: 404 });
    }

    // TODO: Generate OG image using @vercel/og or similar
    return NextResponse.json({ hotel: hotel.name_ko });
}
