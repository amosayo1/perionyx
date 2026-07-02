import type { Sdk } from "./types";
import { Button } from "@/components/ui/button";
import { BookOpen, Terminal } from "lucide-react";

export function SdkCard({ sdk }: { sdk: Sdk }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3 transition-all hover:bg-zinc-900/60 hover:border-white/[0.1]">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-xs font-bold text-zinc-400">
          {sdk.language.slice(0, 2)}
        </div>
        <div>
          <span className="text-sm font-medium text-white">{sdk.language}</span>
          <span className="block text-[10px] text-zinc-600">v{sdk.latestVersion} — Released {sdk.releaseDate}</span>
        </div>
      </div>
      <div className="rounded-lg bg-zinc-950 px-3 py-2 mb-3">
        <code className="text-[11px] text-[#d4af37] font-mono">{sdk.packageManager}</code>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="gap-1.5 text-xs flex-1">
          <Terminal className="h-3 w-3" />
          Quick Start
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs flex-1">
          <BookOpen className="h-3 w-3" />
          Docs
        </Button>
      </div>
    </div>
  );
}
