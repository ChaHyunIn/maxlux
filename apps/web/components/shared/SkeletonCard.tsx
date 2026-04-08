import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function SkeletonCard() {
    return (
        <Card className="overflow-hidden">
            <Skeleton className="w-full aspect-video rounded-none" />
            <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-1/4 rounded-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-1/3 mt-2" />
            </CardContent>
        </Card>
    );
}
