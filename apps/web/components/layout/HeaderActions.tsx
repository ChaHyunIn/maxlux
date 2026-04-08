'use client';
import { useSettingStore } from '@/stores/settingStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

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
            router.replace(pathname, { locale: newLocale as any });
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
                        <SelectValue />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ko">한국어</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                </SelectContent>
            </Select>

            <Select value={currency} onValueChange={(v) => v && setCurrency(v as "KRW" | "USD")}>
                <SelectTrigger className="w-[100px] h-9 bg-muted/50 border-none shadow-sm focus:ring-1 transition-all">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <SelectValue />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="KRW">KRW (₩)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
