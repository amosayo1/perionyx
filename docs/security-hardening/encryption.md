# Encryption Service

## Architecture

`EncryptionService` (`src/server/security/encryption.ts`) provides AES-256-GCM encryption with key versioning, history-based decryption, and a KMS provider interface.

```
EncryptionService (singleton via getEncryptionService())
│
├── Algorithm: aes-256-gcm (authenticated encryption)
├── Key Length: 32 bytes (256 bits)
├── IV: 16 random bytes per encryption
├── Auth Tag: 16 bytes (appended by GCM)
│
├── Current Key: keys.get(currentKeyId)
├── Key History: parse ENCRYPTION_KEY_HISTORY
└── KMS Provider: optional KMSProvider interface
```

### Encrypted Payload Format

```
base64(JSON metadata):<hex ciphertext>
```

Metadata structure:
```json
{
  "keyId": "v1",
  "algorithm": "aes-256-gcm",
  "iv": "<hex>",
  "authTag": "<hex>",
  "version": 1,
  "timestamp": "2026-07-13T12:00:00.000Z"
}
```

## Key Versioning and Rotation

### Current key
Set via `ENCRYPTION_KEY` (hex string, 64 chars) and `ENCRYPTION_KEY_ID` (default `"v1"`).

### Key history
Set via `ENCRYPTION_KEY_HISTORY` — comma-separated `keyId=hexKey` pairs:
```
ENCRYPTION_KEY_HISTORY="v0=abc123...def,v1=def456...789"
```

Old keys are used only for **decryption** of data that was encrypted while that key was current. New encryption always uses the current key.

### Rotation procedure

```typescript
import { encryptionService } from "@/server/security/encryption";

// 1. Generate a new key
const newKey = crypto.randomBytes(32).toString("hex"); // 64 hex chars

// 2. Rotate — old key auto-added to history
encryptionService.rotateKey(
  "old-key-hex-64-chars...",
  newKey,
  "v2"
);

// 3. Re-encrypt existing data (optional, for full rotation)
encryptionService.reEncrypt(previousPayload);
```

## KMS Provider Interface

For production deployments that require FIPS 140-2 validated HSM-backed keys:

```typescript
interface KMSProvider {
  encrypt(plaintext: string, context?: Record<string, string>): Promise<string>;
  decrypt(ciphertext: string, context?: Record<string, string>): Promise<string>;
  generateKey(): Promise<{ keyId: string; key: string }>;
}
```

To use a KMS provider:

```typescript
import { encryptionService } from "@/server/security/encryption";
import { AwsKmsProvider } from "./providers/aws-kms"; // hypothetical

encryptionService.setKMSProvider(new AwsKmsProvider({
  region: "us-east-1",
  keyId: "arn:aws:kms:...",
}));
```

The `decryptWithKMS()` method delegates to the KMS provider. The local AES-256-GCM `encrypt()`/`decrypt()` remain available for backward compatibility.

## Migration Path for Old Encrypted Data

1. **During rotation**: old key stays in `ENCRYPTION_KEY_HISTORY`. All existing data remains decryptable.
2. **Re-encryption**: call `reEncrypt()` on stored payloads to move them to the new key:

```typescript
for (const record of await prisma.encryptedField.findMany()) {
  record.value = encryptionService.reEncrypt(record.value);
  await prisma.encryptedField.update({ where: { id: record.id }, data: { value: record.value } });
}
```

3. **Key removal**: only remove old keys from history after all data encrypted with that key has been re-encrypted.

## ENCRYPTION_KEY_HISTORY Configuration

```bash
# .env.production
ENCRYPTION_KEY=v2...<current 64 hex chars>...
ENCRYPTION_KEY_ID=v2
ENCRYPTION_KEY_HISTORY=v0=abc...def,v1=def...789
```

If you attempt to decrypt a payload whose `keyId` is not in either the current key or the history, the service throws:
```
EncryptionKeyError: No encryption key found for keyId: v0.
If this key was rotated, add the old key to ENCRYPTION_KEY_HISTORY.
```

## Startup Validation

The `EncryptionService` constructor rejects:

- Missing `ENCRYPTION_KEY`
- Known insecure default values (`test-encryption-key-32-chars-long!!`, `0000...0000`)
- Keys that are not exactly 64 hex characters
