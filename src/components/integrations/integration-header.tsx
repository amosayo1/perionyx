"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Upload, CreditCard, Globe, Building2, Workflow, FileSpreadsheet, Shield, MessageCircle, HardDrive, BarChart3, Banknote, Puzzle, Key, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ConnectorKindSummary } from "@/modules/connector-platform/metadata";

const iconMap: Record<string, React.ReactNode> = {
  banking: <Building2 className="h-4 w-4" />,
  erp: <Building2 className="h-4 w-4" />,
  accounting: <FileSpreadsheet className="h-4 w-4" />,
  identity: <Shield className="h-4 w-4" />,
  communication: <MessageCircle className="h-4 w-4" />,
  developer: <Workflow className="h-4 w-4" />,
  storage: <HardDrive className="h-4 w-4" />,
  analytics: <BarChart3 className="h-4 w-4" />,
  payments: <Banknote className="h-4 w-4" />,
  compliance: <Shield className="h-4 w-4" />,
  ai: <Puzzle className="h-4 w-4" />,
};

const authMethodLabels: Record<string, string> = {
  "api-key": "API Key",
  "oauth2": "OAuth 2.0",
  "basic": "Basic Auth",
  "bearer": "Bearer Token",
  "mutual-tls": "mTLS",
  "none": "No Auth",
};

