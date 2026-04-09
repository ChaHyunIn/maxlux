import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://maxlux.kr';
const LOCALES = ['ko', 'en'];
const CITIES = ['seoul', 'busan', 'jeju'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch hotel slugs for detail pages
    const { data: hotels } = await supabase
        .from('hotels')
        .select('slug, city')
        .eq('is_active', true);

    const entries: MetadataRoute.Sitemap = [];

    for (const locale of LOCALES) {
        // Home page
        entries.push({
            url: `${DOMAIN}/${locale}`,
            changeFrequency: 'daily',
            priority: 1.0,
        });

        // City landing pages
        for (const city of CITIES) {
            entries.push({
                url: `${DOMAIN}/${locale}/${city}`,
                changeFrequency: 'daily',
                priority: 0.9,
            });
        }

        // Hotel detail pages
        for (const hotel of hotels || []) {
            entries.push({
                url: `${DOMAIN}/${locale}/hotels/${hotel.slug}`,
                changeFrequency: 'weekly',
                priority: 0.8,
            });
        }
    }

    return entries;
}
