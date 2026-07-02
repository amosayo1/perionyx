export default function CommandCenterLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="mb-6 space-y-3">
        <div className="h-8 w-64 rounded bg-zinc-800" />
        <div className="h-4 w-96 rounded bg-zinc-800/50" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-zinc-900 border border-white/[0.06]" />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 rounded-xl bg-zinc-900 border border-white/[0.06]" />
        ))}
      </div>
    </div>
  );
}
