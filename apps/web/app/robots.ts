import type { MetadataRoute } from 'next';

const DOMAIN = process.env['NEXT_PUBLIC_SITE_URL'] || 'https://maxlux.kr';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/'],
            },
        ],
        sitemap: `${DOMAIN}/sitemap.xml`,
    };
}
