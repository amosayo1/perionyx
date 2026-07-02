"use client";

import { useCallback, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableScroll } from "@/components/ui/table-scroll";
import { ArrowLeft, FlaskConical } from "lucide-react";
import Link from "next/link";

type TestResult = {
  matched: boolean;
  matchedPolicy: {
    id: string;
    name: string;
    action: string;
    priority: number;
  } | null;
  results: Array<{
    policyId: string;
    policyName: string;
    action: string;
    matched: boolean;
    priority: number;
    rules: Array<{
      field: string;
      operator: string;
      value: string;
      matched: boolean;
    }>;
  }>;
};

export default function TestPolicyPage() {
  const [amount, setAmount] = useState("");
  const [transactionType, setTransactionType] = useState("PAYMENT");
  const [currency, setCurrency] = useState("USD");
  const [walletId, setWalletId] = useState("");
  const [result, setResult] = useState<TestResult | null>(null);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = useCallback(async () => {
    setTesting(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/v1/policies/test", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount) || 0,
          transactionType,
          currency,
          walletId: walletId.trim() || undefined,
        }),
      });
      if (!res.ok) {
        setError("Test request failed.");
        return;
      }
      const body = (await res.json()) as TestResult;
      setResult(body);
    } catch {
      setError("Unable to run policy test.");
    } finally {
      setTesting(false);
    }
  }, [amount, transactionType, currency, walletId]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link href="/policies" className="inline-flex items-center text-sm text-perionyx-text-muted hover:text-perionyx-text-primary">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to policies
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Test Policies</h1>
        <p className="mt-1 text-sm text-perionyx-text-muted">
          Simulate a transaction to see which policies match.
        </p>
      </div>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Transaction Input</CardTitle>
          <CardDescription className="text-perionyx-text-muted">
            Enter transaction details to test against active policies.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="1000.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Select value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
                <option value="PAYMENT">Payment</option>
                <option value="WITHDRAWAL">Withdrawal</option>
                <option value="DEPOSIT">Deposit</option>
                <option value="TRANSFER">Transfer</option>
                <option value="REFUND">Refund</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Wallet ID (optional)</Label>
              <Input
                placeholder="wallet_abc123"
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={() => void runTest()} disabled={testing}>
            <FlaskConical className="mr-2 h-4 w-4" />
            {testing ? "Testing..." : "Run Test"}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-perionyx-danger">Error</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-perionyx-text-muted">{error}</CardContent>
        </Card>
      )}

      {result && (
        <>
          {result.matchedPolicy && (
            <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-medium text-perionyx-text-primary">
                  <Badge variant={result.matchedPolicy.action === "BLOCK" ? "danger" : "success"}>
                    {result.matchedPolicy.action}
                  </Badge>
                  Matched: {result.matchedPolicy.name}
                </CardTitle>
                <CardDescription className="text-perionyx-text-muted">
                  Priority {result.matchedPolicy.priority}
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-perionyx-text-primary">All Results</CardTitle>
              <CardDescription className="text-perionyx-text-muted">
                {result.results.filter((r) => r.matched).length} of {result.results.length} policies matched.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <TableScroll>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Policy</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead className="text-right">Priority</TableHead>
                      <TableHead>Matched</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.results.map((r) => (
                      <TableRow key={r.policyId}>
                        <TableCell className="text-sm font-medium text-perionyx-text-primary">{r.policyName}</TableCell>
                        <TableCell>
                          <Badge variant={r.action === "BLOCK" ? "danger" : r.action === "FLAG" ? "warning" : "secondary"}>
                            {r.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-perionyx-text-primary">{r.priority}</TableCell>
                        <TableCell>
                          <Badge variant={r.matched ? "success" : "secondary"}>
                            {r.matched ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableScroll>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
