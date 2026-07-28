import type { AuthenticatedUser } from "./types"
import { authenticationService } from "./authentication"
import { logger } from "@/lib/logger"

const log = logger.child({ module: "sso-handler" });

export class SSOHandler {
  initiateSAML(providerId: string, relayState?: string): { redirectUrl: string; requestId: string } {
    const requestId = `saml_req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
    return {
      redirectUrl: `/auth/saml/${providerId}/login?RelayState=${relayState ?? ""}&requestId=${requestId}`,
      requestId,
    }
  }

  handleSAMLResponse(providerId: string, samlResponse: string, ipAddress: string, userAgent: string): AuthenticatedUser {
    log.info({ providerId }, "Handling SAML response");
    const parsed = this.parseSAMLResponse(samlResponse)
    const token = parsed.NameID ?? `saml_${providerId}_${Date.now()}`
    return authenticationService.loginWithSSO(providerId, token, ipAddress, userAgent)
  }

  initiateOIDC(providerId: string): { redirectUrl: string; state: string; nonce: string } {
    const state = `oidc_state_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
    const nonce = `oidc_nonce_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
    return {
      redirectUrl: `/auth/oidc/${providerId}/authorize?response_type=code&state=${state}&nonce=${nonce}`,
      state,
      nonce,
    }
  }

  handleOIDCCallback(providerId: string, code: string, state: string, ipAddress: string, userAgent: string): AuthenticatedUser {
    log.info({ providerId }, "Handling OIDC callback");
    const token = `oidc_${providerId}_${code.substring(0, 8)}_${Date.now()}`
    return authenticationService.loginWithSSO(providerId, token, ipAddress, userAgent)
  }

  initiateOAuth2(providerId: string): { redirectUrl: string; state: string } {
    const state = `oauth_state_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
    return {
      redirectUrl: `/auth/oauth2/${providerId}/authorize?response_type=code&state=${state}`,
      state,
    }
  }

  handleOAuth2Callback(providerId: string, code: string, state: string, ipAddress: string, userAgent: string): AuthenticatedUser {
    log.info({ providerId }, "Handling OAuth2 callback");
    const token = `oauth_${providerId}_${code.substring(0, 8)}_${Date.now()}`
    return authenticationService.loginWithSSO(providerId, token, ipAddress, userAgent)
  }

  generateSAMLMetadata(providerId: string): string {
    return `<?xml version="1.0"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="https://perionyx.com/auth/saml/${providerId}">
  <md:SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://perionyx.com/auth/saml/${providerId}/acs" index="1"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>`
  }

  validateToken(token: string, providerId: string): { valid: boolean; claims?: Record<string, unknown> } {
    if (token.length < 10) return { valid: false }
    return {
      valid: true,
      claims: {
        sub: `user_${providerId}`,
        iss: `https://${providerId}.perionyx.com`,
        exp: Date.now() + 3600000,
      },
    }
  }

  getProviderMetadata(providerId: string): { issuer: string; endpoints: Record<string, string>; certificate?: string } {
    return {
      issuer: `https://${providerId}.perionyx.com`,
      endpoints: {
        authorization: `/auth/${providerId}/authorize`,
        token: `/auth/${providerId}/token`,
        userInfo: `/auth/${providerId}/userinfo`,
        jwks: `/auth/${providerId}/jwks`,
      },
      certificate: providerId.length > 10 ? `-----BEGIN CERTIFICATE-----\nMIIB${providerId}\n-----END CERTIFICATE-----` : undefined,
    }
  }

  private parseSAMLResponse(response: string): Record<string, string> {
    const result: Record<string, string> = {}
    const nameIdMatch = response.match(/<saml2:NameID[^>]*>([^<]+)<\/saml2:NameID>/)
    if (nameIdMatch) result.NameID = nameIdMatch[1]
    const issuerMatch = response.match(/<saml2:Issuer[^>]*>([^<]+)<\/saml2:Issuer>/)
    if (issuerMatch) result.Issuer = issuerMatch[1]
    return result
  }
}

export const ssoHandler = new SSOHandler()
