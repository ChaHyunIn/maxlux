'use client';
import { useSettingStore } from '@/stores/settingStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import type { GlobalKey, Locale } from '@/lib/i18nTypes';

export function HeaderActions() {
    const { currency, setCurrency } = useSettingStore();
    const t = useTranslations('settings');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const handleLocaleChange = (newLocale: string | null) => {
        if (newLocale) {
            router.replace(pathname, { locale: newLocale as Locale });
            // Auto-sync currency with locale
            if (newLocale === 'en') setCurrency('USD');
            if (newLocale === 'ko') setCurrency('KRW');
        }
    };

    return (
        <div className="flex items-center gap-3">
            <Select value={locale} onValueChange={handleLocaleChange}>
                <SelectTrigger className="w-[110px] h-9 bg-muted/50 border-none shadow-sm focus:ring-1 transition-all">
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        <SelectValue>
                            {mounted && t(locale as GlobalKey)}
                        </SelectValue>
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ko">{t('ko')}</SelectItem>
                    <SelectItem value="en">{t('en')}</SelectItem>
                </SelectContent>
            </Select>

            <Select value={currency} onValueChange={(v) => v && setCurrency(v as "KRW" | "USD")}>
                <SelectTrigger className="w-[100px] h-9 bg-muted/50 border-none shadow-sm focus:ring-1 transition-all">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <SelectValue>
                            {mounted && t(currency.toLowerCase() as GlobalKey)}
                        </SelectValue>
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="KRW">{t('krw')}</SelectItem>
                    <SelectItem value="USD">{t('usd')}</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
