'use client'
import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ExternalLink, TrendingDown, TrendingUp, Minus, Calendar, Tag } from 'lucide-react'
import { formatPrice, getPriceLevel, getRelativeTime, formatAbsoluteTime } from '@/lib/utils'
import { PRICE_COLORS } from '@/lib/constants'
import type { DailyRate, OtaPrice, RoomRate } from '@/lib/types'
import { useSettingStore } from '@/stores/settingStore'
import { useTranslations, useLocale } from 'next-intl'

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

const OTA_DISPLAY: Record<string, { name: string; color: string }> = {
    hotellux: { name: 'HotelLux', color: 'bg-violet-100 text-violet-800' },
    agoda: { name: 'Agoda', color: 'bg-red-100 text-red-800' },
    booking: { name: 'Booking.com', color: 'bg-blue-100 text-blue-800' },
    hotels_com: { name: 'Hotels.com', color: 'bg-rose-100 text-rose-800' },
    trip_com: { name: 'Trip.com', color: 'bg-sky-100 text-sky-800' },
    expedia: { name: 'Expedia', color: 'bg-yellow-100 text-yellow-800' },
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
    const { currency } = useSettingStore()
    const t = useTranslations('dayDetail')
    const locale = useLocale()
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
                setOtaPrices(data)
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
            .then(data => setRoomRates(Array.isArray(data) ? data : []))
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
                <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{t('nonRefundable')}</span>
                        <div className="flex items-center gap-3">
                            <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${style.bg} ${style.text}`}>
                                {rate.is_sold_out ? t('soldOut') : formatPrice(rate.price_krw, currency)}
                            </div>
                            <Badge variant="outline" className="gap-1">
                                <Tag className="w-3 h-3" />
                                {t(`tag${rate.tag}` as any) || rate.tag}
                            </Badge>
                            {!rate.is_sold_out && (
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                    {level === 'low' && <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />}
                                    {level === 'mid' && <Minus className="w-3.5 h-3.5 text-slate-400" />}
                                    {level === 'high' && <TrendingUp className="w-3.5 h-3.5 text-red-600" />}
                                    {level === 'low' ? t('levelLow') : level === 'high' ? t('levelHigh') : t('levelMid')}
                                </div>
                            )}
                        </div>
                    </div>
                    {refundableRate && !refundableRate.is_sold_out && (
                        <div className="flex flex-wrap items-center justify-between">
                            <span className="text-xs text-slate-500">{t('refundable')}</span>
                            <div className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-50 text-blue-800">
                                {formatPrice(refundableRate.price_krw, currency)}
                            </div>
                        </div>
                    )}
                </div>

                {rate.scraped_at && (
                    <p className="text-[11px] text-slate-400 mb-4 -mt-2">
                        {t('scrapedAt', {
                            absoluteTime: formatAbsoluteTime(rate.scraped_at, locale),
                            relativeTime: getRelativeTime(rate.scraped_at, locale)
                        })}
                    </p>
                )}

                {/* OTA Price Comparison */}
                <div className="border rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2.5 border-b">
                        <h3 className="text-sm font-semibold text-slate-700">{t('priceComparison')}</h3>
                    </div>
                    <div className="divide-y">
                        {loading ? (
                            <div className="p-4 space-y-3">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : (
                            allPrices.map((p, idx) => {
                                const display = OTA_DISPLAY[p.source] || { name: p.source, color: 'bg-slate-100 text-slate-700' }
                                const isLowest = !p.is_sold_out && p.price_krw === lowestPrice && p.price_krw > 0
                                return (
                                    <div key={`${p.source}-${idx}`} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Badge className={`text-xs ${display.color} border-none`}>
                                                {display.name}
                                            </Badge>
                                            {isLowest && (
                                                <Badge className="bg-emerald-500 text-white text-[10px] border-none px-1.5">
                                                    {t('lowestBadge')}
                                                </Badge>
                                            )}
                                            {p.refund_policy && p.refund_policy !== 'unknown' && (
                                                <Badge variant="outline" className={`text-[10px] ${p.refund_policy === 'refundable'
                                                    ? 'bg-green-50 text-green-600 border-green-200'
                                                    : 'bg-red-50 text-red-600 border-red-200'
                                                    }`}>
                                                    {p.refund_policy === 'refundable' ? t('refundable') : t('nonRefundable')}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold ${isLowest ? 'text-emerald-700' : 'text-slate-800'}`}>
                                                {p.is_sold_out ? t('soldOut') : formatPrice(p.price_krw, currency)}
                                            </span>
                                            {p.url && !p.is_sold_out && (
                                                <a
                                                    href={p.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-slate-400 hover:text-blue-600 transition-colors"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        )}

                        {!loading && allPrices.length === 1 && (
                            <div className="px-4 py-3 text-sm text-slate-400 text-center">
                                {t('noOtaData')}
                            </div>
                        )}
                    </div>
                </div>

                {/* Room Rates Details */}
                <div className="border rounded-xl overflow-hidden mt-4">
                    <div className="bg-slate-50 px-4 py-2.5 border-b flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-slate-700">{t('roomRates')}</h3>
                    </div>
                    <div className="divide-y relative pb-2 bg-white max-h-[300px] overflow-y-auto">
                        {roomRatesLoading ? (
                            <div className="p-4 space-y-3">
                                <Skeleton className="h-6 w-1/2 mb-2" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : roomRates.length === 0 ? (
                            <div className="px-4 py-8 text-sm text-slate-400 text-center">
                                {t('noRoomData')}
                            </div>
                        ) : (
                            Array.from(new Set(roomRates.map(r => r.room_name_en || r.room_name))).map(roomName => {
                                const ratesForRoom = roomRates.filter(r => (r.room_name_en || r.room_name) === roomName);
                                return (
                                    <div key={roomName} className="pb-3 border-b border-slate-100 last:border-b-0">
                                        <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 sticky top-0 z-10">
                                            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                                {roomName}
                                            </h4>
                                        </div>
                                        <div className="divide-y divide-slate-50">
                                            {ratesForRoom.map((rate, idx) => {
                                                const tagStrings = rate.benefit_tags || [];
                                                return (
                                                    <div key={`rate-${rate.id || idx}`} className="px-4 py-2.5 hover:bg-slate-50/50 transition-colors flex justify-between items-start gap-3">
                                                        <div className="flex-1 min-w-0 flex flex-col gap-1.5 pt-0.5">
                                                            <div className="text-[13px] font-medium text-slate-700 leading-tight">
                                                                {rate.rate_name_en || rate.rate_name}
                                                            </div>
                                                            <div className="flex flex-wrap gap-1 mt-0.5">
                                                                <Badge variant="outline" className={`text-[9px] px-1.5 py-0 border-none ${rate.is_refundable ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-500'}`}>
                                                                    {rate.is_refundable ? t('cancelable') : t('nonCancelable')}
                                                                </Badge>
                                                                <Badge variant="outline" className={`text-[9px] px-1.5 py-0 border-none ${rate.has_breakfast ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                                                                    {rate.has_breakfast ? t('breakfastIncluded') : t('breakfastNotIncluded')}
                                                                </Badge>
                                                                {tagStrings.some(t => t.includes('100USD')) && (
                                                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-none bg-purple-50 text-purple-600">{t('benefitCredit')}</Badge>
                                                                )}
                                                                {tagStrings.some(t => t.includes('升房')) && (
                                                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-none bg-sky-50 text-sky-600">{t('benefitUpgrade')}</Badge>
                                                                )}
                                                                {tagStrings.some(t => t.includes('提前入住')) && (
                                                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-none bg-gray-100 text-gray-600">{t('benefitEarlyCheckin')}</Badge>
                                                                )}
                                                                {tagStrings.some(t => t.includes('延迟退房')) && (
                                                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-none bg-gray-100 text-gray-600">{t('benefitLateCheckout')}</Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right whitespace-nowrap pt-0.5">
                                                            <div className="font-bold text-slate-800 text-[14px]">
                                                                {formatPrice(rate.price_krw, currency)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

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
