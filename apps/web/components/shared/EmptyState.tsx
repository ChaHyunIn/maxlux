'use client'
import { useTranslations } from 'next-intl';

export function EmptyState() {
    const t = useTranslations('common');

    return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-2">
            <p className="text-gray-400 text-lg">{t('noResults')}</p>
            <p className="sr-only">현재 해당 지역 호텔 데이터가 없습니다.</p>
        </div>
    );
}
