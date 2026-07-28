"use client";

import type { FinancialStatement } from "./accounting-types";

interface CashFlowStatementViewProps {
  statement: FinancialStatement;
}

export function CashFlowStatementView({ statement }: CashFlowStatementViewProps) {
  const operating = statement.rows.filter((r) => r.accountCode?.startsWith("6") || r.accountName.toLowerCase().includes("operating"));
  const investing = statement.rows.filter((r) => r.accountCode?.startsWith("1") && (r.accountName.toLowerCase().includes("investment") || r.accountName.toLowerCase().includes("property") || r.accountName.toLowerCase().includes("equipment")));
  const financing = statement.rows.filter((r) => r.accountCode?.startsWith("2") || r.accountCode?.startsWith("3"));
  const sections = [
    { label: "Operating Activities", rows: operating, color: "text-emerald-400" },
    { label: "Investing Activities", rows: investing, color: "text-blue-400" },
    { label: "Financing Activities", rows: financing, color: "text-purple-400" },
  ];

  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a24] p-4">
      <div className="mb-4 border-b border-gray-800 pb-3">
        <h3 className="text-base font-medium text-gray-200">{statement.name}</h3>
        <p className="text-xs text-gray-500">Cash Flow Statement • {statement.currency}</p>
      </div>
      <div className="space-y-4">
        {sections.map((section) => {
          const total = section.rows.reduce((s, r) => s + r.amount, 0);
          return (
            <div key={section.label}>
              <div className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">{section.label}</div>
              {section.rows.slice(0, 5).map((r) => (
                <div key={r.id} className="flex justify-between py-0.5 text-sm" style={{ paddingLeft: `${r.indent * 12}px` }}>
                  <span className="text-gray-300">{r.accountName}</span>
                  <span className={r.amount >= 0 ? "text-gray-200" : "text-red-400"}>${r.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className={`flex justify-between border-t border-gray-800 pt-1 text-sm font-semibold ${section.color}`}>
                <span>Net {section.label}</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
        <div className="flex justify-between border-t-2 border-gray-700 pt-2 text-base font-bold text-white">
          <span>Net Change in Cash</span>
          <span>${sections.reduce((s, sec) => s + sec.rows.reduce((s2, r) => s2 + r.amount, 0), 0).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
