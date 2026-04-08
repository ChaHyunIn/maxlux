'use client'
import { useTranslations } from 'next-intl';

export function EmptyState() {
    const t = useTranslations('common');

    return (
        <div className="flex items-center justify-center min-h-[40vh]">
            <p className="text-gray-400 text-lg">{t('noResults')}</p>
        </div>
    );
}
