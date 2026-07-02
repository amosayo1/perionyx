"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignInForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canSubmit = email.length > 0 && password.length >= 8;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      if (res?.error || !res?.ok) {
        if (res?.error?.startsWith("ACCOUNT_LOCKED:")) {
          const minutes = res.error.split(":")[1] ?? "15";
          setError(`Account temporarily locked. Try again in ${minutes} minute${minutes === "1" ? "" : "s"}.`);
        } else {
          setError("Invalid email or password.");
        }
        return;
      }
      router.push(callbackUrl);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm text-perionyx-text-subtle">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          className="h-10 rounded-lg border-perionyx-border bg-perionyx-bg-surface px-3 text-sm text-perionyx-text-primary placeholder:text-perionyx-text-faint focus:border-perionyx-gold focus:ring-1 focus:ring-perionyx-gold"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm text-perionyx-text-subtle">Password</Label>
          <Link href="/forgot-password" className="text-xs text-zinc-500 hover:text-[#d4af37] transition-colors">
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="h-10 rounded-lg border-perionyx-border bg-perionyx-bg-surface px-3 text-sm text-perionyx-text-primary placeholder:text-perionyx-text-faint focus:border-perionyx-gold focus:ring-1 focus:ring-perionyx-gold"
          aria-invalid={!!error}
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-perionyx-danger">{error}</p>
      ) : null}

      <Button
        type="submit"
        className="h-10 w-full rounded-lg bg-perionyx-gold text-sm font-medium text-black hover:bg-perionyx-gold-soft disabled:opacity-50"
        disabled={loading || !canSubmit}
      >
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
