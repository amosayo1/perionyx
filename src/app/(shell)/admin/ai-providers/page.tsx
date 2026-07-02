"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, RefreshCw, Plug, Activity, DollarSign, Cpu } from "lucide-react";

interface ActiveProvider {
  kind: string;
  label: string;
  defaultModel: string;
  enabled: boolean;
  health: { status: string; latency?: number; lastCheckedAt: string; error?: string };
  usage: { totalTokens: number; estimatedCost: number };
}

interface ModelConfig {
  id: string;
  provider: string;
  label: string;
  capabilities: string[];
  contextWindow: number;
  costPerInputToken: number;
  costPerOutputToken: number;
  isDefault?: boolean;
}

interface UsageSummary {
  totalTokens: number;
  totalCost: number;
  byModel: Record<string, { tokens: number; cost: number; calls: number }>;
  byProvider: Record<string, { tokens: number; cost: number; calls: number }>;
}

export default function AiProvidersPage() {
  const [providers, setProviders] = useState<ActiveProvider[]>([]);
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [activeKind, setActiveKind] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/ai-providers");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = (await res.json()) as {
        providers: ActiveProvider[];
        models: ModelConfig[];
        usage: UsageSummary;
        activeProviderKind: string | null;
      };
      setProviders(data.providers);
      setModels(data.models);
      setUsage(data.usage);
      setActiveKind(data.activeProviderKind);
    } catch {
      toast.error("Failed to load AI provider data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSetActive = async (kind: string) => {
    try {
      const res = await fetch("/api/v1/admin/ai-providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set-active", providerKind: kind }),
      });
      if (!res.ok) throw new Error("Failed to set active provider");
      setActiveKind(kind);
      toast.success(`Active provider changed to ${kind}`);
    } catch {
      toast.error("Failed to set active provider");
    }
  };

  const handleTestConnection = async (kind: string) => {
    setTesting(kind);
    try {
      const res = await fetch("/api/v1/admin/ai-providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test-connection", providerKind: kind }),
      });
      if (!res.ok) throw new Error("Connection test failed");
      const data = (await res.json()) as { health: { status: string; latency?: number } };
      toast.success(`${kind}: ${data.health.status} (${data.health.latency ?? "?"}ms)`);
      void fetchData();
    } catch {
      toast.error(`Connection test failed for ${kind}`);
    } finally {
      setTesting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Providers</h1>
          <p className="text-sm text-muted-foreground">Manage AI provider configuration, models, and monitoring</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Providers</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{providers.length}</div>
            <p className="text-xs text-muted-foreground">{providers.filter((p) => p.enabled).length} enabled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Models</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{models.length}</div>
            <p className="text-xs text-muted-foreground">Across all providers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Token Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(usage?.totalTokens ?? 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total tokens consumed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estimated Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(usage?.totalCost ?? 0).toFixed(4)}</div>
            <p className="text-xs text-muted-foreground">Total estimated cost</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Provider Status</h2>
        {providers.map((provider) => (
          <Card key={provider.kind}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {provider.label}
                    {provider.kind === activeKind && (
                      <Badge variant="default" className="text-xs">Active</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{provider.kind}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      provider.health.status === "healthy" ? "success" :
                      provider.health.status === "degraded" ? "warning" : "danger"
                    }
                  >
                    {provider.health.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestConnection(provider.kind)}
                    disabled={testing === provider.kind}
                  >
                    {testing === provider.kind ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plug className="h-4 w-4" />
                    )}
                    <span className="ml-2">Test</span>
                  </Button>
                  <Button
                    variant={provider.kind === activeKind ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSetActive(provider.kind)}
                    disabled={provider.kind === activeKind}
                  >
                    <span className="mr-2">{provider.kind === activeKind ? "Active" : "Set Active"}</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Default Model: </span>
                  <span className="font-medium">{provider.defaultModel}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Enabled: </span>
                  <span className="font-medium">{provider.enabled ? "Yes" : "No"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Latency: </span>
                  <span className="font-medium">
                    {provider.health.latency ? `${provider.health.latency}ms` : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Checked: </span>
                  <span className="font-medium">
                    {provider.health.lastCheckedAt
                      ? new Date(provider.health.lastCheckedAt).toLocaleTimeString()
                      : "Never"}
                  </span>
                </div>
              </div>
              {provider.health.error && (
                <p className="text-sm text-destructive mt-2">Error: {provider.health.error}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Available Models</h2>
        <Card>
          <CardContent className="p-0">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Model</th>
                    <th className="text-left p-3 font-medium">Provider</th>
                    <th className="text-left p-3 font-medium">Capabilities</th>
                    <th className="text-right p-3 font-medium">Context</th>
                    <th className="text-right p-3 font-medium">Input Cost</th>
                    <th className="text-right p-3 font-medium">Output Cost</th>
                    <th className="text-center p-3 font-medium">Default</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((model) => (
                    <tr key={model.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{model.label}</td>
                      <td className="p-3">{model.provider}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {model.capabilities.map((cap) => (
                            <Badge key={cap} variant="outline" className="text-xs">
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-right">{(model.contextWindow / 1000).toFixed(0)}K</td>
                      <td className="p-3 text-right">${model.costPerInputToken.toFixed(7)}</td>
                      <td className="p-3 text-right">${model.costPerOutputToken.toFixed(7)}</td>
                      <td className="p-3 text-center">
                        {model.isDefault && <Badge variant="default" className="text-xs">Default</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {usage && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Usage by Provider</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(usage.byProvider).map(([provider, data]) => (
                  <div key={provider} className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">{provider}</span>
                    <div className="flex gap-4">
                      <span>{data.calls} calls</span>
                      <span>{(data.tokens / 1000).toFixed(1)}K tokens</span>
                      <span>${data.cost.toFixed(4)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Usage by Model</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(usage.byModel).map(([model, data]) => (
                  <div key={model} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{model}</span>
                    <div className="flex gap-4">
                      <span>{data.calls} calls</span>
                      <span>{(data.tokens / 1000).toFixed(1)}K tokens</span>
                      <span>${data.cost.toFixed(4)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
