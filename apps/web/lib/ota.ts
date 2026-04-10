/**
 * Shared OTA display mapping for consistency across components.
 * TODO: ota_sources DB 테이블과 연동하여 동적으로 가져오도록 개선 필요.
 */

export const OTA_DISPLAY: Record<string, { nameKey: string; color: string }> = {
    hotellux: { nameKey: 'hotellux', color: 'bg-violet-100 text-violet-800' },
    agoda: { nameKey: 'agoda', color: 'bg-red-100 text-red-800' },
    booking: { nameKey: 'booking', color: 'bg-blue-100 text-blue-800' },
    hotels_com: { nameKey: 'hotels_com', color: 'bg-rose-100 text-rose-800' },
    trip_com: { nameKey: 'trip_com', color: 'bg-sky-100 text-sky-800' },
    expedia: { nameKey: 'expedia', color: 'bg-yellow-100 text-yellow-800' },
};
