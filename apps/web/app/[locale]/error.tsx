'use client'

import { useTranslations } from 'next-intl';

export default function Error({
    _error,
    reset,
}: {
    _error: Error & { digest?: string }
    reset: () => void
}) {
    let title = 'Something went wrong!';
    let buttonText = 'Try again';

    try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const t = useTranslations('common');
        title = t('somethingWentWrong');
        buttonText = t('tryAgain');
    } catch {
        // i18n 로드 실패 시 영어 기본값 유지
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            <button
                onClick={() => reset()}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
                {buttonText}
            </button>
        </div>
    );
}
