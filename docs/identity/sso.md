# Single Sign-On — Perionyx Identity & Access Management

**Version**: 1.0 | **Last Updated**: 2026-07-12

## Overview

The Perionyx SSO system supports three federation protocols (SAML 2.0, OpenID Connect, OAuth 2.0) and four pre-configured identity provider integrations (Microsoft Entra ID, Google Workspace, Okta, generic LDAP). All SSO flows are managed through `SSOHandler` and `IdentityProviderManager`.

## Supported Protocols

| Protocol | Standard | Initiation | Use Case |
|---|---|---|---|
| SAML 2.0 | OASIS SAML v2.0 | SP-initiated, IdP-initiated | Enterprise identity federation |
| OpenID Connect | OIDC 1.0 | Authorization code flow | Modern web/mobile SSO |
| OAuth 2.0 | RFC 6749 | Authorization code, implicit | API access delegation |

## Supported Identity Providers

| Provider | Type | Configuration Required |
|---|---|---|
| Microsoft Entra ID (Azure AD) | OIDC + SAML | Tenant ID, Client ID, Client Secret |
| Google Workspace | OIDC | Client ID, Client Secret, allowed domains |
| Okta | OIDC + SAML | Okta domain, API token, App integration |
| Generic SAML 2.0 | SAML | IdP metadata XML |
| Generic OIDC | OIDC | Discovery URL, Client ID, Secret |
| Generic OAuth2 | OAuth2 | Auth URL, Token URL, Client ID, Secret |
| LDAP | LDAP | Server URL, base DN, bind credentials |

## Provider Configuration

### IdentityProviderConfig

```typescript
interface IdentityProviderConfig {
  id: string;
  type: IdentityProviderType;       // "saml" | "oidc" | "oauth2" | "ldap" | "azure_ad" | "google_workspace" | "okta"
  name: string;                      // Display name
  description?: string;
  status: IdentityProviderStatus;    // "active" | "inactive" | "error" | "configuring"
  issuerUrl?: string;                // IdP issuer identifier
  metadataUrl?: string;              // SAML metadata URL
  clientId?: string;                 // OIDC/OAuth2 client ID
  clientSecret?: string;             // OIDC/OAuth2 client secret
  authorizationUrl?: string;         // OAuth2 auth endpoint
  tokenUrl?: string;                 // OAuth2 token endpoint
  userInfoUrl?: string;              // OIDC userinfo endpoint
  jwksUrl?: string;                  // JWKS endpoint
  certificate?: string;              // SAML signing certificate
  privateKey?: string;               // SAML decryption private key
  attributeMapping: Record<string, string>;  // IdP attr → Perionyx attr
  allowedDomains: string[];          // Email domain restrictions
  autoProvision: boolean;            // Auto-create users on first SSO
  defaultRoles: string[];            // Roles assigned to auto-provisioned users
  enabled: boolean;
  companyId: string;
}
```

## SSO Flows

### SP-Initiated SAML Flow

```
1. User clicks "Login with SSO" and selects provider
2. SSOHandler.initiateSAML(providerId) → redirect URL
3. User redirected to IdP login page
4. User authenticates at IdP
5. IdP POSTs SAML Response to ACS URL (/auth/saml/{providerId}/acs)
6. SSOHandler.handleSAMLResponse(providerId, samlResponse, ip, ua)
7. SAML assertion parsed:
   - NameID extracted for user identification
   - Attributes mapped to Perionyx fields
8. AuthenticationService.loginWithSSO() called
9. If autoProvision: UserProvisioningService provisions user
10. Session created, user redirected to application
```

### OIDC Authorization Code Flow

```
1. User clicks "Login with SSO" and selects OIDC provider
2. SSOHandler.initiateOIDC(providerId) → redirect URL with state + nonce
3. User redirected to IdP authorization endpoint
4. User authenticates and consents
5. IdP redirects to callback URL (/auth/oidc/{providerId}/callback) with code
6. SSOHandler.handleOIDCCallback(providerId, code, state, ip, ua)
7. State validated for CSRF protection
8. Authorization code exchanged for tokens at token endpoint
9. ID token validated (signature, nonce, exp, iss, aud)
10. User info fetched from userinfo endpoint
11. Attributes mapped to Perionyx fields
12. AuthenticationService.loginWithSSO() called
13. If autoProvision: UserProvisioningService provisions user
14. Session created, user redirected to application
```

### OAuth2 Authorization Flow

```
1. User clicks "Login with SSO" and selects OAuth2 provider
2. SSOHandler.initiateOAuth2(providerId) → redirect URL with state
3. User redirected to IdP authorization endpoint
4. User authenticates and consents
5. IdP redirects to callback URL (/auth/oauth2/{providerId}/callback) with code
6. SSOHandler.handleOAuth2Callback(providerId, code, state, ip, ua)
7. State validated for CSRF protection
8. Authorization code exchanged for access token
9. Token validated
10. User info fetched from configured endpoint
11. Attributes mapped to Perionyx fields
12. AuthenticationService.loginWithSSO() called
13. Auto-provisioning if enabled
14. Session created, user redirected to application
```

