"use client";

import { useState } from "react";
import { GripVertical, Search } from "lucide-react";
import { STEP_PALETTE, type StepPaletteItem } from "./types";
import { Input } from "@/components/ui/input";

const CATEGORY_LABELS: Record<string, string> = {
  approval: "Approval & Review",
  automation: "Automation",
  intelligence: "AI & Intelligence",
  integration: "Integrations",
};

export function StepPalette({ onAddStep }: { onAddStep: (item: StepPaletteItem) => void }) {
  const [search, setSearch] = useState("");

  const filtered = STEP_PALETTE.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase()),
  );

  const grouped = filtered.reduce<Record<string, StepPaletteItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/[0.06] p-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Step Palette</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter steps..."
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              {CATEGORY_LABELS[category] ?? category}
            </p>
            <div className="space-y-1">
              {items.map((item) => (
                <button
                  key={item.type}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", item.type);
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  onClick={() => onAddStep(item)}
                  className="flex w-full items-center gap-2.5 rounded-lg border border-white/[0.06] bg-zinc-900/40 px-3 py-2 text-left transition-all hover:border-white/[0.12] hover:bg-zinc-900/60 active:scale-[0.98] cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="h-3 w-3 shrink-0 text-zinc-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{item.label}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{item.description}</p>
                  </div>
                  <div className="flex h-5 w-5 items-center justify-center rounded" style={{ backgroundColor: `${item.color}15` }}>
                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
