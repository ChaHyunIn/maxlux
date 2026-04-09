export const PRICE_COLORS = {
    low: { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: '↓' },
    mid: { bg: 'bg-slate-50', text: 'text-slate-600', icon: '→' },
    high: { bg: 'bg-red-100', text: 'text-red-800', icon: '↑' },
    soldOut: { bg: 'bg-gray-200', text: 'text-gray-400 line-through', icon: '—' },
} as const;

export const MONTHS_TO_SHOW = 12;
export const VIRTUAL_RENDER_RANGE = 1; // current ± 1 month

export const LOCALE_DEFAULTS = {
    exchangeRateUsd: 1400,
    priceUnitManDivisor: 10000,
} as const;

export const FALLBACK_PERCENTILES = {
    p25: 300000,
    p75: 600000,
} as const;

/** Price threshold (KRW) below which a hotel is considered a "hot deal" */
export const HOT_DEAL_THRESHOLD = 350000;

export const SUPPORTED_CITIES = ['seoul', 'busan', 'jeju'] as const;

/** Room type codes that are considered standard refundable types */
export const REFUNDABLE_ROOM_TYPES = ['r_nobf', 'r_bf'] as const;

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
