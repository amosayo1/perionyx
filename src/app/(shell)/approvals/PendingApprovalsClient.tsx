"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type Tx = {
  id: string;
  transactionId: string;
  companyId: string;
  status: string;
  createdAt: string;
  transaction?: { primaryAmount?: string | number; currency?: string } | null;
};

export default function PendingApprovalsClient() {
  const [items, setItems] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(false);
  const [minAmount, setMinAmount] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState('');

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/pending-approvals');
      const json = await res.json();
      if (res.ok && json?.pending) setItems(json.pending);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPending();
    const id = setInterval(() => void fetchPending(), 10000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (minAmount != null) {
        const amt = Number((it.transaction?.primaryAmount ?? 0) as any);
        if (isNaN(amt) || amt < minAmount) return false;
      }
      if (search.trim()) {
        const s = search.toLowerCase();
        if (!it.transactionId.toLowerCase().includes(s) && !(it.transaction?.currency ?? '').toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [items, minAmount, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Pending approvals</h1>
        <p className="mt-1 text-sm text-perionyx-text-muted">
          {filtered.length} transaction{filtered.length !== 1 ? 's' : ''} awaiting approval
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Input
          placeholder="Min amount"
          type="number"
          value={minAmount ?? ''}
          onChange={(e) => setMinAmount(e.target.value ? Number(e.target.value) : undefined)}
          className="h-9 w-32 rounded-lg border-perionyx-border bg-perionyx-bg-surface px-3 text-sm text-perionyx-text-primary placeholder:text-perionyx-text-faint focus:border-perionyx-gold focus:ring-1 focus:ring-perionyx-gold"
        />
        <Input
          placeholder="Search by ID or currency…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 max-w-xs rounded-lg border-perionyx-border bg-perionyx-bg-surface px-3 text-sm text-perionyx-text-primary placeholder:text-perionyx-text-faint focus:border-perionyx-gold focus:ring-1 focus:ring-perionyx-gold"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => void fetchPending()}
          className="h-9 rounded-lg border-perionyx-border px-4 text-sm text-perionyx-text-muted hover:text-perionyx-text-primary"
        >
          Refresh
        </Button>
      </div>

      <div className="rounded-xl border border-perionyx-border bg-perionyx-bg-panel">
        {loading && items.length === 0 && (
          <div className="p-8 text-center text-sm text-perionyx-text-faint">Loading…</div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-perionyx-text-faint">No pending approvals.</div>
        )}
        {filtered.map((p) => (
          <Link
            key={p.id}
            href={`/approvals/${p.id}`}
            className="flex items-center justify-between border-b border-perionyx-border px-6 py-4 last:border-b-0 transition-colors hover:bg-perionyx-bg-surface"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-perionyx-text-primary truncate">
                {p.transactionId}
              </p>
              <p className="mt-0.5 text-xs text-perionyx-text-muted">
                {p.transaction?.primaryAmount?.toString?.() ?? p.transaction?.primaryAmount} {p.transaction?.currency}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-perionyx-text-faint flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
