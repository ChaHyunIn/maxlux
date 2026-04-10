import { Analytics } from '@vercel/analytics/react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import '@/styles/globals.css';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import type { Metadata } from 'next';

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

    return (
        <html lang={locale}>
            <body>
                <NextIntlClientProvider messages={messages}>
                    <ErrorBoundary>
                        {children}
                        <Analytics />
                    </ErrorBoundary>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
