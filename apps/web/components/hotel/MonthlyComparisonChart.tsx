'use client'

'use client'

import { motion } from 'motion/react'
import { useTranslations, useLocale } from 'next-intl'
import { formatPrice } from '@/lib/utils'
import { useSettingStore } from '@/stores/settingStore'

interface MonthStat {
    month: string
    avgPrice: number
    isCheapest: boolean
}

interface MonthlyComparisonChartProps {
    stats: MonthStat[]
}

export default function MonthlyComparisonChart({ stats }: MonthlyComparisonChartProps) {
    const t = useTranslations('compare')
    const locale = useLocale()
    const { currency, exchangeRate } = useSettingStore()

    if (stats.length === 0) return null

    const maxPrice = Math.max(...stats.map(s => s.avgPrice))
    if (maxPrice <= 0) return null

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
                {stats.map((stat, index) => {
                    const widthPct = (stat.avgPrice / maxPrice) * 100
                    
                    return (
                        <div key={stat.month} className="group flex flex-col gap-2">
                            <div className="flex justify-between items-end px-1">
                                <span className={`text-sm font-bold ${stat.isCheapest ? 'text-emerald-600' : 'text-slate-700'}`}>
                                    {stat.month}
                                    {stat.isCheapest && <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full">{t('cheapestMonth')}</span>}
                                </span>
                                <span className="text-sm font-black text-slate-900">
                                    {formatPrice(stat.avgPrice, currency, exchangeRate, locale)}
                                </span>
                            </div>
                            
                            <div className="h-10 bg-slate-100 rounded-xl overflow-hidden relative">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${widthPct}%` }}
                                    transition={{ delay: index * 0.05, duration: 0.5, ease: 'easeOut' }}
                                    className={`h-full relative ${stat.isCheapest ? 'bg-emerald-500' : 'bg-slate-300 group-hover:bg-slate-400'} transition-colors`}
                                >
                                    {stat.isCheapest && (
                                        <div className="absolute inset-0 bg-white/10 animate-pulse" />
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
