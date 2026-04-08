import { getRates } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface Props {
    params: { hotelId: string };
}

export async function GET(_req: Request, { params }: Props) {
    try {
        const rates = await getRates(params.hotelId);
        return NextResponse.json(rates);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch rates' }, { status: 500 });
    }
}
