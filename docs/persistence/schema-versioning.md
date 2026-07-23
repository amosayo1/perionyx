# Schema Versioning

## Overview

Schema versioning manages the evolution of data schemas over time, tracking major, minor, and patch versions to ensure compatibility.

## SchemaVersion

```typescript
class SchemaVersion {
  major: number;  // Breaking changes
  minor: number;  // Backward-compatible additions
  patch: number;  // Bug fixes

  isCompatible(other): boolean;
  isBreaking(other): boolean;
  compare(other): -1 | 0 | 1;
  assertCompatible(other): void;
}
```

## Version Rules

| Change | Major | Minor | Patch |
|---|---|---|---|
| Breaking schema change | ✅ | | |
| New backward-compatible feature | | ✅ | |
| Bug fix | | | ✅ |

## SchemaVersionManager

```typescript
const manager = new SchemaVersionManager();

const v1 = new SchemaVersion({ major: 1, minor: 0, patch: 0, name: "v1", breaking: false });
const v2 = new SchemaVersion({ major: 1, minor: 1, patch: 0, name: "v1.1", breaking: false });

manager.register(v1);
manager.register(v2);
manager.setCurrent(v2);

// Get upgrade/downgrade paths
const upgrades = manager.getUpgradePath(); // Versions after current
const downgrades = manager.getDowngradePath(v2); // Versions before v2
```

## CompatibilityChecker

```typescript
const checker = new CompatibilityChecker();
const result = checker.check(sourceVersion, targetVersion);

if (!result.compatible) {
  console.error("Breaking changes detected:", result.issues);
}
```

## Compatibility Issues

| Type | Description |
|---|---|
| Breaking | Schema cannot be used together |
| Warning | Backward-compatible differences |
| Info | Informational differences (e.g., patch) |
