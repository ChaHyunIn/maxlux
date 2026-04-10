export type BrandKey =
    | 'four_seasons'
    | 'lhw'
    | 'fairmont'
    | 'peninsula'
    | 'rosewood'
    | 'marriott'
    | 'jw_marriott'
    | 'mondrian'
    | 'park_hyatt'
    | 'josun_palace'
    | 'intercontinental'
    | 'shilla'
    | 'grand_hyatt'
    | 'conrad'
    | 'sofitel'
    | 'andaz'
    | 'novotel'
    | 'voco'
    | 'mgallery'
    | 'westin'
    | 'luxury_collection'
    | 'slh'
    | 'others'

export type CityKey =
    | 'seoul'
    | 'busan'
    | 'jeju'

export type BenefitKey =
    | 'exclusive'
    | 'free'
    | 'amex_fhr'
    | 'fs_benefit'
    | 'credit'
    | 'upgrade'
    | 'earlyCheckin'
    | 'lateCheckout'

export type ApiTermKey =
    | 'kingBed' | 'twinBed' | 'singleBed' | 'suite' | 'standard' | 'superior' | 'deluxe' | 'executive'
    | 'premium' | 'presidential' | 'oceanView' | 'riverView' | 'lakeView' | 'mountainView' | 'cityView'
    | 'gardenView' | 'view' | 'noWindow' | 'oneBedroom' | 'twoBedroom' | 'threeBedroom' | 'room'
    | 'breakfast2' | 'breakfast1' | 'roomOnly' | 'breakfastInc' | 'included' | 'breakfast'
    | 'memberExclusive' | 'memberRate' | 'member' | 'specialOffer' | 'promotion' | 'consecutive'
    | 'earlyBird' | 'special' | 'benefit' | 'free' | 'cancel' | 'flexible' | 'non' | 'prepaid'

export type DayDetailKey =
    | 'nonRefundable' | 'soldOut' | 'tagSAT' | 'tagFRI_EVE' | 'tagHOL' | 'tagHOL_EVE' | 'tagSUN' | 'tagWEEKDAY'
    | 'levelLow' | 'levelHigh' | 'levelMid' | 'refundable' | 'scrapedAt'

export type GlobalKey =
    | 'ko' | 'en' | 'krw' | 'usd'

export type Locale = 'ko' | 'en'

export type SortByKey = 'price' | 'name' | 'discount' | 'benefit'

export type TimeKey =
    | 'unknown' | 'justNow' | 'minutesAgo' | 'hoursAgo' | 'daysAgo' | 'monthDayFormat'

/**
 * Type guards for i18n types
 */
export function isLocale(val: unknown): val is Locale {
    return val === 'ko' || val === 'en';
}

export function isGlobalKey(val: unknown): val is GlobalKey {
    return typeof val === 'string' && ['ko', 'en', 'krw', 'usd'].includes(val);
}

export function isSortByKey(val: unknown): val is SortByKey {
    return typeof val === 'string' && ['price', 'name', 'discount', 'benefit'].includes(val);
}

export function isDayDetailKey(val: unknown): val is DayDetailKey {
    return typeof val === 'string' && [
        'nonRefundable', 'soldOut', 'tagSAT', 'tagFRI_EVE', 'tagHOL', 'tagHOL_EVE', 'tagSUN', 'tagWEEKDAY',
        'levelLow', 'levelHigh', 'levelMid', 'refundable', 'scrapedAt'
    ].includes(val);
}
