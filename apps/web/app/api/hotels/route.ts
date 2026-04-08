import { getHotels } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const hotels = await getHotels();
        return NextResponse.json(hotels);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch hotels' }, { status: 500 });
    }
}
