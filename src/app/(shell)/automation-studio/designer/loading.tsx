import { Skeleton } from "@/components/ui/skeleton";

export default function DesignerLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
      <div className="w-64 space-y-3">
        <Skeleton className="h-8 w-32" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-xl" />
        ))}
      </div>
      <div className="flex-1 space-y-3">
        <Skeleton className="h-full rounded-xl" />
      </div>
      <div className="w-72 space-y-3">
        <Skeleton className="h-8 w-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
