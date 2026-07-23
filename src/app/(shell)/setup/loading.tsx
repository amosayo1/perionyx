import { Skeleton } from "@/components/ui/skeleton";

export default function SetupLoading() {
  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-[500px] rounded-xl" />
        </div>
      </div>
    </div>
  );
}
