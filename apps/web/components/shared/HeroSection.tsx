'use client'

import { useState, useEffect } from 'react'
import { TrendingDown, Bell, BarChart3, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { STORAGE_KEYS } from '@/lib/constants'

/**
 * HeroSection Component
 * 
 * Delivers the core value proposition of MaxLux with premium visual depth and 
 * adaptive layouts for first-time and returning visitors.
 */

export default function HeroSection() {
    const t = useTranslations('hero')
    const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null)
    const { getItem, setItem } = useLocalStorage()

    useEffect(() => {
        const visited = getItem(STORAGE_KEYS.VISITED)
        if (!visited) {
            setIsFirstVisit(true)
            setItem(STORAGE_KEYS.VISITED, 'true')
        } else {
            setIsFirstVisit(false)
        }
    }, [getItem, setItem])

    const scrollToContent = () => {
        const element = document.getElementById('hotel-list')
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    if (isFirstVisit === null) return null // Prevent Hydration mismatch

    return (
        <section className="relative overflow-hidden bg-slate-950 text-white border-b border-white/5">
            {/* Cinematic Background - Deep Gradients & Subtle Noise */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-brand-dark)_0%,_transparent_40%),_radial-gradient(circle_at_bottom_left,_var(--color-luxury-emerald-soft)_0%,_transparent_30%)] opacity-20" />
            <div className="absolute inset-0 bg-[#020617] -z-10" />
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />

            <div className="container relative mx-auto px-4 z-10">
                <AnimatePresence mode="wait">
                    {isFirstVisit ? (
                        /* First Visit Mode: Dramatic Full Height */
                        <motion.div
                            key="full-hero"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, y: -40 }}
                            transition={{ duration: 1 }}
                            className="flex flex-col items-center justify-center min-h-[75vh] py-20 text-center"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-brand/10 border border-brand/20 backdrop-blur-xl mb-10"
                            >
                                <span className="w-2 h-2 rounded-full bg-brand animate-pulse shadow-[0_0_8px_var(--color-brand)]" />
                                <span className="text-xs font-bold tracking-[0.2em] text-brand uppercase">
                                    {t('badgeText')}
                                </span>
                            </motion.div>

                            <motion.h1 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                className="text-5xl md:text-8xl font-display font-bold text-white tracking-tighter leading-[1.05] mb-10 max-w-4xl"
                            >
                                {t.rich('headline', {
                                    highlight: (chunks) => <span className="text-brand relative inline-block">
                                        {chunks}
                                        <motion.span 
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 1.2, delay: 1, ease: 'easeInOut' }}
                                            className="absolute bottom-3 left-0 h-[8px] bg-brand/20 -z-10" 
                                        />
                                    </span>
                                })}
                            </motion.h1>
                            
                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="max-w-2xl text-lg md:text-xl text-slate-400 mb-14 leading-relaxed font-light tracking-wide italic"
                            >
                                {t('subheadline')}
                            </motion.p>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                                className="flex flex-wrap items-center justify-center gap-6 mb-20"
                            >
                                <Button 
                                    size="lg" 
                                    className="bg-brand hover:bg-brand-dark text-slate-900 font-bold px-10 h-14 rounded-full shadow-2xl shadow-brand/10 transition-all hover:scale-105 active:scale-95 text-lg" 
                                    onClick={scrollToContent}
                                >
                                    {t('cta')}
                                </Button>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl"
                            >
                                <FeatureCard 
                                    icon={<TrendingDown className="w-5 h-5 text-brand" />}
                                    title={t('feature1Title')}
                                    description={t('feature1Desc')}
                                />
                                <FeatureCard 
                                    icon={<Bell className="w-5 h-5 text-brand" />}
                                    title={t('feature2Title')}
                                    description={t('feature2Desc')}
                                />
                                <FeatureCard 
                                    icon={<BarChart3 className="w-5 h-5 text-brand" />}
                                    title={t('feature3Title')}
                                    description={t('feature3Desc')}
                                />
                            </motion.div>

                            <motion.div 
                                animate={{ y: [0, 8, 0] }}
                                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-600 cursor-pointer hover:text-brand transition-colors"
                                onClick={scrollToContent}
                            >
                                <ChevronDown className="w-8 h-8 stroke-[1.5]" />
                            </motion.div>
                        </motion.div>
                    ) : (
                        /* Returning Visitor Mode: Elegant Compact Banner */
                        <motion.div
                            key="compact-hero"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-10"
                        >
                            <div className="text-center md:text-left flex-1">
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="mb-4 inline-block text-[10px] font-bold tracking-[0.3em] uppercase text-brand/60"
                                >
                                    Experience the Exceptional
                                </motion.div>
                                <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight">
                                    {t.rich('headline', {
                                        highlight: (chunks) => <span className="text-brand">{chunks}</span>
                                    })}
                                </h2>
                                <p className="text-slate-400 text-base md:text-lg max-w-xl font-light">
                                    {t('subheadline')}
                                </p>
                            </div>
                            <Button 
                                size="lg" 
                                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md font-bold rounded-full h-14 px-10 transition-all hover:scale-105" 
                                onClick={scrollToContent}
                            >
                                {t('cta')}
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/[0.05] text-left hover:bg-white/[0.07] hover:border-white/10 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-0 bg-brand group-hover:h-full transition-all duration-700" />
            <div className="w-12 h-12 rounded-2xl bg-white/[0.05] flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-all duration-500 group-hover:bg-brand/10">
                <div className="group-hover:scale-110 transition-transform duration-500 stroke-[1.5]">
                    {icon}
                </div>
            </div>
            <h3 className="font-display font-bold text-xl mb-3 text-slate-100 group-hover:text-brand transition-colors">{title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-light">{description}</p>
        </div>
    )
}
