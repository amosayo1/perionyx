"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { startTransition, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/client-api";
import { Building2, CheckCircle2, XCircle } from "lucide-react";

type InviteData = {
  id: string;
  email: string;
  role: string;
  company: { id: string; name: string; slug: string };
  expiresAt: string;
};

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const { data: session, update } = useSession();
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch(`/api/v1/invites/${encodeURIComponent(token)}`, {
        credentials: "include",
        signal,
      });
      if (signal?.aborted) return;
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(getErrorMessage(body) || "Invitation not found");
        return;
      }
      const data = (await res.json()) as InviteData;
      setInvite(data);
    } catch {
      if (!signal?.aborted) setError("Failed to load invitation");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const ac = new AbortController();
    startTransition(() => void load(ac.signal));
    return () => ac.abort();
  }, [load]);

  async function handleAccept() {
    if (!session?.user?.id) {
      router.push(`/sign-up?token=${token}`);
      return;
    }
    setAccepting(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/invites/${encodeURIComponent(token)}/accept`, {
        method: "POST",
        credentials: "include",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(getErrorMessage(body) || "Failed to accept invitation");
        return;
      }
      if (body.companyId) {
        await update({ activeCompanyId: body.companyId });
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Skeleton className="h-56 w-full max-w-sm rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-xl border border-perionyx-border bg-perionyx-bg-panel p-8 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-perionyx-danger/10">
            <XCircle className="h-5 w-5 text-perionyx-danger" />
          </div>
          <h2 className="text-lg font-semibold text-perionyx-text-primary">Invitation error</h2>
          <p className="mt-2 text-sm text-perionyx-text-muted">{error}</p>
          <Button
            variant="outline"
            onClick={() => router.push("/sign-in")}
            className="mt-6 h-10 rounded-lg border-perionyx-border px-4 text-sm text-perionyx-text-primary hover:bg-perionyx-bg-surface"
          >
            Go to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border border-perionyx-border bg-perionyx-bg-panel p-8">
        <div className="mx-auto mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-perionyx-gold/10">
          <Building2 className="h-5 w-5 text-perionyx-gold" />
        </div>

        <h2 className="text-center text-lg font-semibold text-perionyx-text-primary">
          You&apos;re invited
        </h2>
        <p className="mt-2 text-center text-sm text-perionyx-text-muted">
          <strong className="text-perionyx-text-primary">{invite?.company.name}</strong> has invited you to join their workspace on Perionyx.
        </p>

        <div className="mt-6 space-y-3 rounded-lg border border-perionyx-border bg-perionyx-bg-surface p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-perionyx-text-muted">Role</span>
            <span className="font-medium text-perionyx-text-primary">{invite?.role}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-perionyx-text-muted">Email</span>
            <span className="font-medium text-perionyx-text-primary">{invite?.email}</span>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-perionyx-danger">{error}</p>}

        <Button
          className="mt-6 h-10 w-full rounded-lg bg-perionyx-gold text-sm font-medium text-black hover:bg-perionyx-gold-soft disabled:opacity-50"
          onClick={() => void handleAccept()}
          disabled={accepting}
        >
          {accepting ? "Accepting…" : session?.user?.id ? "Accept & join" : "Sign in to accept"}
        </Button>
      </div>
    </div>
  );
}
