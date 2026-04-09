'use client'
import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ExternalLink, Calendar } from 'lucide-react'
import { getPriceLevel } from '@/lib/utils'
import { PRICE_COLORS } from '@/lib/constants'
import { OtaPriceList } from './OtaPriceList'
import { RoomRateList } from './RoomRateList'
import { PriceHeader } from './PriceHeader'
import type { DailyRate, OtaPrice, RoomRate } from '@/lib/types'
import { useSettingStore } from '@/stores/settingStore'
import { useTranslations, useLocale } from 'next-intl'
import { getLocalizedText } from '@/lib/translator'

interface DayDetailModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    rate: DailyRate | null
    refundableRate?: DailyRate | null
    hotelId: string
    hotelName: string
    bookingUrl: string | null
    p25: number
    p75: number
}



export function DayDetailModal({
    open,
    onOpenChange,
    rate,
    refundableRate,
    hotelId,
    hotelName,
    bookingUrl,
    p25,
    p75,
}: DayDetailModalProps) {
    const currency = useSettingStore(state => state.currency)
    const t = useTranslations('dayDetail')
    const tTerm = useTranslations('apiTerms')
    const locale = useLocale()
    const isEn = locale === 'en'

    const [otaPrices, setOtaPrices] = useState<OtaPrice[]>([])
    const [loading, setLoading] = useState(false)
    const [roomRates, setRoomRates] = useState<RoomRate[]>([])
    const [roomRatesLoading, setRoomRatesLoading] = useState(false)

    const fetchOtaPrices = useCallback(async () => {
        if (!rate || !open) return
        setLoading(true)
        try {
            const res = await fetch(`/api/ota-prices?hotelId=${hotelId}&stayDate=${rate.stay_date}`)
            if (res.ok) {
                const data = await res.json()
                setOtaPrices(data.prices || [])
            }
        } catch {
            setOtaPrices([])
        } finally {
            setLoading(false)
        }
    }, [rate, hotelId, open])

    useEffect(() => {
        fetchOtaPrices()
    }, [fetchOtaPrices])

    useEffect(() => {
        if (!open || !rate) return;
        setRoomRatesLoading(true);
        fetch(`/api/room-rates?hotelId=${rate.hotel_id}&stayDate=${rate.stay_date}`)
            .then(res => res.json())
            .then(json => setRoomRates(Array.isArray(json.data) ? json.data : []))
            .catch(() => setRoomRates([]))
            .finally(() => setRoomRatesLoading(false));
    }, [open, rate]);

    if (!rate) return null

    const level = rate.is_sold_out ? 'soldOut' : getPriceLevel(rate.price_krw, p25, p75)
    const style = PRICE_COLORS[level === 'soldOut' ? 'soldOut' : level]
    const dateObj = new Date(rate.stay_date)
    const formattedDate = locale === 'en'
        ? dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : dateObj.toLocaleDateString('ko-KR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    const allPrices = [
        {
            source: 'hotellux',
            price_krw: rate.price_krw,
            url: bookingUrl,
            is_sold_out: rate.is_sold_out,
            refund_policy: ['r_nobf', 'r_bf'].includes(rate.room_type) ? 'refundable' : 'non_refundable',
        },
        ...otaPrices.map(op => ({
            source: op.source,
            price_krw: op.price_krw,
            url: op.url,
            is_sold_out: false,
            refund_policy: op.refund_policy || 'unknown',
        })),
    ].filter(p => !p.is_sold_out || p.source === 'hotellux')

    const lowestPrice = Math.min(...allPrices.filter(p => !p.is_sold_out && p.price_krw > 0).map(p => p.price_krw))

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent onClose={() => onOpenChange(false)} className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl pr-8">{hotelName}</DialogTitle>
                    <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{formattedDate}</span>
                    </div>
                </DialogHeader>

                {/* Price Display */}
                <PriceHeader
                    rate={rate}
                    refundableRate={refundableRate}
                    t={t}
                    currency={currency}
                    style={style}
                    level={level}
                    locale={locale}
                />

                <OtaPriceList
                    loading={loading}
                    allPrices={allPrices}
                    lowestPrice={lowestPrice}
                    currency={currency}
                    t={t}
                />

                <RoomRateList
                    roomRatesLoading={roomRatesLoading}
                    roomRates={roomRates}
                    t={t}
                    tTerm={tTerm}
                    isEn={isEn}
                    currency={currency}
                />

                {/* Booking Button */}
                {bookingUrl && !rate.is_sold_out && (
                    <div className="mt-4">
                        <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="block">
                            <Button className="w-full" size="lg">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                {t('bookNow')}
                            </Button>
                        </a>
                    </div>
                )}

                {/* Room type info */}
                <div className="mt-3 text-xs text-slate-400 text-center">
                    {t('roomType')}: {rate.room_type === 'standard' ? t('standardRoom') : rate.room_type}
                </div>
            </DialogContent>
        </Dialog>
    )
}
