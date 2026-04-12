export const PRICE_COLORS = {
    low: { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: '↓' },
    mid: { bg: 'bg-slate-50', text: 'text-slate-600', icon: '→' },
    high: { bg: 'bg-red-100', text: 'text-red-800', icon: '↑' },
    soldOut: { bg: 'bg-gray-200', text: 'text-gray-400 line-through', icon: '—' },
} as const;

export const MONTHS_TO_SHOW = 12;
export const VIRTUAL_RENDER_RANGE = 1; // current ± 1 month

export const LOCALE_DEFAULTS = {
    exchangeRateUsd: Number(process.env['NEXT_PUBLIC_EXCHANGE_RATE_USD']) || 1400,
    priceUnitManDivisor: 10000,
} as const;

export const REVALIDATE_SECONDS = {
    cityPage: 300,
    hotelDetail: 3600,
    homePage: 300,
} as const;

export const TIME_MS = {
    MINUTE: 60_000,
    HOUR: 3_600_000,
    DAY: 86_400_000,
} as const;

export const FALLBACK_PERCENTILES = {
    p25: 300000,
    p75: 600000,
} as const;

/** Price threshold (KRW) below which a hotel is considered a "hot deal" */
export const HOT_DEAL_THRESHOLD = Number(process.env['NEXT_PUBLIC_HOT_DEAL_THRESHOLD']) || 350000;

export const SUPPORTED_CITIES = ['seoul', 'busan', 'jeju'] as const;

/** Room type codes that are considered standard refundable types */
export const REFUNDABLE_ROOM_TYPES = ['r_nobf', 'r_bf'] as const;

export const PRICE_SUGGESTIONS = {
    KRW: [200000, 250000, 300000, 350000, 400000, 500000],
    USD: [150, 200, 250, 300, 350, 400]
} as const;

export const PRICE_FILTER_RANGES = [
    { value: '0-2000000', labelKey: 'priceAll' },
    { value: '0-300000', labelKey: 'priceUnder300' },
    { value: '300000-500000', labelKey: 'price300to500' },
    { value: '500000-2000000', labelKey: 'priceOver500' },
] as const;

export const DEFAULT_FILTER_PRICE_RANGE: [number, number] = [0, 2000000];

export const STORAGE_KEYS = {
    FAVORITES: 'maxlux_favorites',
    SETTINGS: 'maxlux_settings_v1',
    LEGACY_SETTINGS: 'maxlux-settings',
    VISITED: 'maxlux_visited',
} as const;

export const CHART_CONFIG = {
    height: 200,
    padding: { top: 20, right: 16, bottom: 40, left: 60 },
    trendThreshold: 2.0, // 2% threshold for trend determination
} as const;

export const CHART_COLORS = {
    line: '#6366f1',
    holiday: '#ef4444',
    saturday: '#3b82f6',
    fridayEve: '#f59e0b',
    grid: '#e2e8f0',
} as const;

export const BENEFIT_COLORS: Record<string, string> = {
    credit: 'bg-purple-50 text-purple-600',
    upgrade: 'bg-sky-50 text-sky-600',
    earlyCheckin: 'bg-gray-100 text-gray-600',
    lateCheckout: 'bg-gray-100 text-gray-600',
    exclusive: 'bg-amber-50 text-amber-700',
    amex_fhr: 'bg-indigo-50 text-indigo-600',
    fs_benefit: 'bg-emerald-50 text-emerald-600',
    free: 'bg-purple-50 text-purple-600',
} as const;
