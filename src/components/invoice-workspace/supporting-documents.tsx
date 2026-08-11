"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { InvoiceAttachment } from "@/server/procurement/ap-repositories/types";

const CATEGORY_COLORS: Record<string, string> = {
  INVOICE_COPY: "bg-blue-500/20 text-blue-300",
  SUPPORTING_DOC: "bg-emerald-500/20 text-emerald-300",
  CONTRACT: "bg-purple-500/20 text-purple-300",
  EMAIL_THREAD: "bg-amber-500/20 text-amber-300",
  RECEIPT: "bg-cyan-500/20 text-cyan-300",
  DELIVERY_NOTE: "bg-pink-500/20 text-pink-300",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface SupportingDocumentsProps {
  attachments: InvoiceAttachment[];
}

export function SupportingDocuments({ attachments }: SupportingDocumentsProps) {
  if (attachments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Supporting Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">No supporting documents attached to this invoice.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supporting Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {attachments.map((att) => {
            const catColor = CATEGORY_COLORS[att.category] ?? "bg-zinc-500/20 text-zinc-300";
            return (
              <div key={att.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{att.fileName}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${catColor}`}>
                      {att.category.replace(/_/g, " ")}
                    </span>
                    <span>{formatFileSize(att.fileSize)}</span>
                    <span className="uppercase">{att.fileType}</span>
                    {att.ocrExtracted && (
                      <span className="text-emerald-400">OCR processed</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
