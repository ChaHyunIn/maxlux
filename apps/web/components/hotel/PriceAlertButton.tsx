'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Bell, BellRing, Check, Loader2 } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { formatPrice } from '@/lib/utils'
import { useSettingStore } from '@/stores/settingStore'

interface PriceAlertButtonProps {
    hotelId: string
    hotelName: string
    currentMinPrice?: number
}

const PRICE_SUGGESTIONS_KRW = [200000, 250000, 300000, 350000, 400000, 500000]

export function PriceAlertButton({ hotelId, hotelName, currentMinPrice }: PriceAlertButtonProps) {
    const t = useTranslations('priceAlert')
    const locale = useLocale()
    const { currency } = useSettingStore()
    const [open, setOpen] = useState(false)
    const [email, setEmail] = useState('')
    const [targetPrice, setTargetPrice] = useState(currentMinPrice ? Math.round(currentMinPrice * 0.9) : 300000)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async () => {
        if (!email.trim()) {
            setError(t('emailRequired'))
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
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

            if (res.ok) {
                setSuccess(true)
                setTimeout(() => {
                    setOpen(false)
                    setSuccess(false)
                }, 2000)
            } else {
                const data = await res.json()
                setError(data.error || t('submitError'))
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
                variant="outline"
                size="sm"
                className="gap-1.5"
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
                            {/* Target price */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">
                                    {t('targetPriceLabel')}
                                </label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {PRICE_SUGGESTIONS_KRW.map(price => (
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
                                        min={10000}
                                        step={10000}
                                    />
                                    <Badge variant="outline" className="whitespace-nowrap">KRW</Badge>
                                </div>
                                {currentMinPrice && (
                                    <p className="text-xs text-slate-400 mt-1.5">
                                        {t('currentMin')}: {formatPrice(currentMinPrice, currency)}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
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
