'use client'
import { useTranslations } from 'next-intl';

export function EmptyState() {
    const t = useTranslations('common');

    return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-2">
            <p className="text-gray-400 text-lg">{t('noResults')}</p>
            <p className="sr-only">{t('noResultsDetail')}</p>
        </div>
    );
}
