'use client'
import { useState, useEffect, useCallback } from 'react'
import { ExternalLink, Calendar } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { fetchOtaPrices as fetchOtaPricesApi } from '@/lib/api/ota'
import { fetchRoomRates as fetchRoomRatesApi } from '@/lib/api/roomRates'
import { PRICE_COLORS, REFUNDABLE_ROOM_TYPES } from '@/lib/constants'
import { getRoomTypeLabel } from '@/lib/hotelUtils'
import { getPriceLevel } from '@/lib/utils'
import { useSettingStore } from '@/stores/settingStore'
import { OtaPriceList } from './OtaPriceList'
import { PriceHeader } from './PriceHeader'
import { RoomRateList } from './RoomRateList'
import type { DailyRate, OtaPrice, RoomRate } from '@/lib/types'

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
    const { currency, exchangeRate } = useSettingStore();
    const t = useTranslations('dayDetail')
    const tTerm = useTranslations('apiTerms')
    const tTime = useTranslations('time')
    const locale = useLocale()

    const [otaPrices, setOtaPrices] = useState<OtaPrice[]>([])
    const [loading, setLoading] = useState(false)
    const [roomRates, setRoomRates] = useState<RoomRate[]>([])
    const [roomRatesLoading, setRoomRatesLoading] = useState(false)

    const fetchOtaPrices = useCallback(async () => {
        if (!rate || !open) return
        setLoading(true)
        try {
            const prices = await fetchOtaPricesApi(hotelId, rate.stay_date)
            setOtaPrices(prices)
        } catch {
            setOtaPrices([])
        } finally {
            setLoading(false)
        }
    }, [rate, hotelId, open])

    useEffect(() => {
        fetchOtaPrices()
    }, [fetchOtaPrices])

    const fetchRoomRates = useCallback(async () => {
        if (!open || !rate) return;
        setRoomRatesLoading(true);
        try {
            const data = await fetchRoomRatesApi(rate.hotel_id, rate.stay_date);
            setRoomRates(data);
        } catch {
            setRoomRates([])
        } finally {
            setRoomRatesLoading(false);
        }
    }, [open, rate]);

    useEffect(() => {
        fetchRoomRates()
    }, [fetchRoomRates]);

    if (!rate) return null

    const level = rate.is_sold_out ? 'soldOut' : getPriceLevel(rate.price_krw, p25, p75)
    const style = PRICE_COLORS[level === 'soldOut' ? 'soldOut' : level]
    const dateObj = new Date(rate.stay_date)
    const formattedDate = new Intl.DateTimeFormat(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(dateObj);

    const allPrices = [
        {
            source: 'hotellux',
            price_krw: rate.price_krw,
            url: bookingUrl,
            is_sold_out: rate.is_sold_out,
            refund_policy: REFUNDABLE_ROOM_TYPES.some(type => type === rate.room_type) ? 'refundable' : 'non_refundable',
        },
        ...otaPrices.map(op => ({
            source: op.source,
            price_krw: op.price_krw,
            url: op.url,
            is_sold_out: false,
            refund_policy: op.refund_policy || 'unknown',
        })),
    ].filter(p => !p.is_sold_out || p.source === 'hotellux')

    const activePrices = allPrices.filter(p => !p.is_sold_out && p.price_krw > 0).map(p => p.price_krw);
    const lowestPrice = activePrices.length > 0 ? Math.min(...activePrices) : 0;

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

                <PriceHeader
                    rate={rate}
                    refundableRate={refundableRate}
                    t={t}
                    currency={currency}
                    exchangeRate={exchangeRate}
                    style={style}
                    level={level}
                    locale={locale}
                    tTime={tTime}
                />

                <OtaPriceList
                    loading={loading}
                    allPrices={allPrices}
                    lowestPrice={lowestPrice}
                    currency={currency}
                    exchangeRate={exchangeRate}
                    t={t}
                />

                <RoomRateList
                    roomRatesLoading={roomRatesLoading}
                    roomRates={roomRates}
                    t={t}
                    tTerm={tTerm}
                    currency={currency}
                    exchangeRate={exchangeRate}
                />

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

                <div className="mt-3 text-xs text-slate-400 text-center">
                    {t('roomType')}: {getRoomTypeLabel(rate.room_type, t)}
                </div>
            </DialogContent>
        </Dialog>
    )
}
