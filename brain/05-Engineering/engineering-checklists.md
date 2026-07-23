---
title: Engineering Checklists
created: 2026-07-20
tags:
  - type/checklist
  - domain/engineering
  - status/active
---

## Phase Complete Checklist

### Code
- [ ] All features implemented
- [ ] All tests pass (`pnpm test`)
- [ ] Typecheck passes (`pnpm typecheck`)
- [ ] Build passes (`pnpm build`)
- [ ] No new security warnings

### Documentation
- [ ] CHANGELOG updated
- [ ] README updated (if user-facing changes)

### Brain Updates
- [ ] Create phase journal entry (`bash brain.sh new-phase <num> <name>`)
- [ ] Create/update ADRs for new decisions
- [ ] Update Architecture MOC if new concepts introduced
- [ ] Update Security MOC if new findings
- [ ] Update Product MOC if new features
- [ ] Update Engineering MOC if new practices
- [ ] Update Evolution Timeline
- [ ] Update Home Dashboard
- [ ] Add lessons learned to Lessons Library
- [ ] Update Open Questions (resolve or add new)
- [ ] Validate links (`bash brain.sh validate-links`)

## Architecture Change Checklist

### Before Implementation
- [ ] Document the decision in an ADR
- [ ] Get buy-in from relevant stakeholders
- [ ] Check constitution compliance

### After Implementation
- [ ] Update Architecture MOC
- [ ] Update relevant Mermaid diagrams
- [ ] Update Canvas boards (if major change)
- [ ] Create ADR if not already done
- [ ] Add lesson if non-obvious trade-off
- [ ] Update Decision Network

## Security Change Checklist

### Before Implementation
- [ ] Threat model reviewed
- [ ] Constitution security checklist passed
- [ ] No new information disclosure

### After Implementation
- [ ] Create security finding note (if new finding)
- [ ] Update Security MOC
- [ ] Update threat model
- [ ] Update OWASP compliance status
- [ ] Update Security Status on Home Dashboard
- [ ] Add to Evolution Timeline

## Customer Interview Checklist

### Before Interview
- [ ] Review persona notes
- [ ] Prepare questions based on [[Open Questions]]
- [ ] Have interview template ready

### After Interview
- [ ] Create interview note (`bash brain.sh new-interview "Name"`)
- [ ] Extract pain points
- [ ] Extract feature requests
- [ ] Extract quotes
- [ ] Update Customer Discovery MOC
- [ ] Update personas if new insights
- [ ] Update Product MOC if new features identified
- [ ] Link to related workflows and modules

## Release Checklist

### Code
- [ ] All tests pass
- [ ] Typecheck passes
- [ ] Build passes
- [ ] Security scan clean
- [ ] Version bumped

### Brain
- [ ] Update Evolution Timeline with release
- [ ] Update Roadmaps MOC
- [ ] Update Home Dashboard version
- [ ] Create release journal entry
- [ ] Archive completed phase notes
- [ ] Update Open Questions (resolved items)

## Workflow Change Checklist

### Before Implementation
- [ ] Document current workflow state
- [ ] Identify approval chain impact
- [ ] Check audit trail requirements

### After Implementation
- [ ] Update Enterprise Workflows MOC
- [ ] Update workflow diagrams
- [ ] Update approval chain documentation
- [ ] Add lesson if non-obvious decision
- [ ] Update relevant ADR
