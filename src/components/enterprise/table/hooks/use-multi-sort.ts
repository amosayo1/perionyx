"use client";

import { useCallback, useMemo, useState } from "react";
import type { SortState, SortDirection, Column } from "../types";

const SORT_PRIORITY_LABELS = ["primary", "secondary", "tertiary"] as const;

export function useMultiSort<T>({
  columns,
  externalSorts,
  onMultiSort,
}: {
  columns: Column<T>[];
  externalSorts?: SortState[];
  onMultiSort?: (sorts: SortState[]) => void;
}) {
  const [internalSorts, setInternalSorts] = useState<SortState[]>([]);
  const sorts = externalSorts ?? internalSorts;

  const setSorts = useCallback(
    (next: SortState[]) => {
      if (onMultiSort) {
        onMultiSort(next);
      } else {
        setInternalSorts(next);
      }
    },
    [onMultiSort],
  );

  const toggleSort = useCallback(
    (columnId: string) => {
      const key = columns.find((c) => (c.sortKey ?? c.id) === columnId)?.sortKey ?? columnId;
      const existing = sorts.find((s) => s.key === key);

      if (existing) {
        if (existing.dir === "desc") {
          setSorts(sorts.filter((s) => s.key !== key));
        } else {
          setSorts(sorts.map((s) => (s.key === key ? { ...s, dir: "desc" as SortDirection } : s)));
        }
      } else {
        const next: SortState = {
          key,
          dir: "desc",
          priority: sorts.length,
        };
        const updated = [...sorts, next].map((s, i) => ({ ...s, priority: i }));
        setSorts(updated);
      }
    },
    [sorts, columns, setSorts],
  );

  const removeSort = useCallback(
    (key: string) => {
      setSorts(
        sorts
          .filter((s) => s.key !== key)
          .map((s, i) => ({ ...s, priority: i })),
      );
    },
    [sorts, setSorts],
  );

  const clearSorts = useCallback(() => {
    setSorts([]);
  }, [setSorts]);

  const sortLabels = useMemo(
    () =>
      sorts.map((s) => {
        const col = columns.find((c) => (c.sortKey ?? c.id) === s.key);
        return {
          label: col?.header ?? s.key,
          priority: SORT_PRIORITY_LABELS[s.priority] ?? `level ${s.priority + 1}`,
          dir: s.dir,
        };
      }),
    [sorts, columns],
  );

  const activeSortKey = sorts[0]?.key;

  return {
    sorts,
    activeSortKey,
    setSorts,
    toggleSort,
    removeSort,
    clearSorts,
    sortLabels,
  };
}
