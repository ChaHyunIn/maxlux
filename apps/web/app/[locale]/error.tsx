'use client';
import { useTranslations } from 'next-intl';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const t = useTranslations('common');

    return (
        <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
            <h2 className="text-2xl font-bold">{t('errorOccurred')}</h2>
            <p className="text-gray-500">{error.message}</p>
            <button onClick={reset} className="px-4 py-2 bg-black text-white rounded-md">
                {t('retry')}
            </button>
        </div>
    );
}
