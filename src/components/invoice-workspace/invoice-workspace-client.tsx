"use client";

import type { WorkspaceData } from "./types";
import { InvoiceSummary } from "./invoice-summary";
import { SupplierInfo } from "./supplier-info";
import { MatchingStatus } from "./matching-status";
import { ExceptionSummary } from "./exception-summary";
import { ApprovalTimeline } from "./approval-timeline";
import { SupportingDocuments } from "./supporting-documents";
import { AiRecommendationSection } from "./ai-recommendation";
import { ActionPanel } from "./action-panel";

interface InvoiceWorkspaceClientProps {
  data: WorkspaceData;
}

export function InvoiceWorkspaceClient({ data }: InvoiceWorkspaceClientProps) {
  const { invoice, vendor, match, exceptions, approvals, attachments, aiRecommendation } = data;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <InvoiceSummary invoice={invoice} />
        <MatchingStatus match={match} />
        <ExceptionSummary exceptions={exceptions} />
        <ApprovalTimeline approvals={approvals} />
        <SupportingDocuments attachments={attachments} />
        <AiRecommendationSection recommendation={aiRecommendation} />
      </div>
      <div className="space-y-6">
        <ActionPanel invoice={invoice} />
        <SupplierInfo vendor={vendor} />
      </div>
    </div>
  );
}
