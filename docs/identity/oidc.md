# OpenID Connect — Perionyx Identity & Access Management

**Version**: 1.0 | **Last Updated**: 2026-07-12

## Overview

Perionyx supports OpenID Connect (OIDC) as a Relying Party (RP) for federated authentication. OIDC provides a modern, REST-based SSO protocol built on OAuth 2.0 with a standardized identity layer via ID tokens. The system supports authorization code flow with PKCE.

## Discovery URL

### Well-Known Configuration

OIDC providers expose their configuration at a well-known discovery endpoint:

```
https://{provider-domain}/.well-known/openid-configuration
```

### Discovery Response

```json
{
  "issuer": "https://provider.example.com",
  "authorization_endpoint": "https://provider.example.com/authorize",
  "token_endpoint": "https://provider.example.com/token",
  "userinfo_endpoint": "https://provider.example.com/userinfo",
  "jwks_uri": "https://provider.example.com/jwks",
  "scopes_supported": ["openid", "profile", "email"],
  "response_types_supported": ["code", "id_token"],
  "grant_types_supported": ["authorization_code", "implicit"],
  "subject_types_supported": ["public"],
  "id_token_signing_alg_values_supported": ["RS256"],
  "claims_supported": ["sub", "iss", "aud", "exp", "iat", "email", "name"]
}
```

### Configuration via Discovery

```typescript
identityProviderManager.registerProvider({
  id: "oidc_entra",
  type: "oidc",
  name: "Microsoft Entra ID (OIDC)",
  status: "active",
  clientId: process.env.ENTRA_CLIENT_ID,
  clientSecret: process.env.ENTRA_CLIENT_SECRET,
  issuerUrl: "https://login.microsoftonline.com/{tenant}/v2.0",
  // Derive endpoints from issuer + discovery
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

## Authorization Flow

### Authorization Code Flow (Recommended)

```
Step 1: SP-Initiated Request
─────────────────────────────────────────────────────
Browser → Perionyx: User clicks "Login with [Provider]"
Perionyx → SSOHandler.initiateOIDC(providerId)
SSOHandler → Browser: 302 redirect to IdP authorization URL
  GET {authorizationUrl}?
    response_type=code&
    client_id={clientId}&
    redirect_uri={callbackUrl}&
    scope=openid+profile+email&
    state={random_state}&
    nonce={random_nonce}

Step 2: User Authentication at IdP
─────────────────────────────────────────────────────
IdP → User: Login form (username, password, MFA)
User → IdP: Submits credentials
IdP: Validates credentials, creates session

Step 3: Authorization Code Grant
─────────────────────────────────────────────────────
IdP → Browser: 302 redirect to callback URL
  GET {callbackUrl}?code={auth_code}&state={state}
Browser → Perionyx: /auth/oidc/{providerId}/callback?code=...&state=...

Step 4: Token Exchange
─────────────────────────────────────────────────────
SSOHandler.handleOIDCCallback(providerId, code, state, ip, ua)
  - Validates state (CSRF protection)
  - Validates nonce (replay protection)
  → POST {tokenUrl}
    grant_type=authorization_code&
    code={auth_code}&
    client_id={clientId}&
    client_secret={clientSecret}&
    redirect_uri={callbackUrl}
  ← Response: { access_token, id_token, refresh_token, expires_in }

Step 5: Token Validation
─────────────────────────────────────────────────────
SSOHandler.validateToken(access_token, providerId)
  - Fetch JWKS from jwksUrl
  - Validate JWT signature
  - Validate: exp, iss, aud, nonce (in id_token)

Step 6: User Info Retrieval
─────────────────────────────────────────────────────
→ GET {userInfoUrl} (Authorization: Bearer {access_token})
← Response: { sub, email, given_name, family_name, name, ... }

Step 7: Authentication
─────────────────────────────────────────────────────
authenticationService.loginWithSSO(providerId, token, ip, ua)
  - Resolve or provision user
  - Create session
  - Return AuthenticatedUser
