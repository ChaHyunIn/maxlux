'use client'
import { useTranslations } from 'next-intl';

export function ErrorFallback() {
    const t = useTranslations('common');

    return (
        <div className="flex items-center justify-center min-h-[40vh] flex-col gap-4">
            <p className="text-gray-500 text-lg">{t('errorMessage')}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-slate-900 text-white rounded-md">
                {t('refresh')}
            </button>
        </div>
    );
}
