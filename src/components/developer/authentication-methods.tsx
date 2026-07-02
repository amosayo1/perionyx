import { authMethods } from "./data";
import { AuthenticationCard } from "./authentication-card";

export function AuthenticationMethods() {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Authentication</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Secure authentication methods for API access</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {authMethods.map((method) => (
          <AuthenticationCard key={method.id} method={method} />
        ))}
      </div>
    </div>
  );
}
