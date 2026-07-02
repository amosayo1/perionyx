"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/client-api";

const PWD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
];

function SignUpForm({ inviteToken }: { inviteToken?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canSubmit = email.length > 0 && PWD_RULES.every((r) => r.test(password));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: name || undefined,
          inviteToken,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(getErrorMessage(body));
        return;
      }
      if (body.companyId) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-10">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-perionyx-gold overflow-hidden">
          <img src="/logo.PNG" alt="Perionyx" className="h-full w-full object-cover" />
        </div>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-perionyx-text-primary sm:text-4xl">
        {inviteToken ? "Join your workspace" : "Create your workspace"}
      </h1>
      <p className="mt-4 text-base leading-7 text-perionyx-text-muted">
        {inviteToken
          ? "Create your account to access the workspace."
          : "Set up your PERIONYX workspace and start managing multi-currency wallets, approvals, treasury, and financial operations."
        }
      </p>

      <form onSubmit={(e) => void onSubmit(e)} className="mt-12 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm text-perionyx-text-subtle">
            Full name <span className="text-perionyx-text-faint">(optional)</span>
          </Label>
          <Input
            id="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
            className="h-10 rounded-lg border-perionyx-border bg-perionyx-bg-surface px-3 text-sm text-perionyx-text-primary placeholder:text-perionyx-text-faint focus:border-perionyx-gold focus:ring-1 focus:ring-perionyx-gold"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm text-perionyx-text-subtle">
            Work email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@company.com"
            className="h-10 rounded-lg border-perionyx-border bg-perionyx-bg-surface px-3 text-sm text-perionyx-text-primary placeholder:text-perionyx-text-faint focus:border-perionyx-gold focus:ring-1 focus:ring-perionyx-gold"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm text-perionyx-text-subtle">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            className="h-10 rounded-lg border-perionyx-border bg-perionyx-bg-surface px-3 text-sm text-perionyx-text-primary placeholder:text-perionyx-text-faint focus:border-perionyx-gold focus:ring-1 focus:ring-perionyx-gold"
          />
          <ul className="space-y-1">
            {PWD_RULES.map((rule) => {
              const ok = rule.test(password);
              return (
                <li
                  key={rule.label}
                  className={`flex items-center gap-1.5 text-xs transition-colors ${
                    ok ? "text-perionyx-success" : "text-perionyx-text-faint"
                  }`}
                >
                  <span className="text-[10px]">{ok ? "✓" : "○"}</span>
                  {rule.label}
                </li>
              );
            })}
          </ul>
        </div>
        {error ? (
          <p role="alert" className="text-sm text-perionyx-danger">{error}</p>
        ) : null}
        <Button
          type="submit"
          className="h-10 w-full rounded-lg bg-perionyx-gold text-sm font-medium text-black hover:bg-perionyx-gold-soft disabled:opacity-50"
          disabled={loading || !canSubmit}
        >
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-perionyx-text-muted">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-semibold text-perionyx-gold hover:text-perionyx-gold-soft">
          Sign in
        </Link>
      </p>
    </>
  );
}

function SignUpPageInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div className="grid w-full grid-cols-1 gap-0 lg:grid-cols-[1fr_1.1fr]">
      <section className="flex flex-col justify-center border-r border-perionyx-border px-8 py-12 lg:px-16">
        <div className="max-w-md">
          <SignUpForm inviteToken={token ?? undefined} />
        </div>
      </section>

      <section className="hidden items-center justify-center bg-gradient-to-br from-perionyx-bg2 to-perionyx-bg3 p-16 lg:flex">
        <div className="max-w-sm space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-perionyx-gold/10">
            <span className="text-2xl font-bold text-perionyx-gold">V</span>
          </div>
          <h2 className="text-2xl font-semibold text-perionyx-text-primary">
            Enterprise Treasury OS
          </h2>
          <p className="text-base leading-7 text-perionyx-text-muted">
            Multi-currency wallets, double-entry ledger, policy-driven approvals, Plaid bank
            connectivity, and an immutable audit trail — all in one platform.
          </p>
          <div className="flex flex-wrap gap-3">
            {["Ledger-backed", "Multi-tenant", "SOC2-ready"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-perionyx-border bg-perionyx-bg-surface px-3 py-1 text-xs text-perionyx-text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpPageInner />
    </Suspense>
  );
}
