import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { hotel_id, email, target_price, stay_date_from, stay_date_to, locale } = body;

        if (!hotel_id || !email || !target_price) {
            return NextResponse.json(
                { error: 'Missing required fields: hotel_id, email, target_price' },
                { status: 400 }
            );
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        // Price must be positive
        if (target_price <= 0) {
            return NextResponse.json({ error: 'Target price must be positive' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('price_alerts')
            .upsert(
                {
                    hotel_id,
                    email: email.toLowerCase().trim(),
                    target_price,
                    stay_date_from: stay_date_from || null,
                    stay_date_to: stay_date_to || null,
                    locale: locale || 'ko',
                    is_active: true,
                },
                { onConflict: 'hotel_id,email,target_price' }
            )
            .select()
            .single();

        if (error) {
            console.error('Price alert creation error:', error);
            return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
        }

        return NextResponse.json({ success: true, alert: data });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

export async function GET(req: NextRequest) {
    const email = req.nextUrl.searchParams.get('email');
    const hotelId = req.nextUrl.searchParams.get('hotelId');

    if (!email) {
        return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    let query = supabase
        .from('price_alerts')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (hotelId) {
        query = query.eq('hotel_id', hotelId);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
    const alertId = req.nextUrl.searchParams.get('id');

    if (!alertId) {
        return NextResponse.json({ error: 'Missing alert id' }, { status: 400 });
    }

    const { error } = await supabase
        .from('price_alerts')
        .update({ is_active: false })
        .eq('id', parseInt(alertId, 10));

    if (error) {
        return NextResponse.json({ error: 'Failed to deactivate alert' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
