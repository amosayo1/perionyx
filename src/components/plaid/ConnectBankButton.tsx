"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Banknote, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  accountId: string;
  accountName: string;
  onLinked: () => void;
};

export function ConnectBankButton({ accountId, accountName, onLinked }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [simulateName, setSimulateName] = useState("");
  const [simulateMode, setSimulateMode] = useState(false);

  const handleConnect = useCallback(async () => {
    setLoading(true);
    try {
      // Step 1: get link token
      const tokenRes = await fetch("/api/v1/plaid/link-token", {
        method: "POST", credentials: "include",
      });
      const { linkToken, isMock } = await tokenRes.json();

      if (isMock) {
        // Demo mode: show mock dialog
        setSimulateMode(true);
        setSimulateName("");
        return;
      }

      if (typeof window !== "undefined" && (window as any).Plaid) {
        const handler = (window as any).Plaid.create({
          token: linkToken,
          onSuccess: async (publicToken: string) => {
            await fetch("/api/v1/plaid/exchange", {
              method: "POST", credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ publicToken, accountId }),
            });
            onLinked();
          },
        });
        handler.open();
      } else {
        // Plaid CDN not loaded — fallback to mock
        setSimulateMode(true);
        setSimulateName("");
      }
    } finally {
      setLoading(false);
    }
  }, [accountId, onLinked]);

  const handleMockComplete = useCallback(async () => {
    setLoading(true);
    try {
      await fetch("/api/v1/plaid/exchange", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicToken: `mock-public-${Date.now()}`,
          accountId,
        }),
      });
      setOpen(false);
      setSimulateMode(false);
      onLinked();
    } finally {
      setLoading(false);
    }
  }, [accountId, onLinked]);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" className="gap-2">
        <Banknote className="h-4 w-4" />
        Connect Bank
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) setSimulateMode(false); setOpen(v); }}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md">
          {!simulateMode ? (
            <>
              <DialogHeader>
                <DialogTitle>Connect a Bank Account</DialogTitle>
                <DialogDescription>
                  Link your real bank account to <strong>{accountName}</strong> via Plaid.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <p className="text-sm text-perionyx-text-muted">
                  Perionyx uses Plaid to securely connect to your financial institution.
                  Your credentials are never stored on our servers.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => void handleConnect()} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Continue to Plaid
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Simulate Bank Connection</DialogTitle>
                <DialogDescription>
                  Demo mode: enter a bank name to simulate connecting a bank account.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Bank name</Label>
                  <Input
                    placeholder="Chase Business Checking"
                    value={simulateName}
                    onChange={(e) => setSimulateName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSimulateMode(false)}>Back</Button>
                <Button onClick={() => void handleMockComplete()} disabled={loading || !simulateName.trim()}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Link Account
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
