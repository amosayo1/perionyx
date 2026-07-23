"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, Banknote, Link, Shield, Workflow, Bot, BarChart3, CheckCircle2, ArrowRight } from "lucide-react";

const FEATURES = [
  { icon: Building2, label: "Company", description: "Configured and active", color: "text-[#d4af37]" },
  { icon: Users, label: "Organization", description: "Hierarchy established", color: "text-emerald-400" },
  { icon: Banknote, label: "Treasury", description: "Accounts and wallets ready", color: "text-blue-400" },
  { icon: Link, label: "Integrations", description: "Connectors verified", color: "text-purple-400" },
  { icon: Shield, label: "Governance", description: "Policies enforced", color: "text-emerald-400" },
  { icon: Workflow, label: "Workflows", description: "Automation active", color: "text-cyan-400" },
  { icon: Bot, label: "AI Platform", description: "Providers configured", color: "text-[#d4af37]" },
  { icon: BarChart3, label: "Analytics", description: "Monitoring online", color: "text-blue-400" },
];

export function OnboardingDashboardPreview() {
  return (
    <div className="space-y-6">
      <Card className="border-[#d4af37]/12 bg-perionyx-bg-panel">
        <CardHeader>
          <CardTitle className="text-white">Platform Dashboard</CardTitle>
          <CardDescription className="text-zinc-400">
            All enterprise modules are ready. Here is a preview of your active capabilities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/30 px-4 py-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d4af37]/10">
                  <feature.icon className={cn("h-4 w-4", feature.color)} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-white">{feature.label}</span>
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  </div>
                  <p className="text-xs text-zinc-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button
          onClick={() => window.location.href = "/dashboard"}
          className="gap-2 bg-[#d4af37] text-black hover:bg-[#c7a961]"
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => window.location.href = "/automation-studio"}
          variant="outline"
          className="gap-2 border-[#d4af37]/30 text-[#d4af37]"
        >
          Open Automation Studio
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
