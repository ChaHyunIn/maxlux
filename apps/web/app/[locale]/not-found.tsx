import { useTranslations } from 'next-intl';

export default function NotFound() {
    const t = useTranslations('common');

    return (
        <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
            <h1 className="text-4xl font-bold">{t('notFoundCode')}</h1>
            <p className="text-gray-500">{t('notFound')}</p>
        </div>
    );
}
