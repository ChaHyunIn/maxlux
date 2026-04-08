/**
 * Centralized city name display mapping.
 * Used in both HotelCard and HotelHeroHeader.
 */

const CITY_DISPLAY_MAP: Record<string, string> = {
    seoul: '서울',
    busan: '부산',
    jeju: '제주',
};

export function getCityDisplayName(citySlug: string): string {
    return CITY_DISPLAY_MAP[citySlug.toLowerCase()] || citySlug;
}
