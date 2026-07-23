export default function IdentityLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-6 md:px-8 md:pb-10 md:pt-8">
      <div className="space-y-2">
        <div className="h-8 w-72 animate-pulse rounded-lg bg-zinc-800" />
        <div className="h-4 w-96 animate-pulse rounded-lg bg-zinc-800/60" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-zinc-900/80 p-5">
            <div className="h-3 w-16 animate-pulse rounded bg-zinc-800" />
            <div className="mt-2 h-8 w-12 animate-pulse rounded bg-zinc-800" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-zinc-900/80 p-5">
        <div className="h-5 w-32 animate-pulse rounded bg-zinc-800" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-16 animate-pulse rounded bg-zinc-800" />
              <div className="mt-1 h-5 w-10 animate-pulse rounded bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-zinc-900/80 p-5">
            <div className="h-4 w-28 animate-pulse rounded bg-zinc-800" />
            <div className="mt-2 h-3 w-36 animate-pulse rounded bg-zinc-800/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
