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
