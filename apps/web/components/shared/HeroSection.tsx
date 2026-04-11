'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { TrendingDown, Bell, BarChart3, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'

/**
 * HeroSection 컴포넌트
 * 
 * 서비스의 핵심 가치를 전달하며, 첫 방문 여부에 따라 가변적인 레이아웃을 제공합니다.
 * 'maxlux_visited' localStorage 키를 사용하여 상태를 관리합니다.
 */

export default function HeroSection() {
    const t = useTranslations('hero')
    const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null)

    useEffect(() => {
        const visited = localStorage.getItem('maxlux_visited')
        if (!visited) {
            setIsFirstVisit(true)
            localStorage.setItem('maxlux_visited', 'true')
        } else {
            setIsFirstVisit(false)
        }
    }, [])

    const scrollToContent = () => {
        const element = document.getElementById('hotel-list')
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    if (isFirstVisit === null) return null // Hydration mismatch 방지

    return (
        <section className="relative overflow-hidden bg-slate-900 text-white">
            {/* 배경 그라데이션 및 노이즈 효과 */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#1e293b_0%,_#0f172a_100%)] opacity-100" />
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            <div className="container relative mx-auto px-4 z-10">
                <AnimatePresence mode="wait">
                    {isFirstVisit ? (
                        /* 첫 방문 모드: 전체 높이 */
                        <motion.div
                            key="full-hero"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center justify-center min-h-[60vh] py-20 text-center"
                        >
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                                className="mb-6 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold tracking-wider uppercase"
                            >
                                MaxLux Premium Optimizer
                            </motion.div>

                            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                                {t.rich('headline', {
                                    highlight: (chunks) => <span className="text-emerald-500 underline decoration-emerald-500/30 underline-offset-8">{chunks}</span>
                                })}
                            </h1>
                            
                            <p className="max-w-2xl text-lg md:text-xl text-slate-400 mb-10 leading-relaxed">
                                {t('subheadline')}
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
                                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 h-14 rounded-2xl shadow-xl shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95" onClick={scrollToContent}>
                                    {t('cta')}
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-8">
                                <FeatureCard 
                                    icon={<TrendingDown className="w-6 h-6 text-emerald-500" />}
                                    title={t('feature1Title')}
                                    description={t('feature1Desc')}
                                />
                                <FeatureCard 
                                    icon={<Bell className="w-6 h-6 text-amber-500" />}
                                    title={t('feature2Title')}
                                    description={t('feature2Desc')}
                                />
                                <FeatureCard 
                                    icon={<BarChart3 className="w-6 h-6 text-blue-500" />}
                                    title={t('feature3Title')}
                                    description={t('feature3Desc')}
                                />
                            </div>

                            <motion.div 
                                animate={{ y: [0, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-500"
                            >
                                <ChevronDown className="w-6 h-6" />
                            </motion.div>
                        </motion.div>
                    ) : (
                        /* 재방문 모드: 컴팩트 배너 */
                        <motion.div
                            key="compact-hero"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="py-10 md:py-14 flex flex-col md:flex-row items-center justify-between gap-6"
                        >
                            <div className="text-center md:text-left">
                                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                                    {t('headline')}
                                </h2>
                                <p className="text-slate-400 text-sm md:text-base">
                                    {t('subheadline')}
                                </p>
                            </div>
                            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-12 px-6 transition-all hover:scale-105" onClick={scrollToContent}>
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
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="font-bold text-lg mb-2 text-slate-100">{title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
        </div>
    )
}
