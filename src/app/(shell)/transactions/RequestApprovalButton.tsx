"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function RequestApprovalButton({ transactionId }: { transactionId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const requestApproval = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/v1/transactions/${transactionId}/request-approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (res.ok) {
        setMessage('Approval request submitted.');
      } else {
        setMessage(json?.message ?? 'Failed to request approval');
      }
    } catch (err: any) {
      setMessage(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <Button onClick={requestApproval} disabled={loading} variant="default" size="sm">
        {loading ? 'Requesting…' : 'Request approval'}
      </Button>
      {message ? <p className="mt-2 text-sm text-perionyx-text-muted">{message}</p> : null}
    </div>
  );
}
