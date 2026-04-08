import type { Metadata } from 'next';
import '../styles/globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

export const metadata: Metadata = {
    title: 'MaxLux - 럭셔리 호텔 최저가 스나이퍼',
    description: 'HotelLux 럭셔리 호텔의 12개월 가격을 히트맵 캘린더로 확인하세요.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
            <body className="font-sans antialiased min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                    <ErrorBoundary>
                        {children}
                    </ErrorBoundary>
                </main>
                <Footer />
            </body>
        </html>
    );
}
