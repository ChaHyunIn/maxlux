import { NextRequest, NextResponse } from 'next/server';
import { createPriceAlert, getActiveAlerts, deactivateAlert } from '@/lib/supabase/server';

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

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        if (target_price <= 0) {
            return NextResponse.json({ error: 'Target price must be positive' }, { status: 400 });
        }

        const alert = await createPriceAlert({
            hotel_id,
            email,
            target_price,
            stay_date_from,
            stay_date_to,
            locale,
        });

        return NextResponse.json({ success: true, alert });
    } catch (error) {
        console.error('Price alert creation error:', error);
        return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const email = req.nextUrl.searchParams.get('email');
    const hotelId = req.nextUrl.searchParams.get('hotelId');

    if (!email) {
        return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    try {
        const alerts = await getActiveAlerts(email, hotelId || undefined);
        return NextResponse.json(alerts);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const alertId = req.nextUrl.searchParams.get('id');

    if (!alertId) {
        return NextResponse.json({ error: 'Missing alert id' }, { status: 400 });
    }

    try {
        await deactivateAlert(parseInt(alertId, 10));
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to deactivate alert' }, { status: 500 });
    }
}
