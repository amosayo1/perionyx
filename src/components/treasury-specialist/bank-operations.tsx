"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2, RefreshCw, Wifi, WifiOff, TrendingUp, TrendingDown,
  DollarSign, AlertTriangle, Shield, Activity,
} from "lucide-react";

interface BankAccount {
  id: string;
  name: string;
  bank: string;
  accountNumber: string;
  currency: string;
  balance: number;
  availableBalance: number;
  status: "active" | "inactive" | "frozen";
  connectionStatus: "connected" | "disconnected" | "error";
  lastSync: string;
}

interface BankRelationship {
  id: string;
  name: string;
  healthScore: number;
  connectionStatus: "connected" | "degraded" | "disconnected";
  accountCount: number;
  totalBalance: number;
  totalFees: number;
  creditLimit: number;
  utilization: number;
  accounts: BankAccount[];
}

export function BankOperations() {
  const [banks, setBanks] = useState<BankRelationship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/treasury/banking/relationships");
        if (res.ok) setBanks((await res.json()).banks ?? []);
      } catch { /* defaults */ } finally { setLoading(false); }
    }
    load();
  }, []);

  const displayBanks = banks.length > 0 ? banks : [
    { id: "1", name: "JPMorgan Chase", healthScore: 92, connectionStatus: "connected" as const, accountCount: 4, totalBalance: 842000000, totalFees: 12400, creditLimit: 500000000, utilization: 34, accounts: [
      { id: "a1", name: "Operating Account USD", bank: "JPMorgan Chase", accountNumber: "****4521", currency: "USD", balance: 425000000, availableBalance: 418000000, status: "active", connectionStatus: "connected", lastSync: "2026-07-17T10:30:00Z" },
      { id: "a2", name: "Payroll Account", bank: "JPMorgan Chase", accountNumber: "****7832", currency: "USD", balance: 128000000, availableBalance: 126000000, status: "active", connectionStatus: "connected", lastSync: "2026-07-17T10:30:00Z" },
      { id: "a3", name: "Investment Account", bank: "JPMorgan Chase", accountNumber: "****9103", currency: "USD", balance: 215000000, availableBalance: 210000000, status: "active", connectionStatus: "connected", lastSync: "2026-07-17T10:28:00Z" },
      { id: "a4", name: "FX Trading Account", bank: "JPMorgan Chase", accountNumber: "****2244", currency: "EUR", balance: 74000000, availableBalance: 72000000, status: "active", connectionStatus: "connected", lastSync: "2026-07-17T10:25:00Z" },
    ]},
    { id: "2", name: "Deutsche Bank", healthScore: 85, connectionStatus: "connected" as const, accountCount: 2, totalBalance: 412000000, totalFees: 8900, creditLimit: 300000000, utilization: 28, accounts: [
      { id: "a5", name: "EUR Operating", bank: "Deutsche Bank", accountNumber: "****6611", currency: "EUR", balance: 340000000, availableBalance: 332000000, status: "active", connectionStatus: "connected", lastSync: "2026-07-17T10:25:00Z" },
      { id: "a6", name: "EUR Reserve", bank: "Deutsche Bank", accountNumber: "****8877", currency: "EUR", balance: 72000000, availableBalance: 70000000, status: "active", connectionStatus: "connected", lastSync: "2026-07-17T10:22:00Z" },
    ]},
    { id: "3", name: "HSBC", healthScore: 78, connectionStatus: "degraded" as const, accountCount: 3, totalBalance: 278000000, totalFees: 15200, creditLimit: 200000000, utilization: 42, accounts: [
      { id: "a7", name: "GBP Operating", bank: "HSBC", accountNumber: "****3399", currency: "GBP", balance: 198000000, availableBalance: 192000000, status: "active", connectionStatus: "connected", lastSync: "2026-07-17T10:20:00Z" },
      { id: "a8", name: "GBP Savings", bank: "HSBC", accountNumber: "****5544", currency: "GBP", balance: 55000000, availableBalance: 54000000, status: "active", connectionStatus: "error", lastSync: "2026-07-16T18:00:00Z" },
      { id: "a9", name: "GBP Payroll", bank: "HSBC", accountNumber: "****1122", currency: "GBP", balance: 25000000, availableBalance: 24500000, status: "active", connectionStatus: "connected", lastSync: "2026-07-17T10:15:00Z" },
    ]},
    { id: "4", name: "Mizuho Bank", healthScore: 90, connectionStatus: "connected" as const, accountCount: 2, totalBalance: 200500000, totalFees: 6700, creditLimit: 150000000, utilization: 18, accounts: [
      { id: "a10", name: "JPY Operating", bank: "Mizuho Bank", accountNumber: "****7788", currency: "JPY", balance: 165000000, availableBalance: 162000000, status: "active", connectionStatus: "connected", lastSync: "2026-07-17T09:45:00Z" },
      { id: "a11", name: "JPY Reserve", bank: "Mizuho Bank", accountNumber: "****9900", currency: "JPY", balance: 35500000, availableBalance: 34800000, status: "active", connectionStatus: "connected", lastSync: "2026-07-17T09:40:00Z" },
    ]},
  ];

  const fmt = (v: number) => {
    if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
    return `$${v.toLocaleString()}`;
  };

  const healthColor = (v: number) => v >= 85 ? "text-emerald-400" : v >= 70 ? "text-amber-400" : "text-red-400";
  const connIcon = (s: string) => s === "connected" ? <Wifi className="w-3 h-3 text-emerald-400" /> : s === "degraded" ? <Wifi className="w-3 h-3 text-amber-400" /> : <WifiOff className="w-3 h-3 text-red-400" />;
  const connLabel: Record<string, string> = { connected: "Connected", degraded: "Degraded", disconnected: "Disconnected" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Bank Operations</h1>
          <p className="text-sm text-white/60 mt-1">Bank relationships, accounts, and connection health</p>
        </div>
        <button className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Balance", value: fmt(displayBanks.reduce((a, b) => a + b.totalBalance, 0)), icon: DollarSign, color: "text-gold-500", bg: "bg-gold-500/10" },
          { label: "Bank Relationships", value: displayBanks.length, icon: Building2, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Total Accounts", value: displayBanks.reduce((a, b) => a + b.accountCount, 0), icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Monthly Fees", value: `$${displayBanks.reduce((a, b) => a + b.totalFees, 0).toLocaleString()}`, icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{loading ? "\u2014" : card.value}</div>
            <div className="text-xs text-white/50 mt-1">{card.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        {displayBanks.map((bank, i) => (
          <motion.div key={bank.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white/60" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{bank.name}</div>
                  <div className="text-xs text-white/50 flex items-center gap-2 mt-0.5">
                    {connIcon(bank.connectionStatus)}
                    <span>{connLabel[bank.connectionStatus]}</span>
                    <span className="text-white/50">·</span>
                    <span>{bank.accountCount} accounts</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-white/50">Health</div>
                  <div className={`text-sm font-bold ${healthColor(bank.healthScore)}`}>{bank.healthScore}%</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <div className="text-lg font-bold text-white">{fmt(bank.totalBalance)}</div>
                <div className="text-[10px] text-white/50">Total Balance</div>
              </div>
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <div className="text-lg font-bold text-gold-500">{bank.utilization}%</div>
                <div className="text-[10px] text-white/50">Credit Utilization</div>
              </div>
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <div className="text-lg font-bold text-white">{fmt(bank.creditLimit)}</div>
                <div className="text-[10px] text-white/50">Credit Limit</div>
              </div>
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <div className="text-lg font-bold text-amber-400">${bank.totalFees.toLocaleString()}</div>
                <div className="text-[10px] text-white/50">Monthly Fees</div>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-white/50">Credit Utilization</span>
                <span className="text-xs text-white font-medium">{bank.utilization}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all ${bank.utilization > 70 ? "bg-red-500" : bank.utilization > 50 ? "bg-amber-500" : "bg-gold-500"}`} style={{ width: `${bank.utilization}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              {bank.accounts.map((acc) => (
                <div key={acc.id} className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    {connIcon(acc.connectionStatus)}
                    <div>
                      <div className="text-xs text-white">{acc.name}</div>
                      <div className="text-[10px] text-white/40">{acc.accountNumber} · {acc.currency}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white font-medium">{fmt(acc.balance)}</div>
                    <div className="text-[10px] text-emerald-400">Avail: {fmt(acc.availableBalance)}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
