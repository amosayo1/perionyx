# Regulatory Frameworks

## Supported Frameworks
| Code | Name | Jurisdiction |
|------|------|-------------|
| SOX | Sarbanes-Oxley Act | United States |
| GDPR | General Data Protection Regulation | European Union |
| PCI-DSS | Payment Card Industry Data Security Standard | Global |
| ISO-27001 | ISO/IEC 27001 | Global |
| Basel III | Basel III | Global |

## Framework Service
`FrameworkService` provides CRUD operations for `RegulatoryFramework` entities:
- `getByCode()` — Filter by framework code
- `getActive()` — Only active frameworks
- `search()` — Fuzzy search by name, code, or jurisdiction

## Data Model
Each framework has: id, code, name, description, jurisdiction, effectiveFrom/To, version, isActive flag.
