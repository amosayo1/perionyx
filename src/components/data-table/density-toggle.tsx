"use client";

import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";
import type { Density } from "./types";

interface Props {
  density: Density;
  onChange: (d: Density) => void;
}

export function DensityToggle({ density, onChange }: Props) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onChange(density === "compact" ? "comfortable" : "compact")}
      className="gap-1.5 text-xs text-zinc-400 hover:text-white"
      title={density === "compact" ? "Switch to comfortable" : "Switch to compact"}
    >
      {density === "compact" ? (
        <Maximize2 className="h-3.5 w-3.5" />
      ) : (
        <Minimize2 className="h-3.5 w-3.5" />
      )}
      {density === "compact" ? "Comfortable" : "Compact"}
    </Button>
  );
}
