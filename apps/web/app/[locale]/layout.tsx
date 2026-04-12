import { Playfair_Display, Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import '@/styles/globals.css';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { StoreInitializer } from '@/components/shared/StoreInitializer';
import { getExchangeRate } from '@/lib/api/currency';
import type { Metadata } from 'next';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const playfair = Playfair_Display({
    subsets: ['latin'],
    weight: ['600', '700', '800'],
    variable: '--font-playfair',
    display: 'swap',
});

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await props.params;
    const tSeo = await getTranslations({ locale, namespace: 'seo' });
    return {
        title: tSeo('metaTitle'),
        description: tSeo('metaDescription'),
    };
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const messages = await getMessages();
    const { rate } = await getExchangeRate();

    return (
        <html lang={locale} className={`${inter.variable} ${playfair.variable}`}>
            <body>
                <NextIntlClientProvider messages={messages}>
                    <StoreInitializer exchangeRate={rate} />
                    <ErrorBoundary>
                        {children}
                        <Analytics />
                    </ErrorBoundary>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
