# OpenAPI Specification

## Overview

Perionyx provides a full OpenAPI 3.1 specification for all public API endpoints.

## Download

The specification is available at:

```
GET /api/openapi.json
```

This endpoint returns a downloadable JSON file conforming to the OpenAPI 3.1 standard.

## Contents

The specification includes:

- **Server URLs**: Production and sandbox endpoints
- **Paths**: All registered API endpoints with methods, parameters, and responses
- **Schemas**: Type definitions for all request and response bodies
- **Security Schemes**: API Key, Bearer Token, and OAuth2 definitions
- **Tags**: Grouped by resource category
- **Error Responses**: Standard 400, 401, 403, 429 error schemas

## Usage

Import the specification into your preferred API tool:

### Swagger UI
```yaml
url: https://api.perionyx.com/api/openapi.json
```

### Postman
1. File → Import → Link
2. Enter `https://api.perionyx.com/api/openapi.json`
3. Click Import

### Insomnia
1. Application → Preferences → Data → Import Data
2. Enter `https://api.perionyx.com/api/openapi.json`

## Extensions

The specification includes x- extensions for Perionyx-specific metadata:

| Extension | Description |
|-----------|-------------|
| `x-rate-limit-tier` | Rate limit tier for this endpoint |
| `x-tenant-aware` | Whether endpoint is tenant-scoped |
| `x-audit-logged` | Whether mutations are audited |
| `x-deprecation-message` | Deprecation notice if applicable |

## Regeneration

The specification is auto-generated from registered endpoint metadata. It updates automatically as endpoints are added or modified.
