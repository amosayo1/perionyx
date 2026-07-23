"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutTemplate, ArrowLeft, FileText, Banknote, TrendingUp, RefreshCw,
  Building2, Droplets, ShieldAlert, UserPlus, Clock, Search, Sparkles,
} from "lucide-react";
import { BUILTIN_TEMPLATES, type AutomationTemplate } from "@/modules/automation-studio/templates";
import { createWorkflowDefinition } from "@/components/automation-studio/actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const ICON_MAP: Record<string, any> = {
  FileText, Banknote, TrendingUp, RefreshCw, Building2, Droplets, ShieldAlert, UserPlus,
};

const CATEGORY_COLORS: Record<string, string> = {
  approval: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  financial: "text-[#d4af37] border-[#d4af37]/20 bg-[#d4af37]/10",
  compliance: "text-amber-400 border-amber-500/20 bg-amber-500/10",
  integration: "text-blue-400 border-blue-500/20 bg-blue-500/10",
};

const TRIGGER_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  manual: { label: "Manual", variant: "default" },
  scheduled: { label: "Scheduled", variant: "secondary" },
  event: { label: "Event-Driven", variant: "outline" },
};

export default function TemplatesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<string | null>(null);

  const filtered = BUILTIN_TEMPLATES.filter((t) => {
    if (category && t.category !== category) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleUseTemplate = useCallback(async (template: AutomationTemplate) => {
    setIsCreating(template.id);
    try {
      const result = await createWorkflowDefinition({
        name: template.name,
        description: template.description,
        category: template.category,
        steps: template.steps,
      });
      router.push(`/automation-studio/designer/${result.id}`);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to create workflow from template");
    } finally {
      setIsCreating(null);
    }
  }, [router]);

  const categories = Array.from(new Set(BUILTIN_TEMPLATES.map((t) => t.category)));

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push("/automation-studio")} aria-label="Go back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Workflow Templates</h1>
              <p className="mt-1 text-sm text-zinc-400">Pre-built workflow templates for common financial operations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="h-10 pl-10"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCategory(null)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              !category ? "bg-[#d4af37]/10 text-[#d4af37]" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat === category ? null : cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                cat === category ? "bg-[#d4af37]/10 text-[#d4af37]" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-zinc-900/20 py-20 text-center">
          <LayoutTemplate className="mb-4 h-10 w-10 text-zinc-600" />
          <h3 className="mb-1 text-base font-semibold text-white">No templates found</h3>
          <p className="text-sm text-zinc-500">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => {
            const Icon = ICON_MAP[template.icon] ?? LayoutTemplate;
            const colorClasses = CATEGORY_COLORS[template.category] ?? "text-zinc-400 border-zinc-500/20 bg-zinc-500/10";
            const triggerBadge = TRIGGER_BADGES[template.triggerType];

            return (
              <Card key={template.id} className="transition-all hover:border-white/[0.12] hover:bg-zinc-900/50 group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${colorClasses}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant={triggerBadge.variant} className="text-[9px]">
                      {triggerBadge.label}
                    </Badge>
                  </div>
                  <CardTitle className="mt-3">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {template.metadata.estimatedDuration}
                    </span>
                    <span>{template.steps.length} steps</span>
                    <span className="capitalize">{template.category}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {template.steps.slice(0, 4).map((step) => (
                      <span key={step.id} className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-400">
                        {step.type.replace(/_/g, " ")}
                      </span>
                    ))}
                    {template.steps.length > 4 && (
                      <span className="text-[10px] text-zinc-600">+{template.steps.length - 4} more</span>
                    )}
                  </div>
                  <Button
                    className="w-full gap-2"
                    size="sm"
                    onClick={() => handleUseTemplate(template)}
                    disabled={isCreating === template.id}
                  >
                    {isCreating === template.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {isCreating === template.id ? "Creating..." : "Use Template"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
