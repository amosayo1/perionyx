"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-6 md:px-8 md:pb-10 md:pt-8">
      <div className="flex flex-col items-center justify-center py-20">
        <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-6 mb-6">
          <p role="alert" className="text-red-400 font-medium">Something went wrong loading reports</p>
          <p className="text-sm text-zinc-400 mt-1">The reporting engine encountered an error.</p>
        </div>
        <button
          onClick={reset}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
