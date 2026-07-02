import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";

export function IncidentHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2 text-xs text-zinc-600 mb-1">
          <Link href="/operations" className="hover:text-zinc-400 transition-colors">
            Operations
          </Link>
          <span>/</span>
          <span className="text-zinc-400">Incidents</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Incident Management
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Track, investigate, and resolve operational incidents
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
          <Link href="/operations">
            <ArrowLeft className="h-3.5 w-3.5" />
            Operations
          </Link>
        </Button>
      </div>
    </div>
  );
}