```

### PKCE (Proof Key for Code Exchange)

For additional security, the system supports PKCE extension:

```typescript
initiateOIDC(providerId) {
  // Generate code_verifier and code_challenge
  const codeVerifier = generateRandomString(128)
  const codeChallenge = base64URLEncode(sha256(codeVerifier))
  // Store codeVerifier in session for callback verification
  return {
    redirectUrl: `/auth/oidc/${providerId}/authorize?response_type=code&client_id=${clientId}&code_challenge_method=S256&code_challenge=${codeChallenge}&state=${state}&nonce=${nonce}`,
    state,
    nonce,
  }
}
```

## Token Validation

### ID Token Validation

When `SSOHandler.validateToken()` processes an ID token:

| Check | Description | Failure Action |
|---|---|---|
| Signature | Verify with IdP's JWKS public key | Reject token |
| `iss` (issuer) | Must match provider's `issuerUrl` | Reject token |
| `aud` (audience) | Must include the Perionyx `clientId` | Reject token |
| `exp` (expiration) | Must be in the future | Reject token |
| `iat` (issued at) | Must be in the past (allow 5 min skew) | Reject token |
| `nonce` | Must match the nonce from initiation request | Reject token |
| `azp` (authorized party) | If present, must match `clientId` | Reject token |

### Access Token Validation

Access tokens are validated by:
1. **Introspection**: Calling IdP's token introspection endpoint
2. **Local JWT validation**: If the access token is a JWT and signed with the same JWKS
3. **User info fallback**: Using the access token to fetch user info

### Token Response

```typescript
interface OIDCTokenResponse {
  access_token: string;      // Access token (JWT or opaque)
  token_type: string;        // Typically "Bearer"
  expires_in: number;        // Lifetime in seconds
  id_token: string;          // JWT ID token (signed)
  refresh_token?: string;    // Optional refresh token
  scope?: string;            // Granted scopes
}
```

## User Info Endpoint

### Standard Claims

| Claim | Type | Description | Perionyx Mapping |
|---|---|---|---|
| `sub` | string | Subject identifier | `externalId` |
| `email` | string | Email address | `email` |
| `email_verified` | boolean | Email verified flag | — |
| `given_name` | string | First name | `firstName` |
| `family_name` | string | Last name | `lastName` |
| `name` | string | Display name | `displayName` |
| `phone_number` | string | Phone number | `phone` |
| `picture` | string | Profile picture URL | — |
| `updated_at` | timestamp | Last update time | — |
| `groups` | array | Group memberships | `groups` |

### Custom Claims

Additional claims can be requested by adding custom scopes:

```typescript
// Configure additional scopes in OAuthClient
{
  scopes: ["openid", "profile", "email", "custom:department", "custom:costCenter"],
}
```

## Configuration Steps

### Step 1: Create OIDC Provider

```typescript
identityProviderManager.registerProvider({
  id: "google_workspace_oidc",
  type: "google_workspace",
  name: "Google Workspace SSO",
  status: "active",
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  issuerUrl: "https://accounts.google.com",
  authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",
  userInfoUrl: "https://openidconnect.googleapis.com/v1/userinfo",
  jwksUrl: "https://www.googleapis.com/oauth2/v3/certs",
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

### Step 2: Configure IdP Application

On the IdP side:
1. Register Perionyx as an application/client
2. Set redirect URI: `https://perionyx.com/auth/oidc/{providerId}/callback`
3. Enable required scopes: `openid`, `profile`, `email`
4. Obtain Client ID and Client Secret
5. (Optional) Add custom claims mapping

### Step 3: Test and Verify

1. Initiate OIDC login from Perionyx
2. Verify redirect to IdP authorization page
3. Authenticate at IdP
4. Verify callback to Perionyx with authorization code
5. Confirm successful token exchange and validation
6. Verify user info retrieval and attribute mapping
7. Check audit logs for `login.success` with `identityProvider` set

## Provider-Specific Configurations

### Microsoft Entra ID (Azure AD)

```
Issuer:   https://login.microsoftonline.com/{tenantId}/v2.0
Auth:     https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/authorize
Token:    https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token
UserInfo: https://graph.microsoft.com/oidc/userinfo
JWKS:     https://login.microsoftonline.com/{tenantId}/discovery/v2.0/keys
```

### Google Workspace

```
Issuer:   https://accounts.google.com
Auth:     https://accounts.google.com/o/oauth2/v2/auth
Token:    https://oauth2.googleapis.com/token
UserInfo: https://openidconnect.googleapis.com/v1/userinfo
JWKS:     https://www.googleapis.com/oauth2/v3/certs
```

### Okta

```
Issuer:   https://{org}.okta.com/oauth2/default
Auth:     https://{org}.okta.com/oauth2/default/v1/authorize
Token:    https://{org}.okta.com/oauth2/default/v1/token
UserInfo: https://{org}.okta.com/oauth2/default/v1/userinfo
JWKS:     https://{org}.okta.com/oauth2/default/v1/keys
```

## Refresh Token Flow

If the provider includes a `refresh_token`:

```
Step 1: Access token expires (or is about to expire)
Step 2: Perionyx exchanges refresh_token for new tokens
        POST {tokenUrl}
          grant_type=refresh_token&
          refresh_token={refresh_token}&
          client_id={clientId}&
          client_secret={clientSecret}
Step 3: New { access_token, id_token, refresh_token } returned
Step 4: Session updated with new token expiry
Step 5: If refresh fails, user must re-authenticate
```

## Source Code Reference

| File | Method | Description |
|---|---|---|
| `src/server/identity/sso-handler.ts:19` | `initiateOIDC()` | Initiate OIDC authorization |
| `src/server/identity/sso-handler.ts:29` | `handleOIDCCallback()` | Process OIDC callback |
| `src/server/identity/sso-handler.ts:56` | `validateToken()` | Validate ID/access tokens |
| `src/server/identity/sso-handler.ts:68` | `getProviderMetadata()` | Get provider endpoints |
| `src/server/identity/identity-provider.ts` | `IdentityProviderManager` | Provider CRUD |
| `src/server/identity/authentication.ts:50` | `loginWithSSO()` | SSO authentication |
