"use client";

import type { FinancialStatement } from "./accounting-types";

interface FinancialStatementViewerProps {
  statement: FinancialStatement;
}

export function FinancialStatementViewer({ statement }: FinancialStatementViewerProps) {
  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
      <div className="mb-4 border-b border-gray-800 pb-3">
        <h3 className="text-base font-medium text-gray-200">{statement.name}</h3>
        <p className="text-xs text-gray-500">
          {statement.type.replace(/-/g, " ")} • {statement.currency} • Generated {statement.generatedAt.toLocaleDateString()}
        </p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 text-xs text-gray-500">
            <th className="px-3 py-1.5 text-left font-medium">Account</th>
            <th className="px-3 py-1.5 text-right font-medium">Amount</th>
            {statement.rows.some((r) => r.previousAmount !== undefined) && <th className="px-3 py-1.5 text-right font-medium">Previous</th>}
            {statement.rows.some((r) => r.variance !== undefined) && <th className="px-3 py-1.5 text-right font-medium">Variance</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {statement.rows.map((row) => (
            <tr key={row.id} className={`${row.isBold ? "font-semibold" : ""} ${row.type === "total" ? "border-t-2 border-gray-700" : ""} hover:bg-gray-800/30`}>
              <td className={`px-3 py-1.5 ${row.isItalic ? "italic" : ""}`} style={{ paddingLeft: `${12 + row.indent * 16}px` }}>
                <span className={`text-xs ${row.type === "header" ? "text-gray-400 uppercase" : row.type === "total" ? "text-gray-200" : "text-gray-300"}`}>
                  {row.accountName}
                </span>
              </td>
              <td className={`px-3 py-1.5 text-right text-xs ${row.amount >= 0 ? "text-gray-200" : "text-red-400"}`}>
                {row.type !== "header" ? `$${Math.abs(row.amount).toLocaleString()}` : ""}
              </td>
              {row.previousAmount !== undefined && (
                <td className="px-3 py-1.5 text-right text-xs text-gray-500">${row.previousAmount.toLocaleString()}</td>
              )}
              {row.variance !== undefined && (
                <td className={`px-3 py-1.5 text-right text-xs ${row.variance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {row.variancePercent !== undefined ? `${row.variancePercent >= 0 ? "+" : ""}${row.variancePercent.toFixed(1)}%` : ""}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
