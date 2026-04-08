import { NextRequest, NextResponse } from 'next/server';
import { getOtaPrices } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
    const hotelId = req.nextUrl.searchParams.get('hotelId');
    const stayDate = req.nextUrl.searchParams.get('stayDate');

    if (!hotelId || !stayDate) {
        return NextResponse.json({ error: 'Missing hotelId or stayDate' }, { status: 400 });
    }

    const prices = await getOtaPrices(hotelId, stayDate);
    return NextResponse.json(prices);
}
