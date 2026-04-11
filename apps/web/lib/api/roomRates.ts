import type { RoomRate } from "../types";

/**
 * Fetches specific room rates for a hotel and stay date.
 */
export async function fetchRoomRates(hotelId: string, stayDate: string): Promise<RoomRate[]> {
    try {
        const res = await fetch(`/api/room-rates?hotelId=${hotelId}&stayDate=${stayDate}`);
        if (!res.ok) return [];
        
        const json = await res.json();
        if (json && typeof json === 'object' && 'data' in json && Array.isArray(json.data)) {
            return json.data;
        }
        return [];
    } catch {
        return [];
    }
}
