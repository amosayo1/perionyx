export type WorkQueuePriority = "critical" | "high" | "medium" | "low";

export type WorkQueueSlaStatus = "on-track" | "at-risk" | "breached";

export interface WorkQueueItem {
  id: string;
  priority: WorkQueuePriority;
  supplier: string;
  supplierId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: string;
  assignedTo: string | null;
  slaStatus: WorkQueueSlaStatus;
  exceptionCount: number;
  poReference: string | null;
  invoiceAgeDays: number;
}

export interface WorkQueuePreviewItem {
  id: string;
  priority: WorkQueuePriority;
  supplier: string;
  invoice: string;
  amount: number;
  currency: string;
  status: string;
  nextAction: string;
}

export interface WorkQueueFilters {
  filter?: string;
  search?: string;
  sort?: string;
  dir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IWorkQueueService {
  getWorkQueue(companyId: string, filter: WorkQueueFilters): Promise<PaginatedResult<WorkQueueItem>>;
}
