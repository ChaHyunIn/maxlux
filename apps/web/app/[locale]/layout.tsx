import { Analytics } from '@vercel/analytics/react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import '@/styles/globals.css';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'MaxLux',
    description: 'Luxury Hotel Price Tracker',
};

export default async function LocaleLayout({
    children,
    params: { locale }
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
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
