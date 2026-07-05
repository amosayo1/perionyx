# Contributing to Perionyx

**Last Updated: July 2026**

---

## 1. Code of Conduct

All contributors must maintain a professional, respectful, and inclusive environment. Perionyx is an enterprise financial platform — the engineering standards and conduct expectations reflect that seriousness.

---

## 1. Engineering Governance Framework

Before contributing, read the following governance documents in order:

1. **Engineering Constitution** (`docs/architecture/perionyx-engineering-constitution.md`) — Immutable principles
2. **Enterprise Readiness Checklist** (`docs/architecture/enterprise-readiness-checklist.md`) — Quality gate
3. **AI Engineering Playbook** (`docs/architecture/ai-engineering-playbook.md`) — Implementation rules
4. **Transaction Strategy** (`docs/architecture/transaction-strategy.md`) — ACID, locking, retry
5. **Self-Review Framework** (`docs/architecture/self-review-framework.md`) — Mandatory self-review
6. **Secure Development Lifecycle** (`docs/security/secure-development-lifecycle.md`) — Security standards
7. **Release Checklist** (`docs/operations/release-checklist.md`) — Release gate

All contributions must satisfy the applicable criteria in these documents.

---

## 2. Architecture Review Process

### 2.1 When an Architecture Review is Required

- New feature module or API endpoint group
- Database schema changes (new models, migrations)
- New external dependency or integration
- Changes to authentication or authorization
- Changes to financial integrity (ledger, balances, transactions)
- Performance-critical code paths
- Any change that might affect tenant isolation

### 2.2 Review Checklist

Before requesting an architecture review, ensure:

- [ ] The change is consistent with the Engineering Constitution (`docs/architecture/perionyx-engineering-constitution.md`)
- [ ] The change satisfies the Enterprise Readiness Checklist (`docs/architecture/enterprise-readiness-checklist.md`)
- [ ] The AI Self-Review Framework has been completed (if AI-assisted — `docs/architecture/self-review-framework.md`)
- [ ] The AI Engineering Playbook rules are followed (`docs/architecture/ai-engineering-playbook.md`)
- [ ] The Transaction Strategy is followed (`docs/architecture/transaction-strategy.md`)
- [ ] The Secure Development Lifecycle is followed (`docs/security/secure-development-lifecycle.md`)
- [ ] The change is consistent with existing module structure
- [ ] Tenant isolation is maintained
- [ ] Error handling is explicit
- [ ] Audit logging is included (if financial state changes)
- [ ] The change is documented (architecture doc update or ADR)
- [ ] TypeScript build passes with zero errors

### 2.3 Review Cadence

- Minor changes: Code review only
- Major features: Architecture review + code review
- Breaking changes: Architecture review + ADR + stakeholder approval

---

## 3. Development Workflow

### 3.1 Branch Strategy

- `main` — Production-ready code. Always deployable.
- `develop` — Integration branch for feature work
- `feature/<name>` — Feature branches from `develop`
- `fix/<name>` — Bug fix branches
- `docs/<name>` — Documentation branches

### 3.2 Commit Convention

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation
- `refactor` — Code refactoring
- `test` — Test additions/changes
- `chore` — Maintenance, dependencies
- `security` — Security fixes

Examples:
```
feat(policies): add dry-run policy test endpoint
fix(ledger): correct balance calculation for credit transactions
docs(api): document enterprise search endpoint
```

### 3.3 Pull Request Process

1. Create feature/fix branch from `develop`
2. Implement changes following CODING_STANDARDS.md
3. Ensure TypeScript build passes (`npx tsc --noEmit`)
4. Write or update tests as appropriate
5. Update documentation (ARCHITECTURE.md, ADRs, API docs)
6. Create PR against `develop` with description of changes
7. Request review from at least one team member
8. Address review feedback
9. Squash-merge to `develop`
10. Delete feature branch

---

## 4. Coding Expectations

### 4.1 Before Writing Code

- Review the existing module structure to find where your code belongs
- Check if similar functionality already exists
- Verify the architecture is consistent with the Engineering Constitution (`docs/architecture/perionyx-engineering-constitution.md`)
- Review the Enterprise Readiness Checklist (`docs/architecture/enterprise-readiness-checklist.md`) for applicable criteria
- Complete the AI Self-Review Framework (if AI-assisted — `docs/architecture/self-review-framework.md`)
- Create or reference the relevant ADR

### 4.2 While Writing Code

- Follow CODING_STANDARDS.md for TypeScript, naming, and patterns
- Include error handling for all failure modes
- Include audit logging for financial state changes
- Ensure tenant isolation on all database queries
- Use the existing UI primitives (`src/components/ui/`)
- Maintain the dark theme design system

### 4.3 After Writing Code

- Verify TypeScript build passes
- Test with the sandbox tenant
- Review for security concerns
- Update this documentation if behavior changed

---

## 5. Documentation Requirements

### 5.1 When to Update Documentation

- New feature → Update ARCHITECTURE.md + create ADR
- API changes → Update API_GUIDELINES.md
- Security changes → Update SECURITY.md
- Design changes → Update DESIGN_SYSTEM.md
- Behavioral changes → Update GLOSSARY.md if terminology changes

### 5.2 Documentation Standards

- No placeholder text or lorem ipsum
- No TODO sections in committed documentation
- Production-quality language
- Consistent terminology with GLOSSARY.md
- Code examples where appropriate

---

## 6. Definition of Done

A contribution is complete when:

1. Engineering Constitution principles are satisfied (`docs/architecture/perionyx-engineering-constitution.md`)
2. Enterprise Readiness Checklist passes with ≥ 90% (zero critical failures in sections 3–6)
3. AI Self-Review Framework is completed and all applicable sections pass (if AI-assisted)
4. AI Engineering Playbook rules are followed (no forbidden practices)
5. Transaction Strategy guarantees are met (locking, version checks, audit, idempotency)
6. Secure Development Lifecycle requirements are satisfied (threat modeling, security review)
7. Release Checklist criteria are verified (for release-scope contributions)
8. Service module implements the business logic
9. API routes expose the functionality (if applicable)
10. UI components render the feature (if applicable)
11. TypeScript build produces zero errors
12. Production build produces zero errors and zero warnings
13. Error paths are handled and logged
14. Empty states, loading states, and error states are implemented
15. RBAC is respected
16. Tenant isolation is maintained
17. Documentation is updated
18. Code review is complete
19. Sandbox works with the changes (if applicable)

---

## 7. Getting Started

### 7.1 Prerequisites

- Node.js 22+
- pnpm 9+
- PostgreSQL 16+
- A modern IDE (VS Code recommended)

### 7.2 Local Setup

```bash
# Clone the repository
git clone <repository-url>
cd perionyx

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and auth secret

# Push database schema
npx prisma db push

# Generate Prisma client
npx prisma generate

# Start development server
pnpm dev
```

### 7.3 Accessing the Sandbox

Visit `http://localhost:3000` and click "Explore the Platform" on the landing page. This creates the sandbox tenant and logs you in automatically.

---

## 8. Tooling

| Tool | Purpose |
|------|---------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `npx tsc --noEmit` | TypeScript check |
| `npx prisma db push` | Sync schema to database |
| `npx prisma generate` | Generate Prisma client |
| `npx prisma studio` | Database browser |
