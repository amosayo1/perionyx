"use client";

import type { FinancialStatement } from "./accounting-types";

interface BalanceSheetViewProps {
  statement: FinancialStatement;
}

export function BalanceSheetView({ statement }: BalanceSheetViewProps) {
  const assetRows = statement.rows.filter((r) => r.accountCode?.startsWith("1"));
  const liabilityRows = statement.rows.filter((r) => r.accountCode?.startsWith("2"));
  const equityRows = statement.rows.filter((r) => r.accountCode?.startsWith("3"));
  const totalAssets = assetRows.reduce((s, r) => s + r.amount, 0);
  const totalLiabilities = liabilityRows.reduce((s, r) => s + r.amount, 0);
  const totalEquity = equityRows.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
      <div className="mb-4 border-b border-gray-800 pb-3">
        <h3 className="text-base font-medium text-gray-200">{statement.name}</h3>
        <p className="text-xs text-gray-500">Balance Sheet • {statement.currency}</p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-emerald-400">Assets</div>
          {assetRows.slice(0, 10).map((r) => (
            <div key={r.id} className="flex justify-between py-0.5 text-sm" style={{ paddingLeft: `${r.indent * 12}px` }}>
              <span className="text-gray-300">{r.accountName}</span>
              <span className="text-gray-200">${r.amount.toLocaleString()}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-gray-700 pt-1 text-sm font-semibold text-emerald-400">
            <span>Total Assets</span>
            <span>${totalAssets.toLocaleString()}</span>
          </div>
        </div>
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-amber-400">Liabilities</div>
          {liabilityRows.slice(0, 8).map((r) => (
            <div key={r.id} className="flex justify-between py-0.5 text-sm" style={{ paddingLeft: `${r.indent * 12}px` }}>
              <span className="text-gray-300">{r.accountName}</span>
              <span className="text-gray-200">${r.amount.toLocaleString()}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-gray-700 pt-1 text-sm font-semibold text-amber-400">
            <span>Total Liabilities</span>
            <span>${totalLiabilities.toLocaleString()}</span>
          </div>
          <div className="mt-4 mb-2 text-xs font-medium uppercase tracking-wider text-blue-400">Equity</div>
          {equityRows.slice(0, 6).map((r) => (
            <div key={r.id} className="flex justify-between py-0.5 text-sm" style={{ paddingLeft: `${r.indent * 12}px` }}>
              <span className="text-gray-300">{r.accountName}</span>
              <span className="text-gray-200">${r.amount.toLocaleString()}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-gray-700 pt-1 text-sm font-semibold text-blue-400">
            <span>Total Equity</span>
            <span>${totalEquity.toLocaleString()}</span>
          </div>
          <div className="mt-4 flex justify-between border-t-2 border-gray-600 pt-2 text-base font-bold text-white">
            <span>Total Liabilities & Equity</span>
            <span>${(totalLiabilities + totalEquity).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