## Attribute Mapping

### Default Mappings

| Perionyx Field | SAML Attribute | OIDC Claim | OAuth2 Scope |
|---|---|---|---|
| `email` | `email` | `email` | `email` |
| `firstName` | `firstName` | `given_name` | `profile` |
| `lastName` | `lastName` | `family_name` | `profile` |
| `displayName` | `displayName` | `name` | `profile` |
| `department` | `department` | `department` | Custom claim |
| `jobTitle` | `jobTitle` | `title` | Custom claim |
| `phone` | `phoneNumber` | `phone_number` | Custom claim |

### Custom Attribute Mapping

```typescript
identityProviderManager.updateProvider("provider_123", {
  attributeMapping: {
    "email": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
    "firstName": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
    "lastName": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname",
    "department": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/department",
    "costCenter": "http://custom.company.com/claims/costcenter",
  }
})
```

## Auto-Provisioning

When `autoProvision: true` is set on an identity provider:

1. First-time SSO login creates a `ProvisionedUser` record
2. User is assigned `defaultRoles` from the provider configuration
3. User groups are synced from the IdP (SAML attribute or OIDC groups claim)
4. Provisioned user status is set to `"synced"`
5. Subsequent logins update the provisioned record via `syncUser()`

## Session Handling for SSO

| Parameter | Value |
|---|---|
| MFA status | `mfaVerified: true` (SSO implies IdP handles MFA) |
| Identity provider | Set to provider ID in session |
| Session TTL | Configured per provider or falls back to role max |
| Logout | Local session only by default; SLO supported via SAML |

## Provider Registration

```typescript
identityProviderManager.registerProvider({
  id: "azure_ad_prod",
  type: "azure_ad",
  name: "Perionyx Azure AD",
  status: "active",
  clientId: process.env.AZURE_CLIENT_ID,
  clientSecret: process.env.AZURE_CLIENT_SECRET,
  issuerUrl: "https://login.microsoftonline.com/{tenant}/v2.0",
  authorizationUrl: "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize",
  tokenUrl: "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token",
  userInfoUrl: "https://graph.microsoft.com/oidc/userinfo",
  jwksUrl: "https://login.microsoftonline.com/{tenant}/discovery/v2.0/keys",
  attributeMapping: {
    email: "email",
    firstName: "given_name",
    lastName: "family_name",
    displayName: "name",
  },
  allowedDomains: ["perionyx.com"],
  autoProvision: true,
  defaultRoles: ["read_only_executive"],
  enabled: true,
  companyId: "company_456",
})
```

## IdP Initiated SSO

In addition to SP-initiated flows, the system supports IdP-initiated login:

1. User accesses IdP portal and clicks Perionyx application
2. IdP sends unsolicited SAML Response to Perionyx ACS URL
3. `SSOHandler.handleSAMLResponse()` processes the assertion
4. User is authenticated and redirected to the default application page
5. `RelayState` parameter supports deep-linking to specific pages

## Troubleshooting

| Issue | Common Cause | Resolution |
|---|---|---|
| "SSO authentication failed" | User not found in Perionyx | Enable `autoProvision` or provision user manually |
| SAML signature invalid | Certificate mismatch | Update certificate in Perionyx provider config |
| OIDC state mismatch | CSRF state validation failure | Check callback URL timing; state expires in 10 min |
| Attribute not mapped | Missing attribute in IdP response | Update `attributeMapping` in provider config |
| Token validation failed | JWKS endpoint unreachable | Verify network connectivity to IdP |
| Redirect loop | OIDC nonce validation | Ensure nonce is generated and verified per request |

## Source Code Reference

| File | Class/Method | Description |
|---|---|---|
| `src/server/identity/sso-handler.ts` | `SSOHandler` | SSO flow management |
| `src/server/identity/sso-handler.ts:5` | `initiateSAML()` | SP-initiated SAML |
| `src/server/identity/sso-handler.ts:13` | `handleSAMLResponse()` | SAML assertion processing |
| `src/server/identity/sso-handler.ts:19` | `initiateOIDC()` | OIDC authorization initiation |
| `src/server/identity/sso-handler.ts:29` | `handleOIDCCallback()` | OIDC callback processing |
| `src/server/identity/sso-handler.ts:34` | `initiateOAuth2()` | OAuth2 flow initiation |
| `src/server/identity/sso-handler.ts:42` | `handleOAuth2Callback()` | OAuth2 callback processing |
| `src/server/identity/sso-handler.ts:47` | `generateSAMLMetadata()` | SP metadata generation |
| `src/server/identity/sso-handler.ts:56` | `validateToken()` | Token validation |
| `src/server/identity/sso-handler.ts:68` | `getProviderMetadata()` | Provider metadata endpoint |
| `src/server/identity/identity-provider.ts` | `IdentityProviderManager` | Provider CRUD management |
| `src/server/identity/authentication.ts:50` | `loginWithSSO()` | SSO authentication bridge |
