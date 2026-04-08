import { NextRequest, NextResponse } from 'next/server';
import { getPriceChanges } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
    const hotelId = req.nextUrl.searchParams.get('hotelId');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20', 10);

    if (!hotelId) {
        return NextResponse.json({ error: 'Missing hotelId' }, { status: 400 });
    }

    const changes = await getPriceChanges(hotelId, limit);
    return NextResponse.json(changes);
}
