'use client'
import { useTranslations } from 'next-intl';

export default function Footer() {
    const t = useTranslations('layout');

    return (
        <footer className="border-t border-slate-200 mt-8">
            <div className="max-w-7xl mx-auto px-4 py-8 text-center">
                <p className="text-sm text-gray-400">{t('copyright')}</p>
                <p className="text-xs text-gray-300">{t('disclaimer')}</p>
                <p className="text-xs text-gray-300">{t('dataSource')}</p>
            </div>
        </footer>
    );
}
