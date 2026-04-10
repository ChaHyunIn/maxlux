import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '../../styles/globals.css';
import { Analytics } from '@vercel/analytics/react';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
    const t = await getTranslations({ locale: params.locale, namespace: 'seo' });
    return {
        title: t('metaTitle'),
        description: t('metaDescription'),
    };
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const { locale } = params;
    const isSupported = routing.locales.some(l => l === locale);
    if (!isSupported) {
        notFound();
    }

    setRequestLocale(locale);

    const messages = await getMessages();

    return (
        <html lang={locale}>
            <head>
                <link
                    rel="stylesheet"
                    as="style"
                    crossOrigin="anonymous"
                    href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
                />
            </head>
            <body className="font-sans antialiased min-h-screen flex flex-col">
                <NextIntlClientProvider messages={messages}>
                    <Header />
                    <main className="flex-1">
                        <ErrorBoundary>{children}</ErrorBoundary>
                    </main>
                    <Footer />
                    <Analytics />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
