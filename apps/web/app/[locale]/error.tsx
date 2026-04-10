'use client'

export default function Error({
    _error,
    reset,
}: {
    _error: Error & { digest?: string }
    reset: () => void
}) {
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
    )
}
