'use client'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFilterStore } from "@/stores/filterStore"

export function HotelFilters({ brands }: { brands: string[] }) {
    const { searchQuery, selectedBrand, sortBy, setSearchQuery, setSelectedBrand, setSortBy } = useFilterStore();

    return (
        <div className="flex flex-wrap gap-4 mb-6">
            <Input
                placeholder="호텔명 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 bg-white"
            />
            <Select value={selectedBrand} onValueChange={(val) => setSelectedBrand(val || "all")}>
                <SelectTrigger className="w-full sm:w-48 bg-white">
                    <SelectValue placeholder="브랜드 선택" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">전체 브랜드</SelectItem>
                    {brands.map(brand => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(val) => setSortBy((val as 'price' | 'name') || 'price')}>
                <SelectTrigger className="w-full sm:w-48 bg-white">
                    <SelectValue placeholder="정렬 방식" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="price">최저가순</SelectItem>
                    <SelectItem value="name">이름순</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
