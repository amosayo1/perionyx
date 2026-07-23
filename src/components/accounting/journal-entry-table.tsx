"use client";

import type { JournalEntry } from "./accounting-types";

interface JournalEntryTableProps {
  journals: JournalEntry[];
  max?: number;
}

const statusStyles: Record<string, string> = {
  draft: "bg-gray-700 text-gray-300",
  approved: "bg-blue-900/50 text-blue-300",
  posted: "bg-emerald-900/50 text-emerald-300",
  reversed: "bg-red-900/50 text-red-300",
  voided: "bg-gray-800 text-gray-500",
};

export function JournalEntryTable({ journals, max = 25 }: JournalEntryTableProps) {
  const sorted = [...journals].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, max);
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800 bg-[#1a1a1a]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Journal #</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Description</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Type</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Debit</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Credit</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {sorted.map((j) => (
            <tr key={j.id} className="hover:bg-gray-800/30">
              <td className="px-3 py-2 text-xs font-medium text-gray-200">{j.journalNumber}</td>
              <td className="max-w-[200px] truncate px-3 py-2 text-sm text-gray-300">{j.description}</td>
              <td className="px-3 py-2 text-xs capitalize text-gray-400">{j.type}</td>
              <td className="px-3 py-2"><span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${statusStyles[j.status] || "bg-gray-700 text-gray-300"}`}>{j.status}</span></td>
              <td className="px-3 py-2 text-right text-sm text-gray-200">${j.totalDebit.toLocaleString()}</td>
              <td className="px-3 py-2 text-right text-sm text-gray-200">${j.totalCredit.toLocaleString()}</td>
              <td className="px-3 py-2 text-xs text-gray-500">{j.createdAt.toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
