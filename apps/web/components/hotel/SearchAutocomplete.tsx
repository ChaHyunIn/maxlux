import { Search, MapPin } from 'lucide-react';
import { useMemo } from 'react';
import type { Hotel } from '@/lib/types';
import { Link } from '@/i18n/navigation';
import { getCityKey } from '@/lib/cityMapper';
import { getBrandKey } from '@/lib/brandMapper';
import { useTranslations } from 'next-intl';

interface AutocompleteItem {
    id: string;
    slug: string;
    name: string;
    city: string;
    brand: string | null;
}

export function SearchAutocomplete({
    query,
    hotels,
    locale,
    onSelect,
    visible,
    onClose,
}: {
    query: string;
    hotels: (Hotel & { min_price?: number })[];
    locale: string;
    onSelect: (name: string) => void;
    visible: boolean;
    onClose: () => void;
}) {
    const tBrand = useTranslations('brand');
    const tCity = useTranslations('city');

    const suggestions = useMemo<AutocompleteItem[]>(() => {
        if (!query.trim() || query.trim().length < 1) return [];
        const lowerQ = query.toLowerCase();
        return hotels
            .filter(h =>
                h.name_ko.toLowerCase().includes(lowerQ) ||
                h.name_en.toLowerCase().includes(lowerQ) ||
                (h.brand && h.brand.toLowerCase().includes(lowerQ))
            )
            .slice(0, 6)
            .map(h => ({
                id: h.id,
                slug: h.slug,
                name: locale === 'en' ? h.name_en : h.name_ko,
                city: h.city,
                brand: h.brand,
            }));
    }, [query, hotels, locale]);

    if (!visible || suggestions.length === 0) return null;

    return (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
            {suggestions.map((item) => (
                <Link
                    key={item.id}
                    href={`/hotels/${item.slug}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer border-b last:border-b-0 border-slate-100"
                    onClick={() => {
                        onSelect(item.name);
                        onClose();
                    }}
                >
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-800 truncate">
                            {item.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            {(() => {
                                const cityKey = getCityKey(item.city);
                                return cityKey && (
                                    <span className="flex items-center text-xs text-slate-400">
                                        <MapPin className="w-3 h-3 mr-0.5" />
                                        {tCity(cityKey)}
                                    </span>
                                );
                            })()}
                            {(() => {
                                const brandKey = item.brand ? getBrandKey(item.brand) : null;
                                return brandKey && (
                                    <span className="text-xs text-slate-400">{tBrand(brandKey)}</span>
                                );
                            })()}
                        </div>
                    </div>
                    <Search className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                </Link>
            ))}
        </div>
    );
}
