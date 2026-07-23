"use client";

import type { AccountBalance } from "./accounting-types";

interface GeneralLedgerGridProps {
  balances: AccountBalance[];
  max?: number;
}

export function GeneralLedgerGrid({ balances, max = 30 }: GeneralLedgerGridProps) {
  const displayed = balances.slice(0, max);
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800 bg-[#1a1a1a]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Account ID</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Period Debit</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Period Credit</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Ending Balance</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Net Change</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {displayed.map((b) => (
            <tr key={b.id} className="hover:bg-gray-800/30">
              <td className="px-3 py-2 text-xs text-gray-400">{b.accountId}</td>
              <td className="px-3 py-2 text-right text-sm text-gray-200">${b.periodDebit.toLocaleString()}</td>
              <td className="px-3 py-2 text-right text-sm text-gray-200">${b.periodCredit.toLocaleString()}</td>
              <td className={`px-3 py-2 text-right text-sm font-medium ${b.endingBalance >= 0 ? "text-emerald-400" : "text-red-400"}`}>${b.endingBalance.toLocaleString()}</td>
              <td className={`px-3 py-2 text-right text-sm ${b.netChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>${b.netChange.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
