import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '../../styles/globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
    title: 'MaxLux - 럭셔리 호텔 최저가 스나이퍼',
    description: 'HotelLux 럭셔리 호텔의 12개월 가격을 히트맵 캘린더로 확인하세요.',
};

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const { locale } = params;

    if (!routing.locales.includes(locale as any)) {
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
