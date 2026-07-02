"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getErrorMessage } from "@/lib/client-api";
import { Save, Building2 } from "lucide-react";

type CompanyData = {
  id: string;
  name: string;
  slug: string;
  legalName: string | null;
  ein: string | null;
  jurisdiction: string | null;
  entityType: string | null;
  incorporationDate: string | null;
  address: string | null;
  verificationStatus: string;
  verifiedAt: string | null;
};

export default function CompanySettingsPage() {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [legalName, setLegalName] = useState("");
  const [ein, setEin] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [incorporationDate, setIncorporationDate] = useState("");
  const [address, setAddress] = useState("");

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/v1/companies", { credentials: "include", signal });
      if (signal?.aborted) return;
      const body = (await res.json()) as { items: Array<{ company: CompanyData }> };
      const items = Array.isArray(body.items) ? body.items : [];
      const c = items[0]?.company ?? null;
      if (c) {
        setCompany(c);
        setLegalName(c.legalName ?? "");
        setEin(c.ein ?? "");
        setJurisdiction(c.jurisdiction ?? "");
        setEntityType(c.entityType ?? "");
        setIncorporationDate(c.incorporationDate ? c.incorporationDate.split("T")[0] : "");
        setAddress(c.address ?? "");
      }
    } catch {
      //
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    startTransition(() => void load(ac.signal));
    return () => ac.abort();
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!company) return;
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/companies/${company.id}`, {
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
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(getErrorMessage(body));
        return;
      }
      setCompany(body);
      setSuccess(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <p className="text-perionyx-text-muted">No company found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="h-6 w-6 text-perionyx-gold" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Company Profile</h1>
          <p className="text-sm text-perionyx-text-muted">{company.name} &middot; {company.slug}</p>
        </div>
        <Badge variant={company.verificationStatus === "VERIFIED" ? "success" : "secondary"} className="ml-auto">
          {company.verificationStatus}
        </Badge>
      </div>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Entity Details</CardTitle>
          <CardDescription className="text-perionyx-text-muted">
            Legal entity information used for compliance and KYC verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => void handleSave(e)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="legalName">Legal name</Label>
                <Input
                  id="legalName"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="Acme Corp"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ein">EIN / Tax ID</Label>
                <Input
                  id="ein"
                  value={ein}
                  onChange={(e) => setEin(e.target.value)}
                  placeholder="XX-XXXXXXX"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="entityType">Entity type</Label>
                <Select value={entityType} onChange={(e) => setEntityType(e.target.value)}>
                  <option value="">Select type...</option>
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
                <Label htmlFor="jurisdiction">Jurisdiction</Label>
                <Input
                  id="jurisdiction"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  placeholder="Delaware, USA"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="incorporationDate">Incorporation date</Label>
              <Input
                id="incorporationDate"
                type="date"
                value={incorporationDate}
                onChange={(e) => setIncorporationDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Registered address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, City, State, ZIP"
              />
            </div>
            {error ? <p className="text-sm text-perionyx-danger">{error}</p> : null}
            {success ? <p className="text-sm text-green-400">Company profile saved.</p> : null}
            <Button type="submit" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
