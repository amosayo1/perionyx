export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-6 md:px-8 md:pb-10 md:pt-8">
      <div className="animate-pulse space-y-6">
        <div className="h-28 rounded-xl bg-zinc-900/50" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-zinc-900/50" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="col-span-2 space-y-4">
            <div className="h-64 rounded-xl bg-zinc-900/50" />
            <div className="h-32 rounded-xl bg-zinc-900/50" />
          </div>
          <div className="space-y-4">
            <div className="h-64 rounded-xl bg-zinc-900/50" />
            <div className="h-48 rounded-xl bg-zinc-900/50" />
          </div>
        </div>
      </div>
    </div>
  );
}

