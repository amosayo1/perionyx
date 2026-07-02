'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Plug, RefreshCw } from 'lucide-react';

type ProviderConfig = {
  id: string;
  kind: string;
  label: string;
  status: string;
  domain: string | null;
  priority: number;
  metadata: Record<string, string>;
};

type ProviderKind = {
  kind: string;
  label: string;
  description: string;
  fields: ProviderField[];
};

type ProviderField = {
  name: string;
  label: string;
  type: 'text' | 'password' | 'textarea';
  required: boolean;
  placeholder?: string;
};

const PROVIDER_KINDS: ProviderKind[] = [
  {
    kind: 'entra-id',
    label: 'Microsoft Entra ID',
    description: 'Azure AD / Microsoft 365 identity provider with OIDC, SSO, and directory sync',
    fields: [
      { name: 'tenantId', label: 'Tenant ID', type: 'text', required: true, placeholder: 'your-tenant.onmicrosoft.com' },
      { name: 'clientId', label: 'Client ID', type: 'text', required: true },
      { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { name: 'domain', label: 'Domain', type: 'text', required: false, placeholder: 'contoso.com' },
      { name: 'groupRoleMap', label: 'Group-to-Role Mapping (JSON)', type: 'textarea', required: false, placeholder: '{"group-id":"admin","group-id-2":"member"}' },
    ],
  },
  {
    kind: 'google-workspace',
    label: 'Google Workspace',
    description: 'Google Workspace identity provider with OIDC, SSO, and directory sync',
    fields: [
      { name: 'clientId', label: 'Client ID', type: 'text', required: true },
      { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { name: 'domain', label: 'Domain', type: 'text', required: false, placeholder: 'yourcompany.com' },
      { name: 'adminEmail', label: 'Admin Email', type: 'text', required: false, placeholder: 'admin@yourcompany.com' },
      { name: 'groupRoleMap', label: 'Group-to-Role Mapping (JSON)', type: 'textarea', required: false, placeholder: '{"group-id":"admin","group-id-2":"member"}' },
    ],
  },
];

const statusColor: Record<string, string> = {
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  disabled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  configuring: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  error: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function EnterpriseIdentityPage() {
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedKind, setSelectedKind] = useState<string>('');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    try {
      const r = await fetch('/api/v1/admin/identity');
      if (r.ok) {
        const d = await r.json();
        setProviders(d.providers ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleAddProvider = async () => {
    if (!selectedKind) return;
    const kindDef = PROVIDER_KINDS.find((k) => k.kind === selectedKind);
    if (!kindDef) return;

    const requiredFields = kindDef.fields.filter((f) => f.required);
    for (const f of requiredFields) {
      if (!formValues[f.name]?.trim()) {
        toast.error(`${f.label} is required`);
        return;
      }
    }

    setSaving(true);
    try {
      const metadata: Record<string, string> = {};
      for (const field of kindDef.fields) {
        if (formValues[field.name]) {
          metadata[field.name] = formValues[field.name];
        }
      }

      const r = await fetch('/api/v1/admin/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: selectedKind,
          label: kindDef.label,
          domain: metadata.domain || undefined,
          metadata,
        }),
      });

      if (!r.ok) {
        const err = await r.json().catch(() => ({ error: 'Failed to add provider' }));
        throw new Error(err.error ?? err.message ?? 'Failed to add provider');
      }

      toast.success(`${kindDef.label} provider added`);
      setDialogOpen(false);
      setSelectedKind('');
      setFormValues({});
      await fetchProviders();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to add provider');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProvider = async (id: string) => {
    try {
      const r = await fetch(`/api/v1/admin/identity/${id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('Failed to delete');
      toast.success('Provider deleted');
      await fetchProviders();
    } catch {
      toast.error('Failed to delete provider');
    }
  };

  const handleTestConnection = async (provider: ProviderConfig) => {
    setTestingId(provider.id);
    try {
      const r = await fetch(`/api/v1/admin/identity/${provider.id}/test`, { method: 'POST' });
      const d = await r.json();
      if (d.ok) {
        toast.success(`Connection to ${provider.label} successful`);
      } else {
        toast.error(`Connection failed: ${d.message ?? 'Unknown error'}`);
      }
    } catch (err: any) {
      toast.error(`Connection failed: ${err?.message ?? 'Network error'}`);
    } finally {
      setTestingId(null);
    }
  };

  const handleSyncDirectory = async (provider: ProviderConfig) => {
    setSyncingId(provider.id);
    try {
      const r = await fetch(`/api/v1/admin/identity/${provider.id}/sync`, { method: 'POST' });
      const d = await r.json();
      if (r.ok) {
        toast.success(`Sync completed: +${d.added} added, ${d.updated} updated, ${d.deactivated} deactivated`);
      } else {
        toast.error(`Sync failed: ${d.message ?? 'Unknown error'}`);
      }
    } catch (err: any) {
      toast.error(`Sync failed: ${err?.message ?? 'Network error'}`);
    } finally {
      setSyncingId(null);
    }
  };

  const registeredKinds = providers.map((p) => p.kind);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4af37]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Enterprise Identity</h1>
          <p className="text-sm text-gray-400 mt-1">Configure identity providers, SSO, and directory sync</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#d4af37] text-black hover:bg-[#e0bd4a]">
              <Plus className="h-4 w-4 mr-2" />
              Add Provider
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0a0a0a] border-gray-800 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Add Identity Provider</DialogTitle>
              <DialogDescription className="text-gray-400">
                Configure a new enterprise identity provider for your organization
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="provider-kind">Provider Type</Label>
                <Select
                  id="provider-kind"
                  value={selectedKind}
                  onChange={(e) => { setSelectedKind(e.target.value); setFormValues({}); }}
                >
                  <option value="">Select a provider type</option>
                  {PROVIDER_KINDS.filter((k) => !registeredKinds.includes(k.kind)).map((k) => (
                    <option key={k.kind} value={k.kind}>{k.label}</option>
                  ))}
                </Select>
              </div>

              {selectedKind && (
                <div className="space-y-3">
                  {PROVIDER_KINDS.find((k) => k.kind === selectedKind)?.fields.map((field) => (
                    <div key={field.name} className="space-y-1">
                      <Label htmlFor={field.name}>{field.label}{field.required ? ' *' : ''}</Label>
                      {field.type === 'textarea' ? (
                        <Textarea
                          id={field.name}
                          className="bg-gray-900 border-gray-700 text-white min-h-[80px]"
                          placeholder={field.placeholder}
                          value={formValues[field.name] ?? ''}
                          onChange={(e) => setFormValues((p) => ({ ...p, [field.name]: e.target.value }))}
                        />
                      ) : (
                        <Input
                          id={field.name}
                          type={field.type === 'password' ? 'password' : 'text'}
                          className="bg-gray-900 border-gray-700 text-white"
                          placeholder={field.placeholder}
                          value={formValues[field.name] ?? ''}
                          onChange={(e) => setFormValues((p) => ({ ...p, [field.name]: e.target.value }))}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button
                className="bg-[#d4af37] text-black hover:bg-[#e0bd4a]"
                onClick={handleAddProvider}
                disabled={saving || !selectedKind}
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add Provider
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-[#0a0a0a] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">Configured Providers</CardTitle>
            <CardDescription>Identity providers configured for this organization</CardDescription>
          </CardHeader>
          <CardContent>
            {providers.length === 0 ? (
              <p className="text-sm text-gray-500">No providers configured yet</p>
            ) : (
              <div className="space-y-3">
                {providers.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-800">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{p.label}</p>
                      <p className="text-xs text-gray-500 truncate">
                        kind: {p.kind}
                        {p.domain ? ` · domain: ${p.domain}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                        onClick={() => handleTestConnection(p)}
                        disabled={testingId === p.id}
                        title="Test connection"
                      >
                        {testingId === p.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plug className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                        onClick={() => handleSyncDirectory(p)}
                        disabled={syncingId === p.id}
                        title="Sync directory"
                      >
                        {syncingId === p.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                      <Badge variant="outline" className={statusColor[p.status] ?? ''}>
                        {p.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                        onClick={() => handleDeleteProvider(p.id)}
                        title="Delete provider"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">Provider SDKs</CardTitle>
            <CardDescription>Available identity provider integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {PROVIDER_KINDS.map((sdk) => {
              const isConfigured = registeredKinds.includes(sdk.kind);
              return (
                <div key={sdk.kind} className="flex items-center justify-between p-3 rounded-lg border border-gray-800">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{sdk.label}</p>
                    <p className="text-xs text-gray-500 truncate">{sdk.description}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      isConfigured
                        ? 'bg-green-500/10 text-green-500 border-green-500/20 shrink-0 ml-2'
                        : 'text-gray-500 border-gray-700 shrink-0 ml-2'
                    }
                  >
                    {isConfigured ? 'active' : 'available'}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
