import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl animate-pulse space-y-12">
            <div className="rounded-3xl overflow-hidden border bg-card">
                <Skeleton className="w-full h-[400px] md:h-[600px]" />
                <div className="p-6 md:p-8 border-t flex gap-3">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-32 rounded-full" />
                </div>
            </div>
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <Skeleton className="h-[400px] rounded-2xl" />
                    <Skeleton className="h-[400px] rounded-2xl" />
                </div>
            </div>
        </div>
    );
}
