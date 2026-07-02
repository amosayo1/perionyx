import fs from 'fs';
import path from 'path';
import { encrypt, decrypt } from '@/server/security/encryption';
import VaultSecretStore from './vault-secret-store';

export interface SecretStore {
  getSecret(key: string): Promise<string | null>;
  setSecret(key: string, value: string): Promise<void>;
}

const FILE = path.resolve(process.cwd(), '.perionyx_secrets.json');

function isEncrypted(value: string): boolean {
  return value.includes(':') && value.split(':').length === 3;
}

export class FileSecretStore implements SecretStore {
  async getSecret(key: string) {
    try {
      const txt = await fs.promises.readFile(FILE, 'utf-8');
      const json = JSON.parse(txt || '{}');
      const stored = json[key];
      if (stored == null) return null;
      if (isEncrypted(stored)) return decrypt(stored);
      return stored;
    } catch {
      return null;
    }
  }

  async setSecret(key: string, value: string) {
    const encrypted = encrypt(value);
    let json: Record<string, string> = {};
    try {
      json = JSON.parse(await fs.promises.readFile(FILE, 'utf-8') || '{}');
    } catch { /* start fresh */ }
    json[key] = encrypted;
    await fs.promises.writeFile(FILE, JSON.stringify(json, null, 2));
  }

  /**
   * Migrate all plaintext values in the file to encrypted.
   * Safe to call on startup.
   */
  async migrateToEncrypted(): Promise<number> {
    try {
      const txt = await fs.promises.readFile(FILE, 'utf-8');
      const json = JSON.parse(txt || '{}');
      let migrated = 0;
      for (const [k, v] of Object.entries(json)) {
        if (typeof v === 'string' && !isEncrypted(v)) {
          json[k] = encrypt(v);
          migrated++;
        }
      }
      if (migrated > 0) {
        await fs.promises.writeFile(FILE, JSON.stringify(json, null, 2));
      }
      return migrated;
    } catch {
      return 0;
    }
  }
}

export function SecretStoreFactory(): SecretStore {
  try {
    if (process.env.VAULT_ADDR && process.env.VAULT_TOKEN) return new VaultSecretStore();
  } catch {
    /* fallthrough to file store */
  }
  return new FileSecretStore();
}

export default FileSecretStore;
