"use client";

import { useCallback, useEffect, useState } from "react";
import type { SavedView, SortDirection, FilterValue, Density } from "../types";

const STORAGE_KEY_PREFIX = "enterprise-table-view-";

interface ViewState {
  sortKey?: string;
  sortDir?: SortDirection;
  hiddenColumns: string[];
  columnWidths: Record<string, number>;
  density: Density;
  filters: FilterValue[];
  groupBy?: string;
}

export function useTableViews(viewId: string) {
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PREFIX + viewId);
      if (raw) {
        setSavedViews(JSON.parse(raw) as SavedView[]);
      }
    } catch {
      // ignore
    }
  }, [viewId]);

  const persist = useCallback(
    (views: SavedView[]) => {
      setSavedViews(views);
      try {
        localStorage.setItem(STORAGE_KEY_PREFIX + viewId, JSON.stringify(views));
      } catch {
        // ignore
      }
    },
    [viewId],
  );

  const saveView = useCallback(
    (name: string, state: ViewState) => {
      const view: SavedView = {
        id: crypto.randomUUID?.() ?? `${Date.now()}`,
        name,
        ...state,
        createdAt: Date.now(),
      };
      persist([...savedViews, view]);
      return view;
    },
    [savedViews, persist],
  );

  const deleteView = useCallback(
    (id: string) => {
      persist(savedViews.filter((v) => v.id !== id));
    },
    [savedViews, persist],
  );

  const loadView = useCallback(
    (id: string): ViewState | undefined => {
      const view = savedViews.find((v) => v.id === id);
      if (!view) return;
      return {
        sortKey: view.sortKey,
        sortDir: view.sortDir,
        hiddenColumns: view.hiddenColumns,
        columnWidths: view.columnWidths,
        density: view.density,
        filters: view.filters,
        groupBy: view.groupBy,
      };
    },
    [savedViews],
  );

  return { savedViews, saveView, deleteView, loadView };
}
