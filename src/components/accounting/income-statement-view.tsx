"use client";

import type { FinancialStatement } from "./accounting-types";

interface IncomeStatementViewProps {
  statement: FinancialStatement;
}

export function IncomeStatementView({ statement }: IncomeStatementViewProps) {
  const revenueRows = statement.rows.filter((r) => r.accountCode?.startsWith("4"));
  const expenseRows = statement.rows.filter((r) => r.accountCode?.startsWith("5") || r.accountCode?.startsWith("6") || r.accountCode?.startsWith("7"));
  const totalRevenue = revenueRows.reduce((s, r) => s + r.amount, 0);
  const totalExpenses = expenseRows.reduce((s, r) => s + r.amount, 0);
  const netIncome = totalRevenue - totalExpenses;

  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
      <div className="mb-4 border-b border-gray-800 pb-3">
        <h3 className="text-base font-medium text-gray-200">{statement.name}</h3>
        <p className="text-xs text-gray-500">Income Statement • {statement.currency}</p>
      </div>
      <div className="space-y-2">
        <div className="text-xs font-medium uppercase tracking-wider text-gray-500">Revenue</div>
        {revenueRows.slice(0, 8).map((r) => (
          <div key={r.id} className="flex justify-between text-sm" style={{ paddingLeft: `${r.indent * 12}px` }}>
            <span className="text-gray-300">{r.accountName}</span>
            <span className="text-gray-200">${r.amount.toLocaleString()}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-gray-800 pt-1 text-sm font-semibold text-gray-200">
          <span>Total Revenue</span>
          <span>${totalRevenue.toLocaleString()}</span>
        </div>
        <div className="mt-4 text-xs font-medium uppercase tracking-wider text-gray-500">Operating Expenses</div>
        {expenseRows.slice(0, 12).map((r) => (
          <div key={r.id} className="flex justify-between text-sm" style={{ paddingLeft: `${r.indent * 12}px` }}>
            <span className="text-gray-300">{r.accountName}</span>
            <span className="text-gray-200">(${Math.abs(r.amount).toLocaleString()})</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-gray-800 pt-1 text-sm font-semibold text-gray-200">
          <span>Total Expenses</span>
          <span>(${totalExpenses.toLocaleString()})</span>
        </div>
        <div className={`flex justify-between border-t-2 border-gray-700 pt-2 text-base font-bold ${netIncome >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          <span>Net Income</span>
          <span>${netIncome.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
