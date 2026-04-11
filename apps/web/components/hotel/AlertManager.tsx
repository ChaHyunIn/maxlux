'use client'

import { useState } from 'react'
import { Bell, Loader2, X, ChevronLeft, Trash2, Building2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useSettingStore } from '@/stores/settingStore'
import { formatPrice } from '@/lib/utils'
import { isValidEmail } from '@/lib/validation'
import { toast } from 'sonner'

interface AlertManagerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

interface PriceAlert {
    id: number
    hotel_id: string
    target_price: number
    email: string
    currency: 'KRW' | 'USD'
    hotels?: {
        name_ko: string
        name_en: string
    }
}

export function AlertManager({ open, onOpenChange }: AlertManagerProps) {
    const t = useTranslations('alertManager')
    const { currency, exchangeRate } = useSettingStore()
    
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [alerts, setAlerts] = useState<PriceAlert[]>([])
    const [step, setStep] = useState<'input' | 'list'>('input')

    const fetchAlerts = async () => {
        if (!isValidEmail(email)) {
            toast.error('Invalid email')
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`/api/price-alerts?email=${encodeURIComponent(email.trim())}`)
            const data = await res.json()
            if (res.ok) {
                setAlerts(data.alerts || [])
                setStep('list')
            } else {
                toast.error('Failed to fetch alerts')
            }
        } catch {
            toast.error('Fetch error')
        } finally {
            setLoading(false)
        }
    }

    const handleDeactivate = async (alertId: number) => {
        try {
            const res = await fetch('/api/price-alerts', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: alertId, email: email.trim() })
            })
            if (res.ok) {
                setAlerts(prev => prev.filter(a => a.id !== alertId))
                toast.success(t('successDeactivate'))
            } else {
                toast.error('Deactivate failed')
            }
        } catch {
            toast.error('Error deactivating')
        }
    }

    const reset = () => {
        setStep('input')
        setAlerts([])
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { if(!v) reset(); onOpenChange(v); }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 pr-8">
                        <Bell className="w-5 h-5 text-indigo-500" />
                        {t('title')}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'input' ? t('description') : `${email} (${alerts.length})`}
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-2">
                    {step === 'input' ? (
                        <div className="space-y-4">
                            <Input
                                type="email"
                                placeholder="example@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchAlerts()}
                            />
                            <Button className="w-full h-12 rounded-xl" onClick={fetchAlerts} disabled={loading}>
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {t('fetchButton')}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                                {alerts.length === 0 ? (
                                    <div className="py-10 text-center text-slate-400">
                                        <X className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                        <p className="text-sm">{t('empty')}</p>
                                    </div>
                                ) : (
                                    alerts.map(alert => (
                                        <div key={alert.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400">
                                                    <Building2 className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold truncate max-w-[180px]">
                                                        {alert.hotels?.name_ko || 'Hotel'}
                                                    </p>
                                                    <p className="text-xs text-indigo-600 font-medium">
                                                        {formatPrice(alert.target_price, alert.currency, exchangeRate)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                onClick={() => handleDeactivate(alert.id)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                <span className="text-[11px]">{t('deactivate')}</span>
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                            <Button variant="outline" className="w-full gap-2" onClick={() => setStep('input')}>
                                <ChevronLeft className="w-4 h-4" />
                                {t('back')}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
