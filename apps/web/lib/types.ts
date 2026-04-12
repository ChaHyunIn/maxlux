export type Tag = 'SAT' | 'FRI_EVE' | 'HOL' | 'HOL_EVE' | 'SUN' | 'WEEKDAY';

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
    booking_url: string | null;
    latest_scraped_at?: string;
    min_price_refundable?: number;
    recent_drops?: number;
}

export interface PriceChange {
    id: number;
    hotel_id: string;
    stay_date: string;
    room_type: string;
    source: string;
    old_price: number | null;
    new_price: number;
    changed_at: string;
}

export interface DailyRate {
    id: number;
    hotel_id: string;
    stay_date: string;
    price_krw: number;
    room_type: string;
    tag: Tag;
    is_refundable: boolean;
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
    refund_policy?: string;
}

export interface PricePercentiles {
    p25: number;
    p75: number;
}

export interface PriceAlert {
    id: number;
    hotel_id: string;
    email: string;
    target_price: number;
    stay_date_from: string | null;
    stay_date_to: string | null;
    is_active: boolean;
    triggered_at: string | null;
    created_at: string;
}

export interface RoomRate {
    id: number;
    hotel_id: string;
    stay_date: string;
    source: string;
    room_id: string | null;
    room_name: string;
    room_name_en: string | null;
    room_img: string | null;
    bed_type: string | null;
    room_size: number | null;
    room_capacity: number | null;
    room_view: string | null;
    rate_code: string;
    rate_name: string;
    rate_name_en: string | null;
    price_krw: number;
    price_base_krw: number | null;
    price_tax_krw: number | null;
    price_usd: number | null;
    price_cny: number | null;
    price_jpy: number | null;
    is_refundable: boolean;
    cancel_deadline: string | null;
    has_breakfast: boolean;
    benefit_code: string | null;
    benefit_type: string | null;
    benefit_tags: string[];
    benefit_desc: string | null;
    is_sold_out: boolean;
    scraped_at: string;
}
