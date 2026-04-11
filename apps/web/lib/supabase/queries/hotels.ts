import * as Sentry from '@sentry/nextjs';
import { supabase } from '../anon';
import type { Hotel } from '../../types';

export async function getHotels(): Promise<(Hotel & { min_price?: number })[]> {
    try {
        const { data, error } = await supabase
            .from('hotels_with_min_price')
            .select('*')
            .eq('is_active', true)
            .order('name_en');

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('getHotels error:', error);
        Sentry.captureException(error, { tags: { query: 'getHotels' } });
        throw error;
    }
}

export async function getHotelsByCity(city: string): Promise<(Hotel & { min_price?: number })[]> {
    try {
        const { data, error } = await supabase
            .from('hotels_with_min_price')
            .select('*')
            .eq('is_active', true)
            .eq('city', city)
            .order('name_en');

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('getHotelsByCity error:', error, city);
        Sentry.captureException(error, { tags: { query: 'getHotelsByCity', city } });
        throw error;
    }
}

export async function getHotelBySlug(slug: string): Promise<Hotel | null> {
    try {
        const { data, error } = await supabase
            .from('hotels')
            .select('*')
            .eq('slug', slug)
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('getHotelBySlug error:', error, slug);
        Sentry.captureException(error, { tags: { query: 'getHotelBySlug', slug } });
        return null;
    }
}
