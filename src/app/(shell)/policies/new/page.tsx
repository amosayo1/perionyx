"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

type Rule = {
  field: string;
  operator: string;
  value: string;
};

export default function NewPolicyPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("TRANSACTION");
  const [priority, setPriority] = useState("100");
  const [action, setAction] = useState("ALLOW");
  const [rules, setRules] = useState<Rule[]>([{ field: "amount", operator: "LESS_THAN", value: "" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addRule = useCallback(() => {
    setRules((prev) => [...prev, { field: "amount", operator: "LESS_THAN", value: "" }]);
  }, []);

  const removeRule = useCallback((idx: number) => {
    setRules((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const updateRule = useCallback((idx: number, key: keyof Rule, val: string) => {
    setRules((prev) => prev.map((r, i) => (i === idx ? { ...r, [key]: val } : r)));
  }, []);

  const save = useCallback(async () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/policies", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          type,
          priority: Number(priority),
          action,
          rules: rules.filter((r) => r.field && r.value),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed to create policy" }));
        setError(err.message ?? "Failed to create policy");
        return;
      }
      router.push("/policies");
    } catch {
      setError("Unable to save policy.");
    } finally {
      setSaving(false);
    }
  }, [name, description, type, priority, action, rules, router]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/policies" className="inline-flex items-center text-sm text-perionyx-text-muted hover:text-perionyx-text-primary">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to policies
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">New Policy</h1>
        <p className="mt-1 text-sm text-perionyx-text-muted">Create a new transaction policy.</p>
      </div>

      {error && (
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-perionyx-danger">Error</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-perionyx-text-muted">{error}</CardContent>
        </Card>
      )}

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Policy Details</CardTitle>
          <CardDescription className="text-perionyx-text-muted">Basic information about the policy.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="policy-name">Name</Label>
            <Input id="policy-name" placeholder="High-value transaction limit" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="policy-description">Description (optional)</Label>
            <Input id="policy-description"
              placeholder="Blocks transactions over $10,000"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="policy-type">Type</Label>
              <Select id="policy-type" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="TRANSACTION">Transaction</option>
                <option value="WITHDRAWAL">Withdrawal</option>
                <option value="DEPOSIT">Deposit</option>
                <option value="TRANSFER">Transfer</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="policy-priority">Priority</Label>
              <Input id="policy-priority" type="number" value={priority} onChange={(e) => setPriority(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="policy-action">Action</Label>
              <Select id="policy-action" value={action} onChange={(e) => setAction(e.target.value)}>
                <option value="ALLOW">Allow</option>
                <option value="BLOCK">Block</option>
                <option value="FLAG">Flag</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium text-perionyx-text-primary">Rules</CardTitle>
              <CardDescription className="text-perionyx-text-muted">
                Conditions that trigger this policy.
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={addRule}>
              <Plus className="mr-1 h-3 w-3" /> Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {rules.length === 0 ? (
            <p className="text-sm text-perionyx-text-subtle">No rules defined. Click "Add Rule" to add conditions.</p>
          ) : (
            rules.map((r, idx) => (
              <div
                key={idx}
                className="flex flex-wrap items-end gap-3 rounded-lg border border-[rgba(212,175,55,0.12)] bg-perionyx-bg-surface p-3"
              >
                <div className="space-y-1">
                  <Label className="text-xs">Field</Label>
                  <Select value={r.field} onChange={(e) => updateRule(idx, "field", e.target.value)}>
                    <option value="amount">Amount</option>
                    <option value="transactionType">Transaction Type</option>
                    <option value="currency">Currency</option>
                    <option value="walletId">Wallet</option>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Operator</Label>
                  <Select value={r.operator} onChange={(e) => updateRule(idx, "operator", e.target.value)}>
                    <option value="EQUALS">Equals</option>
                    <option value="NOT_EQUALS">Not equals</option>
                    <option value="GREATER_THAN">Greater than</option>
                    <option value="LESS_THAN">Less than</option>
                    <option value="GREATER_OR_EQUAL">Greater or equal</option>
                    <option value="LESS_OR_EQUAL">Less or equal</option>
                    <option value="IN">In</option>
                    <option value="NOT_IN">Not in</option>
                  </Select>
                </div>
                <div className="space-y-1 flex-1">
                  <Label className="text-xs">Value</Label>
                  <Input
                    placeholder="10000"
                    value={r.value}
                    onChange={(e) => updateRule(idx, "value", e.target.value)}
                  />
                </div>
                {rules.length > 1 && (
                  <Button size="sm" variant="ghost" className="text-perionyx-danger" onClick={() => removeRule(idx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push("/policies")}>Cancel</Button>
        <Button onClick={() => void save()} disabled={saving || !name.trim()}>
          {saving ? "Saving..." : "Create Policy"}
        </Button>
      </div>
    </div>
  );
}
