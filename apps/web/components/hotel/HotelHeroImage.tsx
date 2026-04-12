"use client";
import { useState } from "react";
import Image from "next/image";
import { Building } from "lucide-react";
import { useTranslations } from 'next-intl';

export function HotelHeroImage({ url, alt }: { url: string; alt: string }) {
    const [err, setErr] = useState(false);
    const t = useTranslations('hotel');

    if (!url || err) {
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-slate-400">
                <Building className="w-16 h-16 mb-4 opacity-20" />
                <span className="text-sm font-medium tracking-widest opacity-40 uppercase">{t('imageUnavailable')}</span>
            </div>
        );
    }

    return (
        <Image src={url} alt={alt} fill className="object-cover transition-transform duration-700 hover:scale-105" priority sizes="100vw" onError={() => setErr(true)} />
    );
}
