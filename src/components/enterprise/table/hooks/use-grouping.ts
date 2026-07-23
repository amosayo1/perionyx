"use client";

import { useMemo } from "react";
import type { Column } from "../types";

export interface Group<T> {
  key: string;
  label: string;
  rows: T[];
  count: number;
}

interface UseGroupingResult<T> {
  groups: Group<T>[];
  flatData: T[];
  groupCounts: Record<string, number>;
}

export function useGrouping<T>(
  data: T[],
  columns: Column<T>[],
  groupBy?: string,
): UseGroupingResult<T> {
  return useMemo(() => {
    if (!groupBy) {
      return { groups: [], flatData: data, groupCounts: {} };
    }

    const col = columns.find((c) => c.id === groupBy);
    if (!col || !col.groupable) {
      return { groups: [], flatData: data, groupCounts: {} };
    }

    const groupsMap = new Map<string, T[]>();
    for (const row of data) {
      const val = col.accessor(row);
      const key = val?.toString() ?? "(empty)";
      if (!groupsMap.has(key)) groupsMap.set(key, []);
      groupsMap.get(key)!.push(row);
    }

    const groups: Group<T>[] = [];
    const groupCounts: Record<string, number> = {};
    for (const [key, rows] of groupsMap) {
      groups.push({ key, label: key, rows, count: rows.length });
      groupCounts[key] = rows.length;
    }

    const flatData = groups.flatMap((g) => g.rows);

    return { groups, flatData, groupCounts };
  }, [data, columns, groupBy]);
}
