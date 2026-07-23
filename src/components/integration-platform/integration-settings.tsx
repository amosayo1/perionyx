"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Save, RotateCcw, Trash2, AlertTriangle } from "lucide-react";

interface Credential {
  id: string;
  key: string;
  expiresAt: string | null;
  rotatedAt: string | null;
  version: number;
}

interface SettingsInstance {
  id: string;
  name: string;
  status: string;
  healthStatus: string;
  authMethod: string;
  isActive: boolean;
  lastSyncAt: string | null;
  error: string | null;
  version: string | null;
  connectorDef?: { name: string } | null;
  credentials: Credential[];
  createdAt: string;
  updatedAt: string;
}

interface IntegrationSettingsProps {
  instance: SettingsInstance;
  onUpdate: (data: { name?: string; isActive?: boolean; config?: Record<string, string> }) => void;
  onDelete: () => void;
}

export function IntegrationSettings({ instance, onUpdate, onDelete }: IntegrationSettingsProps) {
  const [name, setName] = useState(instance.name);
  const [isActive, setIsActive] = useState(instance.isActive);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5">
        <h3 className="mb-4 text-sm font-semibold text-white">General</h3>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-zinc-500">Instance Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-amber-400/50 focus:outline-none" />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-zinc-500">Active</label>
            <button onClick={() => setIsActive(!isActive)} className={cn("relative h-5 w-9 rounded-full transition-colors", isActive ? "bg-emerald-500" : "bg-zinc-700")}>
              <div className={cn("absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform", isActive && "translate-x-4")} />
            </button>
          </div>
          <button onClick={() => onUpdate({ name, isActive })} className="flex items-center gap-1 rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-500"><Save className="h-4 w-4" /> Save Changes</button>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5">
        <h3 className="mb-4 text-sm font-semibold text-white">Connection Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs text-zinc-500">Status</p><p className={cn("mt-1 text-sm", instance.status === "connected" ? "text-emerald-400" : instance.status === "error" ? "text-red-400" : "text-zinc-300")}>{instance.status}</p></div>
          <div><p className="text-xs text-zinc-500">Auth Method</p><p className="mt-1 text-sm text-zinc-300">{instance.authMethod}</p></div>
          <div><p className="text-xs text-zinc-500">Connector</p><p className="mt-1 text-sm text-zinc-300">{instance.connectorDef?.name ?? "—"}</p></div>
          <div><p className="text-xs text-zinc-500">Version</p><p className="mt-1 text-sm text-zinc-300">{instance.version ?? "—"}</p></div>
          <div><p className="text-xs text-zinc-500">Last Sync</p><p className="mt-1 text-sm text-zinc-300">{instance.lastSyncAt ? new Date(instance.lastSyncAt).toLocaleString() : "Never"}</p></div>
          <div><p className="text-xs text-zinc-500">Created</p><p className="mt-1 text-sm text-zinc-300">{new Date(instance.createdAt).toLocaleString()}</p></div>
        </div>
        {instance.error && (
          <div className="mt-3 rounded-lg bg-red-400/5 p-3 text-xs text-red-400">
            <p className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {instance.error}</p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5">
        <h3 className="mb-4 text-sm font-semibold text-white">Credentials</h3>
        {instance.credentials.length === 0 ? (
          <p className="text-sm text-zinc-500">No credentials stored</p>
        ) : (
          <div className="space-y-2">
            {instance.credentials.map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-zinc-950 p-3">
                <div>
                  <p className="text-xs text-zinc-300">{c.key}</p>
                  <p className="text-[10px] text-zinc-600">v{c.version} · {c.rotatedAt ? `Rotated ${new Date(c.rotatedAt).toLocaleDateString()}` : "Never rotated"}</p>
                </div>
                {c.expiresAt && <span className={cn("text-[10px]", new Date(c.expiresAt) < new Date() ? "text-red-400" : "text-zinc-500")}>Expires {new Date(c.expiresAt).toLocaleDateString()}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-5">
        <h3 className="mb-2 text-sm font-semibold text-red-400">Danger Zone</h3>
        <p className="mb-3 text-xs text-zinc-500">Deleting this integration will remove all instances and sync history. This action cannot be undone.</p>
        {showDelete ? (
          <div className="flex items-center gap-2">
            <p className="text-xs text-red-400">Are you sure?</p>
            <button onClick={onDelete} className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600">Confirm Delete</button>
            <button onClick={() => setShowDelete(false)} className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:text-white">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setShowDelete(true)} className="flex items-center gap-1 rounded-lg border border-red-400/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-400/10"><Trash2 className="h-3 w-3" /> Delete Integration</button>
        )}
      </div>
    </div>
  );
}
