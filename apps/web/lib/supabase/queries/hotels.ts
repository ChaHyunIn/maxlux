import { supabase } from '../anon';
import type { Hotel } from '../../types';

export async function getHotels(): Promise<(Hotel & { min_price?: number })[]> {
    const { data, error } = await supabase
        .from('hotels_with_min_price')
        .select('*')
        .eq('is_active', true)
        .order('name_en');

    if (error) throw error;
    return data as (Hotel & { min_price?: number })[];
}

export async function getHotelsByCity(city: string): Promise<(Hotel & { min_price?: number })[]> {
    const { data, error } = await supabase
        .from('hotels_with_min_price')
        .select('*')
        .eq('is_active', true)
        .eq('city', city)
        .order('name_en');

    if (error) throw error;
    return data as (Hotel & { min_price?: number })[];
}

export async function getHotelBySlug(slug: string): Promise<Hotel | null> {
    const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('slug', slug)
        .single();
    if (error) return null;
    return data;
}
