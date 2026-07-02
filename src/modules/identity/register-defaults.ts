import { identityProviderRegistry } from "./registry";
import { LocalIdentityProvider } from "./adapters/local";
import { MicrosoftEntraIdProvider } from "./adapters/entra-id";
import { GoogleWorkspaceProvider } from "./adapters/google-workspace";

identityProviderRegistry.registerKind("local", () => new LocalIdentityProvider());
identityProviderRegistry.registerKind("entra-id", () => new MicrosoftEntraIdProvider());
identityProviderRegistry.registerKind("google-workspace", () => new GoogleWorkspaceProvider());
