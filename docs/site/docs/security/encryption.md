---
id: encryption
title: Encryption
sidebar_label: Encryption
description: AES-256-GCM encryption, key rotation, KMS provider interface, and payload format.
---

# Encryption

`src/server/security/encryption.ts` implements AES-256-GCM:

- Algorithm: `aes-256-gcm` (256-bit key, 16-byte IV, 16-byte auth tag)
- Key from `ENCRYPTION_KEY` env var (64 hex characters = 32 bytes)
- Key rotation via `ENCRYPTION_KEY_HISTORY` env var (comma-separated `keyId=hex` pairs)
- Payload format: `base64(metadata):hex(ciphertext)`
- Metadata includes: keyId, algorithm, IV, authTag, version, timestamp
- Methods: `encrypt()`, `decrypt()`, `reEncrypt()`, `rotateKey()`
- KMS provider interface for cloud HSM integration
- Singleton via `getEncryptionService()`
- Hard-coded default and test keys are rejected at construction
