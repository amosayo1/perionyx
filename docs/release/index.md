# Release Engineering

## Versioning

Semantic versioning: `v{major}.{minor}.{patch}`

- **Major**: Breaking API changes, database migrations requiring downtime
- **Minor**: New features, backward-compatible changes
- **Patch**: Bug fixes, security patches

## Release Process

### 1. Development
```
feature-branch → develop
```
- All PRs merged to `develop`
- CI runs typecheck, lint, tests
- Feature flags gate new functionality

### 2. Release Branch
```
develop → release/v{major}.{minor}.0
```
- Cut from `develop` at feature freeze
- Only bug fixes and documentation
- QA testing on release branch

### 3. Release Candidate
```
release/v{major}.{minor}.0 → tag v{major}.{minor}.0-rc.1
```
- Deployed to staging
- Integration tests run
- Performance benchmarks
- Security scan

### 4. Release
```
release/v{major}.{minor}.0 → tag v{major}.{minor}.0
```
- Deployed to production
- Monitored for 24h
- Hotfix branch if needed

## Changelog

Generated from conventional commits:
- `feat:` → New feature (minor)
- `fix:` → Bug fix (patch)
- `BREAKING CHANGE:` → Breaking change (major)
- `chore:` → Maintenance (no release)

## Artifacts

| Artifact | Location | Retention |
|---|---|---|
| Docker image | ghcr.io/organization/perionyx | All tagged versions |
| Build output | GitHub Actions artifacts | 90 days |
| Test reports | Coverage/ directory | Per build |
| Audit reports | GitHub Actions artifacts | Per build |

## Rollback

See [Rollback Guide](../operations/rollback-guide.md):
- Kubernetes: `kubectl rollout undo`
- Database: `prisma migrate resolve --rolled-back`
- Full restore: Backup restore procedure
