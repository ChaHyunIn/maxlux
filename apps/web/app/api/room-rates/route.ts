import { NextRequest, NextResponse } from 'next/server';
import { getRoomRates } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
    const hotelId = req.nextUrl.searchParams.get('hotelId');
    const stayDate = req.nextUrl.searchParams.get('stayDate');

    if (!hotelId || !stayDate) {
        return NextResponse.json({ error: 'hotelId and stayDate are required' }, { status: 400 });
    }

    try {
        const data = await getRoomRates(hotelId, stayDate);
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch room rates' }, { status: 500 });
    }
}
