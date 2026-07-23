# Dependency Security Strategy

## Tool

**`pnpm audit`** — built into pnpm, no additional dependencies required. Checks the `pnpm-lock.yaml` lockfile against the [GitHub Advisory Database](https://github.com/advisories).

No third-party scanning tools are installed. `pnpm audit` is sufficient for the current threat model and avoids toolchain complexity.

## CI Integration

### Security Job (GitHub Actions)

The `security` job in `.github/workflows/ci.yml` runs:

```yaml
- name: Security audit
  run: pnpm audit --audit-level=high
```

**No `|| true`** — the job fails on any high or critical vulnerability. This was changed from the previous permissive configuration.

### Dependency Audit Job

A separate `dependency-audit` job generates a machine-readable report:

```yaml
- name: Dependency audit report
  run: pnpm audit --json > audit-report.json || true

- name: Upload audit report
  uses: actions/upload-artifact@v4
  with:
    name: dependency-audit-report
    path: audit-report.json
```

The report is uploaded as a GitHub Actions artifact for review. This job always succeeds (uses `|| true`) — it's informational. The `security` job is the gate.

## Failure Policy

| Severity | CI Behavior | Deployment |
|---|---|---|
| **Critical** | CI fails | Blocks deployment |
| **High** | CI fails | Blocks deployment |
| **Moderate** | CI passes | Track in backlog |
| **Low** | CI passes | Informational |

Critical and high vulnerabilities block the CI pipeline. There is no override or exception mechanism — a failing audit requires either a patch upgrade or a documented risk acceptance.

## Review Policy

- **Monthly**: Manual review of new advisories via `pnpm audit` output
- **On dependency change**: Every PR that modifies `package.json` or `pnpm-lock.yaml` triggers the security job automatically
- **Advisory tracking**: High/critical advisories that cannot be immediately resolved are tracked in the project issue tracker with a due date

## DependencyScanner (Runtime)

`src/server/security/dependency-scanner.ts` provides a programmatic wrapper around `pnpm audit` for runtime checks:

- Runs `pnpm audit --json` as a child process
- Parses the JSON output into typed `AuditResult` objects
- Filters by severity threshold
- Returns structured results for use in health checks or admin dashboards
- Used by the dependency audit health check in the observability layer

**Not used in production request paths** — it's a diagnostic tool for operational visibility.

## Scope

**Production dependencies only.** The `pnpm audit` command checks all dependencies by default, but the failure policy applies only to production (`dependencies`) — not `devDependencies`.

Rationale: devDependencies don't ship to production. A vulnerable test framework is a development concern, not a runtime risk. Dev dependency advisories are tracked but don't block deployment.

## K8s Secret Validation

CI includes a grep check for placeholder secrets in Kubernetes manifests:

```yaml
- name: Validate K8s secrets
  run: |
    ! grep -r "CHANGE_ME\|REPLACE_ME\|your-secret" k8s/ --include="*.yaml"
```

This catches hardcoded placeholder values that were never replaced with real secrets. The check runs on every PR that touches `k8s/` manifests.

## Summary

| Control | Implementation |
|---|---|
| Scanner | `pnpm audit` (built-in) |
| CI gate | `--audit-level=high` (no `|| true`) |
| Report artifact | JSON uploaded per CI run |
| Failure policy | Critical + High = block |
| Review cadence | Monthly + on dependency change |
| Scope | Production dependencies |
| K8s validation | Placeholder secret grep check |
| Runtime scanning | `DependencyScanner` class (diagnostic) |
