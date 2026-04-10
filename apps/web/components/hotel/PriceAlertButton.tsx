'use client'
import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Bell, BellRing, Check, Loader2 } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { formatPrice } from '@/lib/utils'
import { useSettingStore } from '@/stores/settingStore'
import { isValidEmail } from '@/lib/validation'
import { PRICE_SUGGESTIONS } from '@/lib/constants'

interface PriceAlertButtonProps {
    hotelId: string
    hotelName: string
    currentMinPrice?: number
}

export function PriceAlertButton({ hotelId, hotelName, currentMinPrice }: PriceAlertButtonProps) {
    const t = useTranslations('priceAlert')
    const tErr = useTranslations('errors')
    const locale = useLocale()
    const { currency } = useSettingStore()
    const [open, setOpen] = useState(false)
    const [email, setEmail] = useState('')

    const getDefaultTarget = useCallback(() => {
        if (currentMinPrice) return Math.round(currentMinPrice * 0.9)
        return currency === 'USD' ? 250 : 300000
    }, [currentMinPrice, currency])

    const [targetPrice, setTargetPrice] = useState(getDefaultTarget())
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (open) {
            setTargetPrice(getDefaultTarget())
        }
    }, [open, getDefaultTarget])

    const handleSubmit = async () => {
        if (!email.trim()) {
            setError(t('emailRequired'))
            return
        }

        if (!isValidEmail(email)) {
            setError(t('emailInvalid'))
            return
        }

        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/price-alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hotel_id: hotelId,
                    email: email.trim(),
                    target_price: targetPrice,
                    locale,
                }),
            })

            const data = await res.json()
            if (res.ok) {
                setSuccess(true)
                setTimeout(() => {
                    setOpen(false)
                    setSuccess(false)
                }, 2000)
            } else {
                const errorKey = data.error
                setError(tErr(errorKey) || t('submitError'))
            }
        } catch {
            setError(t('submitError'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Button
                variant="secondary"
                size="sm"
                className="gap-1.5 text-slate-900"
                onClick={() => setOpen(true)}
            >
                <Bell className="w-4 h-4" />
                {t('button')}
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent onClose={() => setOpen(false)} className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 pr-8">
                            <BellRing className="w-5 h-5 text-amber-500" />
                            {t('title')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('description', { hotel: hotelName })}
                        </DialogDescription>
                    </DialogHeader>

                    {success ? (
                        <div className="flex flex-col items-center gap-3 py-8">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                <Check className="w-6 h-6 text-emerald-600" />
                            </div>
                            <p className="text-sm font-medium text-emerald-700">{t('successMessage')}</p>
                        </div>
                    ) : (
                        <div className="space-y-4 mt-2">
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">
                                    {t('targetPriceLabel')} ({currency})
                                </label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {(currency === 'USD' ? PRICE_SUGGESTIONS.USD : PRICE_SUGGESTIONS.KRW).map(price => (
                                        <button
                                            key={price}
                                            onClick={() => setTargetPrice(price)}
                                            className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${targetPrice === price
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                                                }`}
                                        >
                                            {formatPrice(price, currency)}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={targetPrice}
                                        onChange={(e) => setTargetPrice(parseInt(e.target.value) || 0)}
                                        className="flex-1"
                                        min={currency === 'USD' ? 10 : 10000}
                                        step={currency === 'USD' ? 10 : 10000}
                                    />
                                    <Badge variant="outline" className="whitespace-nowrap">{currency}</Badge>
                                </div>
                                {currentMinPrice && (
                                    <p className="text-xs text-slate-400 mt-1.5">
                                        {t('currentMin')}: {formatPrice(currentMinPrice, currency)}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">
                                    {t('emailLabel')}
                                </label>
                                <Input
                                    type="email"
                                    placeholder={t('emailPlaceholder')}
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-red-500">{error}</p>
                            )}

                            <Button
                                className="w-full"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Bell className="w-4 h-4 mr-2" />
                                )}
                                {t('submitButton')}
                            </Button>

                            <p className="text-[11px] text-slate-400 text-center">
                                {t('disclaimer')}
                            </p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