function AuthFields({ authMethod }: { authMethod: string }) {
  const [showSecret, setShowSecret] = useState(false);

  if (authMethod === "none" || !authMethod) return null;

  if (authMethod === "api-key") {
    return (
      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-400">API Key</label>
        <div className="relative">
          <input
            type={showSecret ? "text" : "password"}
            className="w-full rounded-lg border border-white/[0.08] bg-zinc-900/60 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-[#d4af37]/40 focus:outline-none"
            placeholder="Enter API key"
          />
          <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
            {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    );
  }

  if (authMethod === "basic") {
    return (
      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-400">Username</label>
        <input type="text" className="w-full rounded-lg border border-white/[0.08] bg-zinc-900/60 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-[#d4af37]/40 focus:outline-none" placeholder="Enter username" />
        <label className="text-xs font-medium text-zinc-400 mt-2 block">Password</label>
        <div className="relative">
          <input type={showSecret ? "text" : "password"} className="w-full rounded-lg border border-white/[0.08] bg-zinc-900/60 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-[#d4af37]/40 focus:outline-none" placeholder="Enter password" />
          <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
            {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    );
  }

  if (authMethod === "bearer") {
    return (
      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-400">Access Token</label>
        <div className="relative">
          <input type={showSecret ? "text" : "password"} className="w-full rounded-lg border border-white/[0.08] bg-zinc-900/60 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-[#d4af37]/40 focus:outline-none" placeholder="Enter access token" />
          <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
            {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    );
  }

  if (authMethod === "oauth2") {
    return (
      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-400">Client ID</label>
        <input type="text" className="w-full rounded-lg border border-white/[0.08] bg-zinc-900/60 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-[#d4af37]/40 focus:outline-none" placeholder="OAuth client ID" />
        <label className="text-xs font-medium text-zinc-400 mt-2 block">Client Secret</label>
        <div className="relative">
          <input type={showSecret ? "text" : "password"} className="w-full rounded-lg border border-white/[0.08] bg-zinc-900/60 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-[#d4af37]/40 focus:outline-none" placeholder="OAuth client secret" />
          <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
            {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
        <label className="text-xs font-medium text-zinc-400 mt-2 block">Token URL</label>
        <input type="text" className="w-full rounded-lg border border-white/[0.08] bg-zinc-900/60 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-[#d4af37]/40 focus:outline-none" placeholder="https://provider.com/oauth/token" />
      </div>
    );
  }

  return null;
}

export function IntegrationHeader({ providers }: { providers: ConnectorKindSummary[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ConnectorKindSummary | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [connectorName, setConnectorName] = useState("");

  const stepLabels: Record<string, string> = {
    banking: "Banking",
    erp: "ERP",
    accounting: "Accounting",
    identity: "Identity",
    communication: "Communication",
    developer: "Developer",
    storage: "Storage",
    analytics: "Analytics",
    payments: "Payments",
    compliance: "Compliance",
    ai: "AI & Intelligence",
    other: "Other",
  };

  const groupedProviders = providers.reduce(
    (acc, p) => {
      const category = stepLabels[p.category] ?? p.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(p);
      return acc;
    },
    {} as Record<string, ConnectorKindSummary[]>,
  );

  const handleSelectProvider = (provider: ConnectorKindSummary) => {
    setSelectedProvider(provider);
    setShowCredentials(true);
  };

  const handleBack = () => {
    setShowCredentials(false);
    setSelectedProvider(null);
    setConnectorName("");
  };

  const handleInstall = async () => {
    if (!selectedProvider) return;
    try {
      const res = await fetch("/api/v1/integrations/connectors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: connectorName || selectedProvider.label,
          kind: selectedProvider.kind,
          authMethod: selectedProvider.authMethods[0] ?? "none",
          capabilities: selectedProvider.capabilities,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Install failed" }));
        toast.error(err.error ?? "Failed to install connector");
        return;
      }

      toast.success(`${selectedProvider.label} installed successfully`);
      setDialogOpen(false);
      setShowCredentials(false);
      setSelectedProvider(null);
      setConnectorName("");
      router.refresh();
    } catch {
      toast.error("Failed to install connector");
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Integration Hub</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-500 leading-relaxed">
          Connect enterprise banking, ERP, accounting, identity, and communication systems.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="default"
          size="sm"
          className="gap-1.5 text-xs bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20 hover:bg-[#d4af37]/20"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Integration
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => { router.refresh(); toast.success("Integrations refreshed"); }}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setImportOpen(true)}>
          <Upload className="h-3.5 w-3.5" />
          Import
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleBack(); setDialogOpen(open); }}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{showCredentials && selectedProvider ? `Configure ${selectedProvider.label}` : "Add Integration"}</DialogTitle>
            <DialogDescription>
              {showCredentials && selectedProvider
                ? `Enter connection details for ${selectedProvider.label}`
                : "Choose a connector type to integrate with PERIONYX."}
            </DialogDescription>
          </DialogHeader>

          {showCredentials && selectedProvider ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                  {iconMap[selectedProvider.category] ?? <Puzzle className="h-4 w-4" />}
                </div>
                <div>
                  <span className="text-sm font-medium text-white">{selectedProvider.label}</span>
                  <span className="block text-[10px] text-zinc-500">v{selectedProvider.version}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400">Connector Name</label>
                <input
                  type="text"
                  value={connectorName}
                  onChange={(e) => setConnectorName(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.08] bg-zinc-900/60 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-[#d4af37]/40 focus:outline-none"
                  placeholder={selectedProvider.label}
                />
              </div>

              {selectedProvider.capabilities.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1.5">Capabilities</label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProvider.capabilities.map((cap) => (
                      <span key={cap} className="rounded-full border border-white/[0.06] bg-zinc-800/60 px-2 py-0.5 text-[10px] text-zinc-400">
                        {cap.replace(/-/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedProvider.authMethods.length > 0 && selectedProvider.authMethods[0] !== "none" && (
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1.5">Auth Method</label>
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.06] bg-zinc-800/60 px-2.5 py-1 text-[11px] text-zinc-300">
                    <Key className="h-3 w-3" />
                    {authMethodLabels[selectedProvider.authMethods[0]] ?? selectedProvider.authMethods[0]}
                  </span>
                  <div className="mt-3">
                    <AuthFields authMethod={selectedProvider.authMethods[0]} />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <Button variant="ghost" size="sm" onClick={handleBack}>Back</Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleInstall}
                >
                  Install Connector
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedProviders).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">{category}</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {items.map((p) => (
                      <button
                        key={p.kind}
                        type="button"
                        onClick={() => handleSelectProvider(p)}
                        className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3 text-left transition-all hover:bg-zinc-900/60 hover:border-white/[0.1]"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                          {iconMap[p.category] ?? <Puzzle className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-medium text-white">{p.label}</span>
                          <p className="text-[10px] text-zinc-500 truncate">{p.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-zinc-700">v{p.version}</span>
                            {p.authMethods[0] && p.authMethods[0] !== "none" && (
                              <span className="text-[10px] text-zinc-700">{authMethodLabels[p.authMethods[0]] ?? p.authMethods[0]}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md">
          <DialogHeader>
            <DialogTitle>Import Configuration</DialogTitle>
            <DialogDescription>Upload a connector configuration file (JSON or YAML).</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-white/[0.1] bg-zinc-900/40 text-zinc-500">
              <Upload className="h-6 w-6" />
            </div>
            <p className="text-xs text-zinc-500">Drag & drop a file here, or click to browse</p>
            <input type="file" accept=".json,.yaml,.yml" className="hidden" id="import-file" />
            <Button variant="outline" size="sm" asChild>
              <label htmlFor="import-file" className="cursor-pointer">Browse Files</label>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}