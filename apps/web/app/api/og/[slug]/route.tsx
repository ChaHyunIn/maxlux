import { ImageResponse } from 'next/og';
import { getHotelName } from '@/lib/hotelUtils';
import { getHotelBySlug } from '@/lib/supabase/queries/hotels';

export const runtime = 'edge';

interface Props {
    params: Promise<{ slug: string }>;
}

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
                    {/* Decorative Elements */}
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
                            Price Trends Explorer
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
                        <div style={{ display: 'flex' }}>Luxury Hotel Price Sniper</div>
                        <div style={{ display: 'flex' }}>maxlux.co</div>
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
