"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Clock, Shield, User, FileText, Activity, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface InspectorSection {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface InspectorPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  sections: InspectorSection[];
  defaultSection?: string;
}

export function InspectorPanel({
  open,
  onOpenChange,
  title,
  description,
  sections,
  defaultSection,
}: InspectorPanelProps) {
  const [activeSection, setActiveSection] = React.useState(defaultSection ?? sections[0]?.id);

  React.useEffect(() => {
    if (open) {
      setActiveSection(defaultSection ?? sections[0]?.id);
    }
  }, [open, defaultSection, sections]);

  const activeContent = sections.find((s) => s.id === activeSection);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="shrink-0 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <SheetTitle className="truncate">{title}</SheetTitle>
              {description && (
                <SheetDescription className="mt-0.5 truncate">
                  {description}
                </SheetDescription>
              )}
            </div>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" aria-label="Close">
                <X className="h-4 w-4 text-zinc-400" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        {/* Section tabs */}
        {sections.length > 1 && (
          <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-white/[0.06] px-4 py-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
                  activeSection === section.id
                    ? "bg-gold/10 text-gold"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]",
                )}
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="px-6 py-4">
            {activeContent?.content}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export function InspectorRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-white/[0.04] last:border-0">
      <span className="text-xs text-zinc-500 shrink-0">{label}</span>
      <span className="text-xs text-zinc-300 text-right break-all">{value}</span>
    </div>
  );
}

export function InspectorSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 last:mb-0">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}
