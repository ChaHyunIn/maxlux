import { routing } from '@/i18n/routing';
import { SUPPORTED_CITIES } from '@/lib/constants';
import { supabase } from '@/lib/supabase/anon';
import type { MetadataRoute } from 'next';

const DOMAIN = process.env['NEXT_PUBLIC_SITE_URL'] || 'https://maxlux.kr';
const LOCALES = routing.locales;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

    // Fetch hotel slugs for detail pages
    const { data: hotels, error } = await supabase
        .from('hotels')
        .select('slug, city, latest_scraped_at')
        .eq('is_active', true);

    if (error) {
        console.error('Sitemap hotel fetch error:', error);
    }

    const entries: MetadataRoute.Sitemap = [];

    for (const locale of LOCALES) {
        // Home page
        entries.push({
            url: `${DOMAIN}/${locale}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        });

        // City landing pages
        for (const city of SUPPORTED_CITIES) {
            entries.push({
                url: `${DOMAIN}/${locale}/${city}`,
                changeFrequency: 'daily',
                priority: 0.9,
            });
        }

        // Hotel detail pages
        for (const hotel of hotels || []) {
            const entry: MetadataRoute.Sitemap[number] = {
                url: `${DOMAIN}/${locale}/hotels/${hotel.slug}`,
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            };
            if (hotel.latest_scraped_at) {
                entry.lastModified = new Date(hotel.latest_scraped_at);
            }
            entries.push(entry);
        }
    }

    return entries;
}
