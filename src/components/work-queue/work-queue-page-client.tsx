"use client";

import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { EnterpriseTable } from "@/components/enterprise/table/data-table";
import { FilterChips } from "./filter-chips";
import { toWorkQueueSlaLabel } from "@/modules/work-queue/status";
import type { WorkQueueItem } from "@/modules/work-queue/types";
import type { Column, SortDirection } from "@/components/enterprise/table/types";

interface ChipDef {
  value: string;
  label: string;
  count?: number;
}

export function WorkQueuePageClient({ companyId }: { companyId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [data, setData] = useState<WorkQueueItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentFilter = searchParams.get("filter") ?? "";
  const currentSearch = searchParams.get("search") ?? "";
  const currentPage = Number(searchParams.get("page") ?? "1");
  const currentSort = searchParams.get("sort") ?? "dueDate";
  const currentDir = (searchParams.get("dir") ?? "asc") as SortDirection;

  const updateURL = useCallback(
    (params: Record<string, string | undefined>) => {
      const sp = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === "") {
          sp.delete(key);
        } else {
          sp.set(key, value);
        }
      }
      router.replace(`${pathname}?${sp.toString()}`);
    },
    [searchParams, router, pathname],
  );

  useEffect(() => {
    startTransition(() => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (currentFilter) params.set("filter", currentFilter);
      if (currentSearch) params.set("search", currentSearch);
      params.set("page", String(currentPage));
      params.set("pageSize", "25");
      params.set("sort", currentSort);
      params.set("dir", currentDir);

      fetch(`/api/work-queue?${params.toString()}`)
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to load work queue`);
          return res.json();
        })
        .then((result) => {
          setData(result.items);
          setTotalItems(result.totalItems);
        })
        .catch((err) => {
          setError(err.message);
          setData([]);
          setTotalItems(0);
        })
        .finally(() => setLoading(false));
    });
  }, [currentFilter, currentSearch, currentPage, currentSort, currentDir]);

  const handleSearchChange = useCallback(
    (value: string) => {
      updateURL({ search: value || undefined, page: "1" });
    },
    [updateURL],
  );

  const handleSort = useCallback(
    (key: string, dir: SortDirection) => {
      updateURL({ sort: key, dir, page: "1" });
    },
    [updateURL],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateURL({ page: String(page + 1) });
    },
    [updateURL],
  );

  const handleRowClick = useCallback(
    (row: WorkQueueItem) => {
      router.push(`/procurement/invoices/${row.id}`);
    },
    [router],
  );

  const columns = useMemo(
    () =>
      [
        {
          id: "priority",
          header: "Priority",
          accessor: (row: WorkQueueItem) => {
            const map: Record<string, string> = { critical: "Critical", high: "High", medium: "Medium", low: "Low" };
            return map[row.priority] ?? row.priority;
          },
          cellConfig: { type: "status" as const },
          sortKey: "priority",
          className: "w-[90px]",
        },
        {
          id: "supplier",
          header: "Supplier",
          accessor: (row: WorkQueueItem) => row.supplier,
          sortKey: "supplier",
          className: "min-w-[160px]",
        },
        {
          id: "invoiceNumber",
          header: "Invoice #",
          accessor: (row: WorkQueueItem) => row.invoiceNumber,
          sortKey: "invoiceNumber",
          className: "w-[120px]",
        },
        {
          id: "invoiceDate",
          header: "Date",
          accessor: (row: WorkQueueItem) => row.invoiceDate,
          cellConfig: { type: "date" as const, relative: true },
          sortKey: "invoiceDate",
          className: "w-[110px]",
        },
        {
          id: "dueDate",
          header: "Due",
          accessor: (row: WorkQueueItem) => row.dueDate,
          cellConfig: { type: "date" as const, relative: true },
          sortKey: "dueDate",
          className: "w-[110px]",
        },
        {
          id: "amount",
          header: "Amount",
          accessor: (row: WorkQueueItem) => row.amount,
          cellConfig: { type: "currency" as const, currency: "USD" },
          sortKey: "amount",
          className: "w-[130px]",
        },
        {
          id: "status",
          header: "Status",
          accessor: (row: WorkQueueItem) => row.status,
          cellConfig: { type: "status" as const },
          sortKey: "status",
          className: "w-[140px]",
        },
        {
          id: "slaStatus",
          header: "SLA",
          accessor: (row: WorkQueueItem) => toWorkQueueSlaLabel(row.slaStatus),
          className: "w-[90px]",
        },
        {
          id: "exceptionCount",
          header: "Exceptions",
          accessor: (row: WorkQueueItem) => row.exceptionCount,
          className: "w-[90px]",
        },
      ] satisfies Column<WorkQueueItem>[],
    [],
  );

  const chips: ChipDef[] = useMemo(
    () => [
      { value: "", label: "All Items" },
      { value: "high-priority", label: "High Priority" },
      { value: "medium-priority", label: "Medium Priority" },
      { value: "quick-approvals", label: "Quick Approvals" },
      { value: "exceptions", label: "Exceptions" },
    ],
    [],
  );

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Work Queue"
        description="Review and process pending invoice items across your workflow."
      />
      <div className="mb-4">
        <FilterChips chips={chips} />
      </div>
      <EnterpriseTable<WorkQueueItem>
        data={data}
        columns={columns}
        keyExtractor={(row: WorkQueueItem) => row.id}
        loading={loading}
        error={error}
        emptyTitle="No items in queue"
        emptyDescription="All invoices have been processed. New invoices will appear here as they arrive."
        searchValue={currentSearch}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search supplier, invoice #, or PO..."
        sortKey={currentSort}
        sortDir={currentDir}
        onSort={handleSort}
        page={currentPage - 1}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        pageSize={25}
        onRowClick={handleRowClick}
        exportable
        exportFilename="work-queue"
        stickyHeader
      />
    </PageContainer>
  );
}
