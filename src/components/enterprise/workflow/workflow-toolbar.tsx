"use client";

import { memo, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Undo2, Redo2, AlignCenter, AlignStartVertical, LayoutGrid, Eye, EyeOff, Monitor, Save, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkflowToolbarProps {
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  onAlign?: (mode: "left" | "center" | "grid") => void;
  onToggleMinimap?: () => void;
  onToggleReadOnly?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  isReadOnly?: boolean;
  showMinimap?: boolean;
  saving?: boolean;
  className?: string;
}

export const WorkflowToolbar = memo(function WorkflowToolbar({
  onUndo,
  onRedo,
  onSave,
  onExport,
  onAlign,
  onToggleMinimap,
  onToggleReadOnly,
  canUndo = false,
  canRedo = false,
  isReadOnly = false,
  showMinimap = true,
  saving,
  className,
}: WorkflowToolbarProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        onUndo?.();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        onRedo?.();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        onSave?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onUndo, onRedo, onSave]);

  return (
    <div className={cn("flex items-center gap-1 rounded-lg border border-white/[0.06] bg-zinc-900/90 px-2 py-1.5 backdrop-blur-sm", className)}>
      {onUndo && (
        <Button variant="ghost" size="sm" onClick={onUndo} disabled={!canUndo} className="h-7 px-2 text-zinc-500 hover:text-white" aria-label="Undo (Cmd+Z)">
          <Undo2 className="h-3.5 w-3.5" />
        </Button>
      )}
      {onRedo && (
        <Button variant="ghost" size="sm" onClick={onRedo} disabled={!canRedo} className="h-7 px-2 text-zinc-500 hover:text-white" aria-label="Redo (Cmd+Shift+Z)">
          <Redo2 className="h-3.5 w-3.5" />
        </Button>
      )}

      <div className="mx-1 h-5 w-px bg-white/[0.06]" />

      {onAlign && (
        <>
          <Button variant="ghost" size="sm" onClick={() => onAlign("left")} className="h-7 px-2 text-zinc-500 hover:text-white" aria-label="Align left">
            <AlignStartVertical className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onAlign("center")} className="h-7 px-2 text-zinc-500 hover:text-white" aria-label="Align center">
            <AlignCenter className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onAlign("grid")} className="h-7 px-2 text-zinc-500 hover:text-white" aria-label="Auto layout">
            <LayoutGrid className="h-3.5 w-3.5" />
          </Button>
          <div className="mx-1 h-5 w-px bg-white/[0.06]" />
        </>
      )}

      {onToggleMinimap && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleMinimap}
          className={cn("h-7 px-2", showMinimap ? "text-[#d4af37]" : "text-zinc-500 hover:text-white")}
          aria-label="Toggle minimap"
        >
          {showMinimap ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </Button>
      )}

      {onToggleReadOnly && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleReadOnly}
          className={cn("h-7 px-2", isReadOnly ? "text-amber-400" : "text-zinc-500 hover:text-white")}
          aria-label="Toggle read-only"
        >
          <Monitor className="h-3.5 w-3.5" />
        </Button>
      )}

      <div className="flex-1" />

      {onExport && (
        <Button variant="ghost" size="sm" onClick={onExport} className="h-7 px-2 text-zinc-500 hover:text-white" aria-label="Export">
          <Download className="h-3.5 w-3.5" />
        </Button>
      )}

      {onSave && (
        <Button variant="outline" size="sm" onClick={onSave} disabled={saving} className="h-7 gap-1 text-[11px]">
          <Save className="h-3 w-3" />
          {saving ? "Saving..." : "Save"}
        </Button>
      )}
    </div>
  );
});
