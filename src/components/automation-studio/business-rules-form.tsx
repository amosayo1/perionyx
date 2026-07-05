"use client";

import { useState } from "react";
import { FileCheck, Plus, X } from "lucide-react";
import type { BusinessRule, BusinessRuleType } from "@/modules/automation-studio/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: BusinessRuleFormData) => void;
  editRule?: BusinessRule | null;
}

export interface BusinessRuleFormData {
  name: string;
  description: string;
  category: string;
  ruleType: BusinessRuleType;
  config: Record<string, string>;
  priority: number;
  isActive: boolean;
}

const RULE_TYPES: { value: BusinessRuleType; label: string }[] = [
  { value: "policy", label: "Policy" },
  { value: "threshold", label: "Threshold" },
  { value: "validation", label: "Validation" },
  { value: "routing", label: "Routing" },
];

const CATEGORIES = [
  "general", "approval", "financial", "compliance",
  "integration", "notification", "report", "custom",
];

export function BusinessRulesForm({ open, onOpenChange, onSave, editRule }: Props) {
  const [name, setName] = useState(editRule?.name ?? "");
  const [description, setDescription] = useState(editRule?.description ?? "");
  const [category, setCategory] = useState(editRule?.category ?? "general");
  const [ruleType, setRuleType] = useState<BusinessRuleType>(editRule?.ruleType ?? "policy");
  const [config, setConfig] = useState<Record<string, string>>(
    editRule?.config ? Object.fromEntries(Object.entries(editRule.config).map(([k, v]) => [k, String(v)])) : {},
  );
  const [priority, setPriority] = useState(editRule?.priority ?? 50);
  const [isActive, setIsActive] = useState(editRule?.isActive ?? true);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, description, category, ruleType, config, priority, isActive });
  };

  const addConfigEntry = () => {
    if (!newKey.trim()) return;
    setConfig((prev) => ({ ...prev, [newKey.trim()]: newValue }));
    setNewKey("");
    setNewValue("");
  };

  const removeConfigEntry = (key: string) => {
    setConfig((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editRule ? "Edit Rule" : "Create Business Rule"}</DialogTitle>
          <DialogDescription>
            Define business logic for automation workflows
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., High-Value Transfer Policy"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this rule does"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ruleType">Rule Type</Label>
              <div className="flex gap-2">
                {RULE_TYPES.map((rt) => (
                  <button
                    key={rt.value}
                    type="button"
                    onClick={() => setRuleType(rt.value)}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      ruleType === rt.value
                        ? "bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30"
                        : "bg-zinc-900/40 text-zinc-500 border border-white/[0.06] hover:text-zinc-300"
                    }`}
                  >
                    {rt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`rounded-lg px-2.5 py-1.5 text-[10px] font-medium capitalize transition-colors ${
                      category === cat
                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                        : "bg-zinc-900/40 text-zinc-500 border border-white/[0.06] hover:text-zinc-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority ({priority})</Label>
            <input
              id="priority"
              type="range"
              min={1}
              max={100}
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-full accent-[#d4af37]"
            />
            <div className="flex justify-between text-[10px] text-zinc-600">
              <span>Low (1)</span>
              <span>High (100)</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-zinc-900/30 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">Active</p>
              <p className="text-xs text-zinc-500">Enable this rule for evaluation</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="space-y-2">
            <Label>Configuration (key-value pairs)</Label>
            <div className="space-y-1.5">
              {Object.entries(config).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <code className="flex-1 rounded border border-white/[0.06] bg-zinc-900/40 px-2.5 py-1.5 text-xs text-zinc-300">
                    {key}: {value}
                  </code>
                  <button
                    type="button"
                    onClick={() => removeConfigEntry(key)}
                    className="rounded p-1 text-zinc-600 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Key"
                className="h-8 text-xs flex-1"
              />
              <Input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Value"
                className="h-8 text-xs flex-1"
              />
              <Button type="button" size="sm" variant="outline" onClick={addConfigEntry} className="h-8 shrink-0 gap-1">
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2">
              <FileCheck className="h-4 w-4" />
              {editRule ? "Update Rule" : "Create Rule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
