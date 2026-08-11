/**
 * Phase 22.4 — AP Evidence Providers: registration
 *
 * The AP reference-implementation provider set. Idempotent — safe to call from
 * multiple entry points (the assembler drives registration lazily on first
 * use; the workspace may register eagerly).
 */

import { registerEvidenceProviders } from "../../registry";
import { InvoiceProvider } from "./invoice-provider";
import { VendorProvider } from "./vendor-provider";
import { PurchaseOrderProvider } from "./purchase-order-provider";
import { PaymentProvider } from "./payment-provider";
import { ApprovalProvider } from "./approval-provider";
import { PolicyProvider } from "./policy-provider";
import { RiskProvider } from "./risk-provider";
import { AuditProvider } from "./audit-provider";
import { DocumentProvider } from "./document-provider";
import { TimelineProvider } from "./timeline-provider";
import { CommunicationProvider } from "./communication-provider";

/**
 * The 11 AP providers. Registration order is significant — it fixes the
 * cross-provider item order within shared sections.
 */
export function registerAPEvidenceProviders(): void {
  registerEvidenceProviders([
    new InvoiceProvider(),
    new VendorProvider(),
    new PurchaseOrderProvider(),
    new PaymentProvider(),
    new ApprovalProvider(),
    new PolicyProvider(),
    new RiskProvider(),
    new AuditProvider(),
    new DocumentProvider(),
    new TimelineProvider(),
    new CommunicationProvider(),
  ]);
}
