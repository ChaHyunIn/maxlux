import { ImageResponse } from 'next/og';
import { getHotelName } from '@/lib/hotelUtils';
import { getHotelBySlug } from '@/lib/supabase/queries/hotels';

export const runtime = 'edge';

interface Props {
    params: Promise<{ slug: string }>;
}

/**
 * ⚠️  아래 텍스트는 messages/ko.json → og.subtitle / og.tagline 과 반드시 동기화되어야 합니다.
 *     Edge Runtime 제약으로 next-intl 서버 API를 사용할 수 없어 하드코딩합니다.
 */
const OG_TEXT: Record<string, { subtitle: string; tagline: string }> = {
    ko: { subtitle: '가격 추이 탐색기', tagline: '럭셔리 호텔 최저가 스나이퍼' },
    en: { subtitle: 'Price Trends Explorer', tagline: 'Luxury Hotel Price Sniper' },
};

const DOMAIN = process.env['NEXT_PUBLIC_SITE_URL']
    ? new URL(process.env['NEXT_PUBLIC_SITE_URL']).hostname
    : 'maxlux.co';

export async function GET(req: Request, { params: paramsPromise }: Props) {
    try {
        const params = await paramsPromise;
        const { searchParams } = new URL(req.url);
        const locale = searchParams.get('locale') || 'ko';

        const hotel = await getHotelBySlug(params.slug);
        if (!hotel) {
            return new Response('Not Found', { status: 404 });
        }

        const name = getHotelName(hotel, locale);
        const text = OG_TEXT[locale] || OG_TEXT['en'];

        if (!text) {
            return new Response('Configuration Error', { status: 500 });
        }

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#0f172a',
                        backgroundImage: 'linear-gradient(to bottom right, #0f172a, #064e3b)',
                        position: 'relative',
                        fontFamily: 'sans-serif',
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: 40,
                        left: 40,
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '8px 20px',
                        borderRadius: '100px',
                        fontSize: 24,
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                    }}>
                        MaxLux
                    </div>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 20,
                        padding: '0 80px',
                        textAlign: 'center',
                    }}>
                        <div style={{
                            color: '#10b981',
                            fontSize: 32,
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                        }}>
                            {text.subtitle}
                        </div>
                        <div style={{
                            color: 'white',
                            fontSize: 72,
                            fontWeight: 800,
                            lineHeight: 1.1,
                            wordBreak: 'keep-all',
                        }}>
                            {name}
                        </div>
                    </div>

                    <div style={{
                        position: 'absolute',
                        bottom: 40,
                        left: 40,
                        right: 40,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: '#94a3b8',
                        fontSize: 24,
                    }}>
                        <div style={{ display: 'flex' }}>{text.tagline}</div>
                        <div style={{ display: 'flex' }}>{DOMAIN}</div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e: unknown) {
        return new Response(`Failed to generate the image: ${e instanceof Error ? e.message : 'Unknown error'}`, {
            status: 500,
        });
    }
}
