'use client'

import { TrendingDown, TrendingUp, History } from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { formatPrice, getRelativeTime } from '@/lib/utils'
import { useSettingStore } from '@/stores/settingStore'
import type { PriceChange } from '@/lib/types'

interface PriceChangesListProps {
    changes: PriceChange[]
}

export function PriceChangesList({ changes }: PriceChangesListProps) {
    const { currency, exchangeRate } = useSettingStore()
    const t = useTranslations('priceChanges')
    const tTime = useTranslations('time')

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 mt-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <History className="w-5 h-5 text-slate-500" />
                    {t('title')}
                </h3>
            </div>
            
            <p className="text-sm text-slate-500 mb-6">
                {t('description')}
            </p>

            <div className="space-y-3">
                {changes.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm italic">
                        {t('noChanges')}
                    </div>
                ) : (
                    changes.map((change, index) => {
                        const isNew = change.old_price === null || change.old_price === 0;
                        const diff = isNew ? 0 : (change.new_price - (change.old_price || 0));
                        const isDrop = !isNew && diff < 0;
                        const isRise = !isNew && diff > 0;
                        
                        return (
                            <motion.div 
                                key={change.id} 
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.04, duration: 0.2 }}
                                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isDrop ? 'bg-emerald-100 text-emerald-600' : isRise ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                                        {isDrop ? <TrendingDown className="w-4 h-4" /> : isRise ? <TrendingUp className="w-4 h-4" /> : <History className="w-4 h-4" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-slate-800">
                                            {t('stayDate', { date: change.stay_date })}
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            {getRelativeTime(change.changed_at, tTime)}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                        {!isNew && (
                                            <span className="text-xs text-slate-400 line-through">
                                                {formatPrice(change.old_price, currency, exchangeRate)}
                                            </span>
                                        )}
                                        <span className={`font-bold text-sm ${isDrop ? 'text-emerald-600' : isRise ? 'text-red-600' : 'text-slate-800'}`}>
                                            {formatPrice(change.new_price, currency, exchangeRate)}
                                        </span>
                                    </div>
                                    <div className={`text-[10px] font-medium ${isDrop ? 'text-emerald-500' : isRise ? 'text-red-500' : 'text-slate-400'}`}>
                                        {isNew ? t('newRegistration') : (isDrop ? t('priceDrop') : t('priceRise'))} 
                                        {!isNew && ` ${formatPrice(Math.abs(diff), currency, exchangeRate)}`}
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
