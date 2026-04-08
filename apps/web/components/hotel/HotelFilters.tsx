'use client';

import { useFilterStore } from '@/stores/filterStore';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface HotelFiltersProps {
    brands: string[];
}

export function HotelFilters({ brands }: HotelFiltersProps) {
    const { searchQuery, setSearchQuery, brand, setBrand, sortBy, setSortBy } = useFilterStore();

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="호텔 이름 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
            </div>
            <div className="flex gap-4">
                <Select value={brand || "all"} onValueChange={(val) => setBrand(val === "all" ? null : val)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="모든 브랜드" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">모든 브랜드</SelectItem>
                        {brands.map(b => (
                            <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="정렬" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="price_asc">최저가순</SelectItem>
                        <SelectItem value="name_asc">이름순</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
