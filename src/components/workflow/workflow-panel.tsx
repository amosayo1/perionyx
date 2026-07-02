"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkflowData } from "./use-workflow-data";
import { WorkflowDiagram } from "./workflow-diagram";
import { WorkflowStatusBar } from "./workflow-status-bar";
import { WorkflowActions } from "./workflow-actions";
import { WorkflowTimeline } from "./workflow-timeline";
import {
  Activity,
  ListTree,
  Timer,
  Zap,
  MessageSquare,
} from "lucide-react";

interface RawApproval {
  id: string;
  status: string;
  approvingUserId: string | null;
  approvingUserRole: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  level: number;
  sequenceNumber: number;
  createdAt: string;
}

interface RawTransaction {
  id: string;
  status: string;
  type: string;
  createdAt: string;
  updatedAt?: string;
  primaryAmount?: string;
  currency?: string;
  approvalStatus?: string;
  reconciliationStatus?: string;
  deliveryStatus?: string;
}

interface RawRequirement {
  requiredApprovals: { role: string; level: number }[];
  currentApprovals: { role: string; level: number }[];
  remainingApprovals: string[];
  isApproved: boolean;
  canBePosted: boolean;
}

interface Props {
  transaction: RawTransaction;
  approvalRecords: RawApproval[];
  approvalRequirements: RawRequirement | null;
  threadComponent?: React.ReactNode;
}

export function WorkflowPanel({
  transaction,
  approvalRecords,
  approvalRequirements,
  threadComponent,
}: Props) {
  const workflow = useWorkflowData(transaction, approvalRequirements, approvalRecords);
  const [activeTab, setActiveTab] = useState("overview");
  const [notes, setNotes] = useState<Array<{ id: string; body: string; author: string; timestamp: string; type: "note" | "comment" | "document-request" }>>([]);

  const handleEscalate = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/transactions/${transaction.id}/approvals/escalate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setNotes((prev) => [
          ...prev,
          {
            id: `note-${Date.now()}`,
            body: "Workflow escalated",
            author: "You",
            timestamp: new Date().toISOString(),
            type: "note",
          },
        ]);
      }
    } catch {
      // silent
    }
  }, [transaction.id]);

  const handleAddNote = useCallback(async (body: string) => {
    try {
      const res = await fetch(`/api/v1/transactions/${transaction.id}/thread`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (res.ok) {
        setNotes((prev) => [
          ...prev,
          {
            id: `note-${Date.now()}`,
            body,
            author: "You",
            timestamp: new Date().toISOString(),
            type: "note",
          },
        ]);
      }
    } catch {
      // silent
    }
  }, [transaction.id]);

  const handleRequestDocument = useCallback(async (description: string) => {
    try {
      const res = await fetch(`/api/v1/transactions/${transaction.id}/thread`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: `[Document Request] ${description}` }),
      });
      if (res.ok) {
        setNotes((prev) => [
          ...prev,
          {
            id: `doc-${Date.now()}`,
            body: description,
            author: "You",
            timestamp: new Date().toISOString(),
            type: "document-request",
          },
        ]);
      }
    } catch {
      // silent
    }
  }, [transaction.id]);

  if (!workflow) return null;

  return (
    <div className="space-y-4">
      {/* Workflow Diagram */}
      <Card className="border border-white/[0.06] bg-zinc-900/40">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-white">Workflow Pipeline</CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Current stage: <span className="text-[#d4af37] font-medium">
                  {workflow.stages.find((s) => s.status === "active")?.label ?? workflow.stages.find((s) => s.status === "completed")?.label ?? "Pending"}
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <WorkflowDiagram stages={workflow.stages} />
        </CardContent>
      </Card>

      {/* Status Bar */}
      <WorkflowStatusBar status={workflow.status} />

      {/* Tabs: Timeline / Actions / Discussion */}
      <Card className="border border-white/[0.06] bg-zinc-900/40">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full border-b border-white/[0.06] rounded-none bg-transparent px-4">
              <TabsTrigger value="overview" className="gap-1.5 text-xs data-[state=active]:text-[#d4af37]">
                <Activity className="h-3.5 w-3.5" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="actions" className="gap-1.5 text-xs data-[state=active]:text-[#d4af37]">
                <Zap className="h-3.5 w-3.5" />
                Actions
              </TabsTrigger>
              <TabsTrigger value="discussion" className="gap-1.5 text-xs data-[state=active]:text-[#d4af37]">
                <MessageSquare className="h-3.5 w-3.5" />
                Discussion
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="p-4 pt-4">
              <WorkflowTimeline events={workflow.events} />
            </TabsContent>

            <TabsContent value="actions" className="p-4 pt-4">
              <WorkflowActions
                transactionId={workflow.transactionId}
                canEscalate={workflow.canEscalate}
                isPaused={workflow.isPaused}
                onEscalate={handleEscalate}
                onAddNote={handleAddNote}
                onRequestDocument={handleRequestDocument}
                notes={notes}
              />
            </TabsContent>

            <TabsContent value="discussion" className="p-4 pt-4">
              {threadComponent ?? (
                <p className="text-xs text-zinc-600">No discussion thread available.</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
