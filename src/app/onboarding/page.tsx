"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { getErrorMessage } from "@/lib/client-api";
import { ChevronRight } from "lucide-react";

function slugify(name: string) {
  const s = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return (s.length >= 2 ? s : "company") || "company";
}

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const [step, setStep] = useState<"company" | "kyc">("company");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [legalName, setLegalName] = useState("");
  const [ein, setEin] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [incorporationDate, setIncorporationDate] = useState("");
  const [address, setAddress] = useState("");

  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  async function onCreateCompany(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const normalizedSlug = slug.trim();
      const finalSlug = normalizedSlug.length > 0 ? normalizedSlug : slugify(name);

      const res = await fetch("/api/v1/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, slug: finalSlug }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(getErrorMessage(body));
        return;
      }

      if (typeof body?.id === "string") {
        await update({ activeCompanyId: body.id });
        setCompanyId(body.id);
        setCompanyName(name);
        setStep("kyc");
      } else {
        await update({});
        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function onSaveKyc(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/companies/${companyId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legalName: legalName || null,
          ein: ein || null,
          jurisdiction: jurisdiction || null,
          entityType: entityType || null,
          incorporationDate: incorporationDate || null,
          address: address || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(getErrorMessage(body));
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function skipToDashboard() {
    router.push("/dashboard");
    router.refresh();
  }

  if (step === "kyc") {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col justify-center px-4 py-12">
        <div className="mb-8 flex items-center gap-2 text-sm text-perionyx-text-muted">
          <span className="text-perionyx-gold">{companyName}</span>
          <ChevronRight className="h-3 w-3 text-perionyx-text-faint" />
          <span className="text-perionyx-text-primary">Entity profile</span>
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">
            Complete your entity profile
          </h1>
          <p className="mt-2 text-sm leading-6 text-perionyx-text-muted">
            Legal entity details for compliance and KYC verification. You can also do this later from Settings.
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-perionyx-border bg-perionyx-bg-panel p-8">
          <form className="space-y-5" onSubmit={(e) => void onSaveKyc(e)}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="legalName" className="text-sm text-perionyx-text-subtle">Legal name</Label>
                <Input
                  id="legalName"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="Acme Corp"
                  className="h-10 rounded-lg border-perionyx-border bg-perionyx-bg-surface px-3 text-sm text-perionyx-text-primary placeholder:text-perionyx-text-faint focus:border-perionyx-gold focus:ring-1 focus:ring-perionyx-gold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ein" className="text-sm text-perionyx-text-subtle">EIN / Tax ID</Label>
                <Input
                  id="ein"
                  value={ein}
                  onChange={(e) => setEin(e.target.value)}
                  placeholder="XX-XXXXXXX"
                  className="h-10 rounded-lg border-perionyx-border bg-perionyx-bg-surface px-3 text-sm text-perionyx-text-primary placeholder:text-perionyx-text-faint focus:border-perionyx-gold focus:ring-1 focus:ring-perionyx-gold"
                />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="entityType" className="text-sm text-perionyx-text-subtle">Entity type</Label>
                <Select value={entityType} onChange={(e) => setEntityType(e.target.value)}
                  className="h-10 rounded-lg border-perionyx-border bg-perionyx-bg-surface text-sm text-perionyx-text-primary focus:border-perionyx-gold focus:ring-1 focus:ring-perionyx-gold">
                  <option value="">Select type…</option>
                  <option value="LLC">LLC</option>
                  <option value="Corporation">Corporation</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="Non-Profit">Non-Profit</option>
                  <option value="Trust">Trust</option>
                  <option value="Government">Government</option>
                  <option value="Other">Other</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jurisdiction" className="text-sm text-perionyx-text-subtle">Jurisdiction</Label>
                <Input
                  id="jurisdiction"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  placeholder="Delaware, USA"
                  className="h-10 rounded-lg border-perionyx-border bg-perionyx-bg-surface px-3 text-sm text-perionyx-text-primary placeholder:text-perionyx-text-faint focus:border-perionyx-gold focus:ring-1 focus:ring-perionyx-gold"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="incorporationDate" className="text-sm text-perionyx-text-subtle">Incorporation date</Label>
              <Input
                id="incorporationDate"
                type="date"
                value={incorporationDate}
                onChange={(e) => setIncorporationDate(e.target.value)}
                className="h-10 rounded-lg border-perionyx-border bg-perionyx-bg-surface px-3 text-sm text-perionyx-text-primary focus:border-perionyx-gold focus:ring-1 focus:ring-perionyx-gold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm text-perionyx-text-subtle">Registered address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, City, State, ZIP"
                className="h-10 rounded-lg border-perionyx-border bg-perionyx-bg-surface px-3 text-sm text-perionyx-text-primary placeholder:text-perionyx-text-faint focus:border-perionyx-gold focus:ring-1 focus:ring-perionyx-gold"
              />
            </div>
            {error ? <p className="text-sm text-perionyx-danger">{error}</p> : null}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="h-10 rounded-lg bg-perionyx-gold px-6 text-sm font-medium text-black hover:bg-perionyx-gold-soft disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Saving…" : "Save & continue"}
              </Button>
              <Button type="button" variant="ghost" onClick={skipToDashboard}
                className="h-10 rounded-lg px-4 text-sm text-perionyx-text-muted hover:text-perionyx-text-primary">
                Skip for now
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-lg flex-col justify-center px-4 py-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">
          Create your first company
        </h1>
        <p className="mt-2 text-sm leading-6 text-perionyx-text-muted">
          Companies isolate balances, wallets, and audit trails. You can invite teammates later.
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-perionyx-border bg-perionyx-bg-panel p-8">
        <form className="space-y-5" onSubmit={(e) => void onCreateCompany(e)}>
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-sm text-perionyx-text-subtle">Company name</Label>
            <Input
              id="companyName"
              required
              maxLength={255}
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Acme Treasury"
              className="h-10 rounded-lg border-perionyx-border bg-perionyx-bg-surface px-3 text-sm text-perionyx-text-primary placeholder:text-perionyx-text-faint focus:border-perionyx-gold focus:ring-1 focus:ring-perionyx-gold"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug" className="text-sm text-perionyx-text-subtle">
              Slug <span className="text-perionyx-text-faint">(optional)</span>
            </Label>
            <Input
              id="slug"
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value.toLowerCase());
              }}
              placeholder="acme-treasury"
              className="h-10 rounded-lg border-perionyx-border bg-perionyx-bg-surface px-3 text-sm text-perionyx-text-primary placeholder:text-perionyx-text-faint focus:border-perionyx-gold focus:ring-1 focus:ring-perionyx-gold"
            />
            <p className="text-xs text-perionyx-text-faint">Lowercase letters, numbers, and hyphens only.</p>
          </div>
          {error ? <p className="text-sm text-perionyx-danger">{error}</p> : null}
          <Button
            type="submit"
            className="h-10 rounded-lg bg-perionyx-gold px-6 text-sm font-medium text-black hover:bg-perionyx-gold-soft disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Creating…" : "Continue to entity profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}
