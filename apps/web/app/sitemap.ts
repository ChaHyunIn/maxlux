import { routing } from '@/i18n/routing';
import { SUPPORTED_CITIES } from '@/lib/constants';
import { supabase } from '@/lib/supabase/anon';
import type { MetadataRoute } from 'next';

const DOMAIN = process.env['NEXT_PUBLIC_SITE_URL'] || 'https://maxlux.kr';
const LOCALES = routing.locales;

export function generateSitemaps() {
    return LOCALES.map((locale) => ({ id: locale }));
}

export default async function sitemap({ id: locale }: { id: string }): Promise<MetadataRoute.Sitemap> {
    // Fetch hotel slugs for detail pages
    const { data: hotels, error } = await supabase
        .from('hotels')
        .select('slug, city, latest_scraped_at')
        .eq('is_active', true);

    if (error) {
        console.error(`Sitemap hotel fetch error for ${locale}:`, error);
    }

    const entries: MetadataRoute.Sitemap = [];

    // Current date and next 11 months for landing pages
    const now = new Date();
    const months = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    });

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
        const baseUrl = `${DOMAIN}/${locale}/hotels/${hotel.slug}`;
        
        // Main detail page
        const mainEntry: MetadataRoute.Sitemap[number] = {
            url: baseUrl,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        };
        if (hotel.latest_scraped_at) {
            mainEntry.lastModified = new Date(hotel.latest_scraped_at);
        }
        entries.push(mainEntry);

        // Monthly landing pages
        for (const month of months) {
            entries.push({
                url: `${baseUrl}/${month}`,
                changeFrequency: 'weekly',
                priority: 0.6,
            });
        }
    }

    return entries;
}
