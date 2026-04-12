'use client'

import { useMemo } from 'react'
import { TrendingDown, Calendar, Hash, ArrowDown } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { formatPrice } from '@/lib/utils'
import { useSettingStore } from '@/stores/settingStore'
import type { DailyRate, PriceChange } from '@/lib/types'

/**
 * PriceSummaryCard 컴포넌트
 * 
 * 호텔의 전체 가격 데이터를 분석하여 최저가, 평균가, 최근 변동성, 
 * 그리고 주간 가격 패턴 정보를 4칸 그리드로 요약하여 보여줍니다.
 */

interface PriceSummaryCardProps {
    rates: DailyRate[]
    changes: PriceChange[]
}

export default function PriceSummaryCard({ rates, changes }: PriceSummaryCardProps) {
    const t = useTranslations('priceSummary')
    const locale = useLocale()
    const { currency, exchangeRate } = useSettingStore()

    const stats = useMemo(() => {
        const activeRates = rates.filter(r => !r.is_sold_out && r.price_krw > 0)
        if (activeRates.length === 0) return null

        // 1. 최저가 정보 추출
        const lowestRes = activeRates.reduce((prev, curr) => 
            curr.price_krw < prev.price_krw ? curr : prev
        )

        // 2. 평균가 계산
        const avgPrice = activeRates.reduce((sum, r) => sum + r.price_krw, 0) / activeRates.length

        // 3. 48시간 내 가격 하락 건수 집계
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)
        const recentDrops = changes.filter(c => 
            c.old_price !== null && new Date(c.changed_at) >= fortyEightHoursAgo && c.new_price < c.old_price
        ).length

        // 4. 주간 가격 분석 (가장 비싼 요일 추출)
        const dayAverages = Array.from({ length: 7 }, () => ({ sum: 0, count: 0 }))
        activeRates.forEach(r => {
            const day = new Date(r.stay_date).getDay()
            const dayData = dayAverages[day]
            if (dayData) {
                dayData.sum += r.price_krw
                dayData.count++
            }
        })

        let maxAvg = -1
        let maxDay = -1
        dayAverages.forEach((val, i) => {
            if (val.count > 0) {
                const avg = val.sum / val.count
                if (avg > maxAvg) {
                    maxAvg = avg
                    maxDay = i
                }
            }
        })

        if (maxDay < 0) {
            return { lowest: { price: lowestRes.price_krw, date: lowestRes.stay_date }, average: avgPrice, drops: recentDrops, expensiveDay: null }
        }

        const diffPct = Math.round(((maxAvg - avgPrice) / avgPrice) * 100)
        
        // 날짜 객체를 이용해 로케일에 맞는 요일 이름 생성
        // 2024-01-07이 일요일(0)임
        const dayName = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(new Date(2024, 0, 7 + maxDay))

        return {
            lowest: { price: lowestRes.price_krw, date: lowestRes.stay_date },
            average: avgPrice,
            drops: recentDrops,
            expensiveDay: { name: dayName, pct: diffPct }
        }
    }, [rates, changes, locale])

    if (!stats) return null

    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 grid grid-cols-2 md:grid-cols-4 gap-6 shadow-sm">
            <StatItem 
                icon={<TrendingDown className="w-4 h-4 text-emerald-500" />}
                label={t('lowestPrice')}
                value={formatPrice(stats.lowest.price, currency, exchangeRate)}
                subValue={t('onDate', { date: stats.lowest.date })}
            />
            <StatItem 
                icon={<Hash className="w-4 h-4 text-indigo-500" />}
                label={t('averagePrice')}
                value={formatPrice(stats.average, currency, exchangeRate)}
                subValue={t('perNightAvg')}
            />
            <StatItem 
                icon={<ArrowDown className="w-4 h-4 text-rose-500" />}
                label={t('recentChanges')}
                value={stats.drops > 0 ? t('dropsCount', { count: stats.drops }) : t('noChanges')}
                subValue={t('last48Hours')}
            />
            {stats.expensiveDay && (
                <StatItem 
                    icon={<Calendar className="w-4 h-4 text-slate-500" />}
                    label={t('expensiveDay')}
                    value={stats.expensiveDay.name}
                    subValue={t('higherThanAvg', { pct: stats.expensiveDay.pct })}
                />
            )}
        </div>
    )
}

function StatItem({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: string, subValue?: string }) {
    return (
        <div className="flex flex-col items-center text-center group">
            <div className="flex items-center gap-1.5 mb-2 px-3 py-1 rounded-full bg-slate-50 group-hover:bg-slate-100 transition-colors">
                {icon}
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
            </div>
            <div className="text-xl md:text-2xl font-black text-slate-900 leading-tight tracking-tight">{value}</div>
            {subValue && (
                <div className="text-[11px] text-slate-400 mt-1.5 font-medium whitespace-nowrap">
                    {subValue}
                </div>
            )}
        </div>
    )
}
