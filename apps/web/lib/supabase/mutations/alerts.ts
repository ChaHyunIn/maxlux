import * as Sentry from '@sentry/nextjs';
import { adminSupabase } from '../admin';

export async function createPriceAlert(data: {
    hotel_id: string;
    email: string;
    target_price: number;
    stay_date_from?: string | null;
    stay_date_to?: string | null;
    locale?: string;
    currency?: 'KRW' | 'USD';
}) {
    try {
        const { data: result, error } = await adminSupabase
            .from('price_alerts')
            .upsert(
                {
                    hotel_id: data.hotel_id,
                    email: data.email.toLowerCase().trim(),
                    target_price: data.target_price,
                    stay_date_from: data.stay_date_from || null,
                    stay_date_to: data.stay_date_to || null,
                    locale: data.locale || 'ko',
                    is_active: true,
                    currency: data.currency || 'KRW',
                },
                { onConflict: 'hotel_id,email,target_price' }
            )
            .select()
            .single();

        if (error) throw error;
        return result;
    } catch (error) {
        // eslint-disable-next-line no-console
        if (process.env.NODE_ENV === 'development') console.error('[Supabase]', error);
        Sentry.captureException(error, {
            tags: { mutation: 'createPriceAlert', hotelId: data.hotel_id },
            extra: { email: '[REDACTED]' }
        });
        throw error;
    }
}

export async function getActiveAlerts(email: string, hotelId?: string) {
    try {
        // Uses service role key because RLS might prevent anon from reading others emails.
        let query = adminSupabase
            .from('price_alerts')
            .select('*, hotels(name_ko, name_en)')
            .eq('email', email.toLowerCase().trim())
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (hotelId) {
            query = query.eq('hotel_id', hotelId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    } catch (error) {
        // eslint-disable-next-line no-console
        if (process.env.NODE_ENV === 'development') console.error('[Supabase]', error);
        Sentry.captureException(error, {
            tags: { query: 'getActiveAlerts', hotelId },
            extra: { email: '[REDACTED]' }
        });
        throw error;
    }
}

export async function deactivateAlert(alertId: number, email: string) {
    try {
        const { error, count } = await adminSupabase
            .from('price_alerts')
            .update({ is_active: false })
            .eq('id', alertId)
            .eq('email', email)
            .select();

        if (error) {
            throw error;
        }
        return count;
    } catch (error) {
        // eslint-disable-next-line no-console
        if (process.env.NODE_ENV === 'development') console.error('[Supabase]', error);
        Sentry.captureException(error, {
            tags: { mutation: 'deactivateAlert', alertId: String(alertId) },
            extra: { email: '[REDACTED]' }
        });
        throw error;
    }
}
