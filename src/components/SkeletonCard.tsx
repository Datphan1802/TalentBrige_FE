import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const SkeletonCard = () => (
  <Card className="overflow-hidden">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4 bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_100%] animate-shimmer" />
          <Skeleton className="h-4 w-1/2 bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_100%] animate-shimmer" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_100%] animate-shimmer" />
      </div>
    </CardHeader>
    <CardContent className="space-y-2">
      <Skeleton className="h-4 w-full bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_100%] animate-shimmer" />
      <Skeleton className="h-4 w-2/3 bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_100%] animate-shimmer" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-6 w-16 rounded-full bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_100%] animate-shimmer" />
        <Skeleton className="h-6 w-16 rounded-full bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_100%] animate-shimmer" />
      </div>
    </CardContent>
  </Card>
);

export default SkeletonCard;
