'use client'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFilterStore } from "@/stores/filterStore"
import { useTranslations } from 'next-intl';

export function HotelFilters({ brands }: { brands: string[] }) {
    const { searchQuery, selectedBrand, sortBy, setSearchQuery, setSelectedBrand, setSortBy } = useFilterStore();
    const t = useTranslations('hotel');

    return (
        <div className="flex flex-wrap gap-4 mb-6">
            <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 bg-white"
            />
            <Select value={selectedBrand} onValueChange={(val) => setSelectedBrand(val || "all")}>
                <SelectTrigger className="w-full sm:w-48 bg-white">
                    <SelectValue placeholder={t('allBrands')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t('allBrands')}</SelectItem>
                    {brands.map(brand => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(val) => setSortBy((val as 'price' | 'name' | 'discount') || 'price')}>
                <SelectTrigger className="w-full sm:w-48 bg-white">
                    <SelectValue placeholder={t('sortByPrice')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="price">{t('sortByPrice')}</SelectItem>
                    <SelectItem value="name">{t('sortByName')}</SelectItem>
                    <SelectItem value="discount">{t('sortByDiscount')}</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
