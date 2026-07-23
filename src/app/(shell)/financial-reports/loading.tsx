import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-6 md:px-8 md:pb-10 md:pt-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 bg-zinc-800" />
        <Skeleton className="h-4 w-96 bg-zinc-800" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
            <Skeleton className="h-3 w-20 mb-3 bg-zinc-800" />
            <Skeleton className="h-7 w-16 mb-2 bg-zinc-800" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl bg-zinc-900/40 border border-white/[0.06]" />
        ))}
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
        <Skeleton className="h-5 w-32 mb-4 bg-zinc-800" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full mb-2 bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}
