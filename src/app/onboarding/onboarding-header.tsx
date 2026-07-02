"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OnboardingHeader() {
  return (
    <header className="flex items-center justify-between border-b border-perionyx-border bg-perionyx-bg-primary px-6 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-perionyx-gold overflow-hidden">
          <img src="/logo.PNG" alt="Perionyx" className="h-full w-full object-cover" />
        </div>
        <span className="text-sm font-medium text-perionyx-text-primary">Perionyx</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-sm text-perionyx-text-muted hover:text-perionyx-text-primary"
        onClick={() =>
          void signOut({
            callbackUrl: "/sign-in",
          })
        }
      >
        <LogOut className="h-3.5 w-3.5" />
        Sign out
      </Button>
    </header>
  );
}
