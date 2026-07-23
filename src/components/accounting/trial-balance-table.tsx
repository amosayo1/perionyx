"use client";

import type { TrialBalanceRow } from "./accounting-types";

interface TrialBalanceTableProps {
  rows: TrialBalanceRow[];
}

export function TrialBalanceTable({ rows }: TrialBalanceTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800 bg-[#1a1a1a]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Code</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Account</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Type</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Beginning</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Debit</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Credit</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Ending</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {rows.map((r) => (
            <tr key={r.accountId} className="hover:bg-gray-800/30">
              <td className="px-3 py-2 text-xs text-gray-500">{r.accountCode}</td>
              <td className="px-3 py-2 text-sm text-gray-200">{r.accountName}</td>
              <td className="px-3 py-2 text-xs capitalize text-gray-400">{r.accountType}</td>
              <td className={`px-3 py-2 text-right text-xs ${r.beginningBalance >= 0 ? "text-gray-200" : "text-red-400"}`}>${r.beginningBalance.toLocaleString()}</td>
              <td className="px-3 py-2 text-right text-sm text-gray-200">${r.periodDebit.toLocaleString()}</td>
              <td className="px-3 py-2 text-right text-sm text-gray-200">${r.periodCredit.toLocaleString()}</td>
              <td className={`px-3 py-2 text-right text-sm font-medium ${r.endingBalance >= 0 ? "text-emerald-400" : "text-red-400"}`}>${r.endingBalance.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
