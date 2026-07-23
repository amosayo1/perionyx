"use client";

import { cn } from "@/lib/utils";
import { memo, useState } from "react";
import { Lock, Shield, Check, Loader2, ArrowRight, ExternalLink } from "lucide-react";
import type { BankProvider, BankInstitution } from "./types";

interface AuthenticationFlowProps {
  provider: BankProvider;
  institution: BankInstitution;
  onComplete: () => void;
  className?: string;
}

export const AuthenticationFlow = memo(function AuthenticationFlow({
  provider,
  institution,
  onComplete,
  className,
}: AuthenticationFlowProps) {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setConnecting(false);
    setConnected(true);
  };

  if (connected) {
    return (
      <div className={cn("space-y-4", className)} role="group" aria-label="Connection successful">
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <Check className="h-8 w-8 text-emerald-400" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-medium text-white/[0.87]">Connection Verified</h2>
          <p className="text-sm text-white/[0.5] max-w-sm">
            Successfully connected to <span className="text-white/[0.7]">{institution.name}</span> via <span className="text-white/[0.7]">{provider.name}</span>
          </p>
          <button
            type="button"
            onClick={onComplete}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
          >
            Continue to Account Selection
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)} role="group" aria-label="Authentication">
      <div className="flex items-center gap-2">
        <Lock className="h-5 w-5 text-gold" aria-hidden="true" />
        <h2 className="text-lg font-medium text-white/[0.87]">Authentication</h2>
      </div>
      <p className="text-sm text-white/[0.5]">
        Securely connect to <span className="text-white/[0.7]">{institution.name}</span> using <span className="text-white/[0.7]">{provider.name}</span>
      </p>

      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-gold" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-white/[0.87]">{provider.authTypes[0]} Authentication</p>
            <p className="text-xs text-white/[0.5]">You will be redirected to {provider.name} to securely authenticate</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-white/[0.5]">
            <Check className="h-3 w-3 text-emerald-400" aria-hidden="true" />
            End-to-end encrypted
          </div>
          <div className="flex items-center gap-2 text-xs text-white/[0.5]">
            <Check className="h-3 w-3 text-emerald-400" aria-hidden="true" />
            Read-only access (unless payments enabled)
          </div>
          <div className="flex items-center gap-2 text-xs text-white/[0.5]">
            <Check className="h-3 w-3 text-emerald-400" aria-hidden="true" />
            No credentials stored on our servers
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400" role="alert">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleConnect}
          disabled={connecting}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all",
            connecting
              ? "bg-gold/50 cursor-not-allowed text-black/50"
              : "bg-gold text-black hover:opacity-90",
          )}
        >
          {connecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Connecting...
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Connect with {provider.name}
            </>
          )}
        </button>
      </div>
    </div>
  );
});
