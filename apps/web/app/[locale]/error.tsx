'use client'

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function Error({
    _error,
    reset,
}: {
    _error: Error & { digest?: string }
    reset: () => void
}) {
    const [i18nReady, setI18nReady] = useState(false);

    // Provider 존재 여부를 mount 시 확인 (NextIntlClientProvider가 부모에 대개 있으나 Error Boundary는 예외적일 수 있음)
    useEffect(() => { 
        setI18nReady(true); 
    }, []);

    // 훅을 최상위에서 호출하지 않고 분리된 컴포넌트에서 호출하여 Rules of Hooks 준수
    if (i18nReady) {
        return <LocalizedError reset={reset} />;
    }

    return <FallbackError reset={reset} />;
}

function LocalizedError({ reset }: { reset: () => void }) {
    const t = useTranslations('common');
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">{t('somethingWentWrong')}</h2>
            <button 
                onClick={() => reset()} 
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
                {t('tryAgain')}
            </button>
        </div>
    );
}

function FallbackError({ reset }: { reset: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
            <button 
                onClick={() => reset()} 
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
                Try again
            </button>
        </div>
    );
}
