'use client';

import { useSettingStore } from '@/stores/settingStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';

export function HeaderActions() {
    const { language, currency, setLanguage, setCurrency } = useSettingStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    return (
        <div className="flex items-center gap-3">
            <Select value={language} onValueChange={(v: any) => setLanguage(v)}>
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

            <Select value={currency} onValueChange={(v: any) => setCurrency(v)}>
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
