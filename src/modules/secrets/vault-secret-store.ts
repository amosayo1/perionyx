import { z } from 'zod';

export class VaultSecretStore {
  base: string;
  token: string;
  mount: string;

  constructor() {
    const addr = process.env.VAULT_ADDR;
    const token = process.env.VAULT_TOKEN;
    this.mount = process.env.VAULT_MOUNT ?? 'secret';
    if (!addr || !token) throw new Error('VAULT_ADDR and VAULT_TOKEN must be set to use VaultSecretStore');
    this.base = addr.replace(/\/$/, '');
    this.token = token;
  }

  async getSecret(key: string): Promise<string | null> {
    const url = `${this.base}/v1/${this.mount}/data/${encodeURIComponent(key)}`;
      const res = await fetch(url, { headers: { 'X-Vault-Token': this.token } });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.data?.value ?? null;
  }

  async setSecret(key: string, value: string): Promise<void> {
    const url = `${this.base}/v1/${this.mount}/data/${encodeURIComponent(key)}`;
      await fetch(url, { method: 'POST', headers: { 'X-Vault-Token': this.token, 'Content-Type': 'application/json' }, body: JSON.stringify({ data: { value } }) });
  }
}

export default VaultSecretStore;
