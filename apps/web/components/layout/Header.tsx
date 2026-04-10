'use client'
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { HeaderActions } from './HeaderActions';

export default function Header() {
    const t = useTranslations('layout');
    
    return (
        <header className="border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold text-blue-600">
                    {t('brandName')}
                </Link>
                <HeaderActions />
            </div>
        </header>
    );
}
