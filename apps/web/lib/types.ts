export type Tag = 'SAT' | 'FRI_EVE' | 'HOL' | 'SUN' | 'WEEKDAY';

export interface Benefit {
    name?: string;
    type?: string;
    [key: string]: unknown;
}

export interface Hotel {
    id: string;
    name_ko: string;
    name_en: string;
    slug: string;
    city: string;
    brand: string | null;
    image_url: string | null;
    benefits: (string | Benefit)[];
    benefit_value_krw: number;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
}

export interface DailyRate {
    id: number;
    hotel_id: string;
    stay_date: string;
    price_krw: number;
    room_type: string;
    tag: Tag;
    is_sold_out: boolean;
    scraped_at: string;
}

export interface OtaPrice {
    id: number;
    hotel_id: string;
    stay_date: string;
    source: string;
    price_krw: number;
    room_type: string;
    url: string | null;
}

export interface PricePercentiles {
    p25: number;
    p75: number;
}
