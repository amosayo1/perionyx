import type { WorkQueueItem, WorkQueuePreviewItem } from "./types";
import { workQueueStatusToNextAction } from "./status";

export function toWorkQueuePreviewItem(item: WorkQueueItem): WorkQueuePreviewItem {
  return {
    id: item.id,
    priority: item.priority,
    supplier: item.supplier,
    invoice: item.invoiceNumber,
    amount: item.amount,
    currency: item.currency,
    status: item.status,
    nextAction: workQueueStatusToNextAction(item.status),
  };
}
