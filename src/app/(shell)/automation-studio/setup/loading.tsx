import { Skeleton } from "@/components/ui/skeleton";

export default function OnboardingSetupLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-96" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}
