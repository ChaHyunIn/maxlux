'use client'
import { useState, useMemo, useRef, useEffect, useId } from 'react'
import { useSettingStore } from '@/stores/settingStore'
import { formatPrice } from '@/lib/utils'
import { useTranslations, useLocale } from 'next-intl'
import { TrendingDown, TrendingUp, Minus, BarChart3 } from 'lucide-react'
import type { DailyRate } from '@/lib/types'
import { LOCALE_DEFAULTS, CHART_CONFIG } from '@/lib/constants'

interface PriceTrendChartProps {
    rates: DailyRate[]
}

const { height: CHART_HEIGHT, padding: CHART_PADDING, trendThreshold: TREND_THRESHOLD } = CHART_CONFIG

export function PriceTrendChart({ rates }: PriceTrendChartProps) {
    const gradientId = useId()
    const { currency } = useSettingStore()
    const t = useTranslations('priceTrend')
    const locale = useLocale()
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const [chartWidth, setChartWidth] = useState(800)

    const chartRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const node = chartRef.current
        if (!node) return
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setChartWidth(entry.contentRect.width)
            }
        })
        resizeObserver.observe(node)
        return () => resizeObserver.disconnect()
    }, [])

    // Filter and prepare data
    const chartData = useMemo(() => {
        return rates
            .filter(r => !r.is_sold_out && r.price_krw > 0)
            .sort((a, b) => a.stay_date.localeCompare(b.stay_date))
            .map(r => ({
                date: r.stay_date,
                price: r.price_krw,
                tag: r.tag,
            }))
    }, [rates])

    // Stats
    const stats = useMemo(() => {
        if (chartData.length === 0) return null
        const prices = chartData.map(d => d.price)
        const min = Math.min(...prices)
        const max = Math.max(...prices)
        const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
        const minDate = chartData.find(d => d.price === min)?.date || ''
        const maxDate = chartData.find(d => d.price === max)?.date || ''

        // Trend: compare first 7 days avg vs last 7 days avg
        const first7 = prices.slice(0, 7)
        const last7 = prices.slice(-7)
        const first7Avg = first7.reduce((a, b) => a + b, 0) / first7.length
        const last7Avg = last7.reduce((a, b) => a + b, 0) / last7.length
        const trendPct = ((last7Avg - first7Avg) / first7Avg) * 100

        return { min, max, avg, minDate, maxDate, trendPct }
    }, [chartData])

    if (chartData.length < 3 || !stats) {
        return null // Not enough data to show a chart
    }

    const innerWidth = chartWidth - CHART_PADDING.left - CHART_PADDING.right
    const innerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom

    const priceRange = stats.max - stats.min || 1
    const pricePadding = priceRange * 0.1
    const yMin = stats.min - pricePadding
    const yMax = stats.max + pricePadding

    const xScale = (i: number) => CHART_PADDING.left + (i / (chartData.length - 1)) * innerWidth
    const yScale = (price: number) => CHART_PADDING.top + innerHeight - ((price - yMin) / (yMax - yMin)) * innerHeight

    // Build path
    const linePath = chartData
        .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i).toFixed(1)} ${yScale(d.price).toFixed(1)}`)
        .join(' ')

    // Area fill
    const areaPath = `${linePath} L ${xScale(chartData.length - 1).toFixed(1)} ${(CHART_PADDING.top + innerHeight).toFixed(1)} L ${CHART_PADDING.left.toFixed(1)} ${(CHART_PADDING.top + innerHeight).toFixed(1)} Z`

    // Y-axis ticks (5 ticks)
    const yTicks = Array.from({ length: 5 }, (_, i) => {
        const price = yMin + (i / 4) * (yMax - yMin)
        return { price: Math.round(price), y: yScale(price) }
    })

    // X-axis labels (show ~5 dates)
    const xLabelStep = Math.max(1, Math.floor(chartData.length / 5))
    const xLabels = chartData
        .map((d, i) => ({ d, i }))
        .filter(({ i }) => i % xLabelStep === 0 || i === chartData.length - 1)
        .map(({ d, i }) => ({
            date: d.date,
            x: xScale(i),
        }))

    const formatDateShort = (dateStr: string) => {
        const d = new Date(dateStr)
        return new Intl.DateTimeFormat(locale, {
            month: 'numeric',
            day: 'numeric',
        }).format(d)
    }

    const formatPriceShort = (price: number) => {
        if (currency === 'USD') return formatPrice(price, 'USD') || ''
        return `${Math.round(price / LOCALE_DEFAULTS.priceUnitManDivisor)}${t('priceUnit')}`
    }

    const hovered = hoveredIndex !== null ? chartData[hoveredIndex] : null

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-slate-500" />
                    {t('title')}
                </h3>
                <div className="flex items-center gap-1.5">
                    {stats.trendPct < -TREND_THRESHOLD && (
                        <span className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
                            <TrendingDown className="w-4 h-4" />
                            {t('trendDown', { pct: Math.abs(stats.trendPct).toFixed(1) })}
                        </span>
                    )}
                    {stats.trendPct > TREND_THRESHOLD && (
                        <span className="flex items-center gap-1 text-sm text-red-600 font-medium">
                            <TrendingUp className="w-4 h-4" />
                            {t('trendUp', { pct: stats.trendPct.toFixed(1) })}
                        </span>
                    )}
                    {stats.trendPct >= -TREND_THRESHOLD && stats.trendPct <= TREND_THRESHOLD && (
                        <span className="flex items-center gap-1 text-sm text-slate-500 font-medium">
                            <Minus className="w-4 h-4" />
                            {t('trendStable')}
                        </span>
                    )}
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 bg-emerald-50 rounded-lg">
                    <div className="text-xs text-emerald-600 font-medium">{t('lowest')}</div>
                    <div className="text-sm font-bold text-emerald-800">{formatPrice(stats.min, currency)}</div>
                    <div className="text-[10px] text-emerald-500">{formatDateShort(stats.minDate)}</div>
                </div>
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500 font-medium">{t('average')}</div>
                    <div className="text-sm font-bold text-slate-700">{formatPrice(stats.avg, currency)}</div>
                </div>
                <div className="text-center p-2 bg-red-50 rounded-lg">
                    <div className="text-xs text-red-600 font-medium">{t('highest')}</div>
                    <div className="text-sm font-bold text-red-800">{formatPrice(stats.max, currency)}</div>
                    <div className="text-[10px] text-red-500">{formatDateShort(stats.maxDate)}</div>
                </div>
            </div>

            {/* Chart */}
            <div ref={chartRef} className="w-full relative">
                <svg
                    width={chartWidth}
                    height={CHART_HEIGHT}
                    className="overflow-visible"
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    {/* Grid lines */}
                    {yTicks.map((tick, i) => (
                        <g key={i}>
                            <line
                                x1={CHART_PADDING.left}
                                y1={tick.y}
                                x2={chartWidth - CHART_PADDING.right}
                                y2={tick.y}
                                stroke="#e2e8f0"
                                strokeDasharray="4 4"
                            />
                            <text
                                x={CHART_PADDING.left - 8}
                                y={tick.y + 4}
                                textAnchor="end"
                                className="text-[10px] fill-slate-400"
                            >
                                {formatPriceShort(tick.price)}
                            </text>
                        </g>
                    ))}

                    {/* Area fill */}
                    <path d={areaPath} fill={`url(#${gradientId})`} opacity={0.3} />

                    {/* Line */}
                    <path d={linePath} fill="none" stroke="#6366f1" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

                    {/* Weekend/holiday markers */}
                    {chartData.map((d, i) => {
                        if (d.tag !== 'SAT' && d.tag !== 'HOL' && d.tag !== 'FRI_EVE') return null
                        return (
                            <circle
                                key={i}
                                cx={xScale(i)}
                                cy={yScale(d.price)}
                                r={3}
                                fill={d.tag === 'HOL' ? '#ef4444' : d.tag === 'SAT' ? '#3b82f6' : '#f59e0b'}
                                stroke="white"
                                strokeWidth={1.5}
                            />
                        )
                    })}

                    {/* X-axis labels */}
                    {xLabels.map((label, i) => (
                        <text
                            key={i}
                            x={label.x}
                            y={CHART_HEIGHT - 8}
                            textAnchor="middle"
                            className="text-[10px] fill-slate-400"
                        >
                            {formatDateShort(label.date)}
                        </text>
                    ))}

                    {/* Hover interaction areas */}
                    {chartData.map((d, i) => (
                        <rect
                            key={i}
                            x={xScale(i) - (innerWidth / chartData.length / 2)}
                            y={CHART_PADDING.top}
                            width={innerWidth / chartData.length}
                            height={innerHeight}
                            fill="transparent"
                            onMouseEnter={() => setHoveredIndex(i)}
                            onTouchStart={() => setHoveredIndex(i)}
                        />
                    ))}

                    {/* Hover indicator */}
                    {hovered && hoveredIndex !== null && (
                        <g>
                            <line
                                x1={xScale(hoveredIndex)}
                                y1={CHART_PADDING.top}
                                x2={xScale(hoveredIndex)}
                                y2={CHART_PADDING.top + innerHeight}
                                stroke="#6366f1"
                                strokeDasharray="4 4"
                                opacity={0.5}
                            />
                            <circle
                                cx={xScale(hoveredIndex)}
                                cy={yScale(hovered.price)}
                                r={5}
                                fill="#6366f1"
                                stroke="white"
                                strokeWidth={2}
                            />
                        </g>
                    )}

                    {/* Gradient definition */}
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Tooltip */}
                {hovered && hoveredIndex !== null && (
                    <div
                        className="absolute pointer-events-none bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg -translate-x-1/2"
                        style={{
                            left: xScale(hoveredIndex),
                            top: yScale(hovered.price) - 48,
                        }}
                    >
                        <div className="font-bold">{formatPrice(hovered.price, currency)}</div>
                        <div className="text-slate-300">{formatDateShort(hovered.date)}</div>
                    </div>
                )}
            </div>
        </div>
    )
}
