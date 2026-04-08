import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8 animate-pulse">
            <div className="flex flex-col md:flex-row gap-4 mb-12">
                <Skeleton className="h-10 w-full flex-1 rounded-md" />
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-[180px] rounded-md" />
                    <Skeleton className="h-10 w-[180px] rounded-md" />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-3 rounded-xl border p-4 bg-card h-[380px]">
                        <Skeleton className="h-48 w-full rounded-lg" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="mt-auto space-y-2">
                            <Skeleton className="h-8 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
