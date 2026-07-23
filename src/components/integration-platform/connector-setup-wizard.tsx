"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SetupWizardProps {
  connector: { provider: string; name: string; authTypes: string[] };
  onSave: (data: { name: string; authType: string; config: Record<string, string> }) => Promise<void>;
  onClose: () => void;
}

export function ConnectorSetupWizard({ connector, onSave, onClose }: SetupWizardProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [authType, setAuthType] = useState(connector.authTypes[0] ?? "");
  const [config, setConfig] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const authFields: Record<string, string[]> = {
    oauth2: ["clientId", "clientSecret", "redirectUri", "scopes"],
    "api-key": ["apiKey", "endpointUrl"],
    basic: ["username", "password", "endpointUrl"],
    certificate: ["certificatePem", "keyPem", "passphrase"],
    jwt: ["privateKey", "issuer", "subject", "audience"],
    sftp: ["host", "port", "username", "privateKey"],
  };

  const fields = authFields[authType] ?? ["endpointUrl", "apiKey"];

  const handleSave = async () => {
    if (!name.trim()) { setError("Connection name required"); return; }
    setSaving(true); setError("");
    try {
      await onSave({ name, authType, config });
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to save"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg rounded-xl border border-white/[0.06] bg-zinc-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Connect {connector.name}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">&times;</button>
        </div>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="auth" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <InputField label="Connection Name" value={name} onChange={setName} placeholder="My SAP Instance" />
              <div className="space-y-1">
                <label className="text-xs text-zinc-500">Authentication</label>
                <select value={authType} onChange={e => setAuthType(e.target.value)} className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white">
                  {connector.authTypes.map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
                </select>
              </div>
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="config" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              {fields.map(f => <InputField key={f} label={f} value={config[f] ?? ""} onChange={v => setConfig(p => ({ ...p, [f]: v }))} type={f.toLowerCase().includes("secret") || f.toLowerCase().includes("password") || f.toLowerCase().includes("key") ? "password" : "text"} />)}
            </motion.div>
          )}
        </AnimatePresence>
        {error && <p role="alert" className="mt-3 text-xs text-red-400">{error}</p>}
        <div className="mt-6 flex justify-between">
          <button onClick={() => step > 0 ? setStep(s => s - 1) : onClose()} className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-400 hover:text-white">{step === 0 ? "Cancel" : "Back"}</button>
          {step < 1 ? (
            <button onClick={() => setStep(1)} disabled={!name.trim()} className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-500 disabled:opacity-50">Next</button>
          ) : (
            <button onClick={handleSave} disabled={saving} className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-500 disabled:opacity-50">{saving ? "Saving..." : "Connect"}</button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-zinc-500">{label}</label>
      <input
        type={type ?? "text"} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-amber-400/50 focus:outline-none"
      />
    </div>
  );
}
