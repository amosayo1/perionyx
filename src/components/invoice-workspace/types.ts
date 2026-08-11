import type {
  VendorInvoice,
  Vendor,
  InvoiceLineItem,
  InvoiceAttachment,
  InvoiceException,
  ApprovalRecord,
  ThreeWayMatch,
} from "@/server/procurement/ap-repositories/types";
import type { AiRecommendation } from "@/modules/ai";

export interface WorkspaceData {
  invoice: VendorInvoice;
  vendor: Vendor | null;
  lineItems: InvoiceLineItem[];
  attachments: InvoiceAttachment[];
  exceptions: InvoiceException[];
  approvals: ApprovalRecord[];
  match: ThreeWayMatch | null;
  aiRecommendation: AiRecommendation | null;
}

export type WorkspaceSectionId =
  | "summary"
  | "supplier"
  | "matching"
  | "exceptions"
  | "timeline"
  | "documents"
  | "ai"
  | "actions";

export type ActionStatus = "idle" | "loading" | "success" | "error";

export interface ActionState {
  action: string;
  status: ActionStatus;
  error: string | null;
}
