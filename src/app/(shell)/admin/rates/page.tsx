"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { getErrorMessage } from "@/lib/client-api";

type RateRow = {
  id: string;
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  source: string;
  updatedAt: string;
};

export default function ExchangeRatesPage() {
  const [rates, setRates] = useState<RateRow[]>([]);
  const [available, setAvailable] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [quoteCurrency, setQuoteCurrency] = useState("EUR");
  const [newRate, setNewRate] = useState("");
  const [saving, setSaving] = useState(false);

  const [convertFrom, setConvertFrom] = useState("USD");
  const [convertTo, setConvertTo] = useState("EUR");
  const [convertAmount, setConvertAmount] = useState("100");
  const [convertResult, setConvertResult] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);

  const fetchRates = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/currencies/rates");
      if (!res.ok) return;
      const data = await res.json();
      setRates(data.rates ?? []);
      setAvailable(data.available ?? []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void fetchRates(); }, [fetchRates]);

  async function handleAddRate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/currencies/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseCurrency, quoteCurrency, rate: parseFloat(newRate) }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(getErrorMessage(body) || "Failed to set rate");
        return;
      }
      setNewRate("");
      await fetchRates();
    } catch { setError("Something went wrong"); }
    finally { setSaving(false); }
  }

  async function handleConvert(e: React.FormEvent) {
    e.preventDefault();
    setConverting(true);
    setConvertResult(null);
    try {
      const res = await fetch("/api/v1/currencies/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(convertAmount), from: convertFrom, to: convertTo }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(getErrorMessage(body) || "Conversion failed");
        return;
      }
      const data = await res.json();
      setConvertResult(`${convertAmount} ${convertFrom} = ${data.convertedAmount} ${convertTo} (rate: ${data.rate})`);
    } catch { setError("Something went wrong"); }
    finally { setConverting(false); }
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Exchange rates</h1>
        <p className="mt-1 text-sm text-perionyx-text-muted">Manage currency conversion rates across your workspace.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Converter */}
        <div className="rounded-xl border border-perionyx-border bg-perionyx-bg-panel p-6">
          <h2 className="text-sm font-medium text-perionyx-text-primary">Currency converter</h2>
          <p className="mt-1 text-xs text-perionyx-text-muted">Convert amounts between currencies.</p>
          <form onSubmit={(e) => void handleConvert(e)} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="rate-convert-amount" className="text-xs text-perionyx-text-subtle">Amount</Label>
                <Input id="rate-convert-amount" type="number" step="any" value={convertAmount} onChange={(e) => setConvertAmount(e.target.value)}
                  className="h-9 rounded-lg border-perionyx-border bg-perionyx-bg-surface px-3 text-sm" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate-convert-from" className="text-xs text-perionyx-text-subtle">From</Label>
                <Select id="rate-convert-from" value={convertFrom} onChange={(e) => setConvertFrom(e.target.value)}
                  className="h-9 rounded-lg border-perionyx-border bg-perionyx-bg-surface text-sm">
                  {available.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate-convert-to" className="text-xs text-perionyx-text-subtle">To</Label>
                <Select id="rate-convert-to" value={convertTo} onChange={(e) => setConvertTo(e.target.value)}
                  className="h-9 rounded-lg border-perionyx-border bg-perionyx-bg-surface text-sm">
                  {available.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
            </div>
            {convertResult && <p className="text-sm text-perionyx-gold">{convertResult}</p>}
            <Button type="submit" disabled={converting}
              className="h-9 rounded-lg bg-perionyx-gold px-4 text-sm font-medium text-black hover:bg-perionyx-gold-soft disabled:opacity-50">
              {converting ? "Converting…" : "Convert"}
            </Button>
          </form>
        </div>

        {/* Set rate */}
        <div className="rounded-xl border border-perionyx-border bg-perionyx-bg-panel p-6">
          <h2 className="text-sm font-medium text-perionyx-text-primary">Set exchange rate</h2>
          <p className="mt-1 text-xs text-perionyx-text-muted">Manually set a rate for a currency pair.</p>
          <form onSubmit={(e) => void handleAddRate(e)} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="rate-set-from" className="text-xs text-perionyx-text-subtle">From</Label>
                <Select id="rate-set-from" value={baseCurrency} onChange={(e) => setBaseCurrency(e.target.value)}
                  className="h-9 rounded-lg border-perionyx-border bg-perionyx-bg-surface text-sm">
                  {available.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate-set-to" className="text-xs text-perionyx-text-subtle">To</Label>
                <Select id="rate-set-to" value={quoteCurrency} onChange={(e) => setQuoteCurrency(e.target.value)}
                  className="h-9 rounded-lg border-perionyx-border bg-perionyx-bg-surface text-sm">
                  {available.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate-set-rate" className="text-xs text-perionyx-text-subtle">Rate</Label>
                <Input id="rate-set-rate" type="number" step="any" min="0" value={newRate} onChange={(e) => setNewRate(e.target.value)}
                  className="h-9 rounded-lg border-perionyx-border bg-perionyx-bg-surface px-3 text-sm" required placeholder="0.92" />
              </div>
            </div>
            {error && <p className="text-sm text-perionyx-danger">{error}</p>}
            <Button type="submit" disabled={saving || !newRate}
              className="h-9 rounded-lg bg-perionyx-gold px-4 text-sm font-medium text-black hover:bg-perionyx-gold-soft disabled:opacity-50">
              {saving ? "Saving…" : "Set rate"}
            </Button>
          </form>
        </div>
      </div>

      {/* Rates table */}
      <div className="rounded-xl border border-perionyx-border bg-perionyx-bg-panel">
        <div className="border-b border-perionyx-border px-6 py-4">
          <h2 className="text-sm font-medium text-perionyx-text-primary">Saved rates</h2>
        </div>
        {loading ? (
          <div className="p-6 text-center text-sm text-perionyx-text-faint">Loading…</div>
        ) : rates.length === 0 ? (
          <div className="p-6 text-center text-sm text-perionyx-text-faint">No rates set. Rates from fallback data are available for conversion.</div>
        ) : (
          <div className="divide-y divide-perionyx-border">
            {rates.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <span className="text-sm font-medium text-perionyx-text-primary">{r.baseCurrency} → {r.quoteCurrency}</span>
                  <span className="ml-3 text-xs text-perionyx-text-muted">{r.source}</span>
                </div>
                <div className="text-sm text-perionyx-text-primary">{r.rate}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
