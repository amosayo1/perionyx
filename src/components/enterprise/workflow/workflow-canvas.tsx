"use client";

import { useState, useCallback, useRef, useEffect, memo } from "react";
import { cn } from "@/lib/utils";
import { Minus, Plus, RotateCcw, RotateCw, Maximize2, Minimize2, Grid3X3, MousePointer2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkflowCanvasProps {
  children?: React.ReactNode;
  className?: string;
  onStepSelect?: (stepId: string) => void;
  selectedStepId?: string;
  showMinimap?: boolean;
}

export const WorkflowCanvas = memo(function WorkflowCanvas({
  children,
  className,
  onStepSelect,
  selectedStepId,
  showMinimap = true,
}: WorkflowCanvasProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [showGrid, setShowGrid] = useState(true);

  const ZOOM_MIN = 0.25;
  const ZOOM_MAX = 3;

  const zoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.1, ZOOM_MAX)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(z - 0.1, ZOOM_MIN)), []);
  const zoomReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setZoom((z) => Math.max(ZOOM_MIN, Math.min(z + delta, ZOOM_MAX)));
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).closest("[data-canvas-bg]")) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "=" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); zoomIn(); }
      if (e.key === "-" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); zoomOut(); }
      if (e.key === "0" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); zoomReset(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomIn, zoomOut, zoomReset]);

  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-white/[0.06] bg-zinc-950", className)}>
      <div
        ref={canvasRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {showGrid && (
          <div
            data-canvas-bg
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 0.5px, transparent 0.5px)",
              backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            }}
          />
        )}
        <div
          className="absolute inset-0 transition-transform duration-75"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          {children}
        </div>
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1 rounded-lg border border-white/[0.06] bg-zinc-900/90 px-2 py-1 backdrop-blur-sm">
          <Button variant="ghost" size="sm" onClick={zoomOut} className="h-6 w-6 p-0 text-zinc-500 hover:text-white" aria-label="Zoom out">
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center text-[11px] font-medium text-zinc-400 tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="ghost" size="sm" onClick={zoomIn} className="h-6 w-6 p-0 text-zinc-500 hover:text-white" aria-label="Zoom in">
            <Plus className="h-3 w-3" />
          </Button>
          <div className="mx-1 h-4 w-px bg-white/[0.06]" />
          <Button variant="ghost" size="sm" onClick={zoomReset} className="h-6 w-6 p-0 text-zinc-500 hover:text-white" aria-label="Reset zoom">
            <Maximize2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className={cn("h-6 w-6 p-0", showGrid ? "text-[#d4af37]" : "text-zinc-500 hover:text-white")}
            aria-label="Toggle grid"
          >
            <Grid3X3 className="h-3 w-3" />
          </Button>
        </div>

        <div className="pointer-events-auto text-[10px] text-zinc-700">
          {isPanning ? "Dragging..." : "Cmd+Scroll to zoom"}
        </div>
      </div>

      {showMinimap && (
        <div className="absolute bottom-12 right-3 h-20 w-28 rounded-lg border border-white/[0.06] bg-zinc-900/80 backdrop-blur-sm overflow-hidden pointer-events-none">
          <div className="p-2 text-[8px] text-zinc-600 font-medium uppercase tracking-wider">Minimap</div>
        </div>
      )}
    </div>
  );
});
