import { Button } from "@/components/ui/button";
import { RotateCcw, FlaskConical, Copy } from "lucide-react";

export function SandboxEnvironment() {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Sandbox Environment</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Test and develop with a fully isolated sandbox</p>
      </div>

      <div className="rounded-xl border border-gold/10 bg-gold/[0.03] p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10">
              <FlaskConical className="h-4 w-4 text-gold" />
            </div>
            <div>
              <span className="text-sm font-medium text-white">Sandbox Status</span>
              <span className="block text-xs text-gold">Active and Operational</span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Sandbox
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 px-3 py-2">
            <p className="text-[10px] text-zinc-600">Sample Organization</p>
            <p className="text-xs text-zinc-300 font-mono mt-0.5">demo-company</p>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 px-3 py-2">
            <p className="text-[10px] text-zinc-600">Demo Credentials</p>
            <p className="text-xs text-zinc-300 font-mono mt-0.5">demo@perionyx.io / ••••••••</p>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 px-3 py-2">
            <p className="text-[10px] text-zinc-600">API Endpoint</p>
            <div className="flex items-center gap-1">
              <p className="text-xs text-zinc-300 font-mono mt-0.5 truncate flex-1">https://sandbox.api.perionyx.io</p>
              <Copy className="h-3 w-3 shrink-0 text-zinc-600 hover:text-zinc-400 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
