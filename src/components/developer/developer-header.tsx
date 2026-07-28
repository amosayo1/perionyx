"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Key, BookOpen, FlaskConical, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function DeveloperHeader() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const generatedKey = "perionyx_live_8xR3kM9p2wQ7HnL4vT6b";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Developer Portal</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-500 leading-relaxed">
          Everything engineering teams need to integrate with PERIONYX.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="default"
          size="sm"
          className="gap-1.5 text-xs bg-gold/10 text-gold border-gold/20 hover:bg-gold/20"
          onClick={() => setDialogOpen(true)}
        >
          <Key className="h-3.5 w-3.5" />
          Generate API Key
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => window.open("https://docs.perionyx.dev", "_blank")}>
          <BookOpen className="h-3.5 w-3.5" />
          Docs
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => toast.success("Sandbox environment ready — API base: https://sandbox.perionyx.dev")}>
          <FlaskConical className="h-3.5 w-3.5" />
          Sandbox
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md">
          <DialogHeader>
            <DialogTitle>API Key Generated</DialogTitle>
            <DialogDescription>Copy this key now. You won&apos;t be able to see it again.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900/60 px-3 py-2">
            <code className="flex-1 font-mono text-xs text-gold truncate">{generatedKey}</code>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(generatedKey);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}