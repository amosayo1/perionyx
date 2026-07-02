import Link from "next/link";
import { SignInForm } from "./sign-in-form";

type Props = { searchParams: Promise<{ callbackUrl?: string }> };

export default async function SignInPage(props: Props) {
  const searchParams = await props.searchParams;
  const callbackUrl = searchParams.callbackUrl ?? "/dashboard";

  return (
    <div className="grid w-full grid-cols-1 gap-0 lg:grid-cols-[1fr_1.1fr]">
      <section className="flex flex-col justify-center border-r border-white/[0.06] px-8 py-12 lg:px-16">
        <div className="max-w-md">
          <div className="mb-10">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d4af37] overflow-hidden shadow-lg shadow-[#d4af37]/20">
              <img src="/logo.PNG" alt="Perionyx" className="h-full w-full object-cover" />
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Enterprise financial operations, one platform.
          </h1>
          <p className="mt-4 text-base leading-7 text-zinc-400">
            PERIONYX unifies treasury, payments, approvals, governance, reconciliation, audit, and AI into a single operating system for company money.
          </p>

          <div className="mt-12 space-y-0 border-t border-white/[0.06] pt-8">
            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#d4af37]">Ledger</p>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Double-entry accounting with idempotent transfers and full audit trails.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#d4af37]">Automation</p>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Scheduled reconciliation, recurring transfers, and rule-based approval routing.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#d4af37]">Banking</p>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Plaid-powered bank connectivity with real-time balance and transaction sync.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#d4af37]">Governance</p>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Role-based access, approval policies, and comprehensive audit logging.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-8 py-12 lg:px-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-white">Sign in</h2>
            <p className="text-sm leading-6 text-zinc-400">
              Use your credentials to access your workspace.
            </p>
          </div>

          <SignInForm callbackUrl={callbackUrl} />

          <p className="mt-8 text-center text-sm text-zinc-500">
            New to PERIONYX?{' '}
            <Link href="/sign-up" className="font-semibold text-[#d4af37] hover:text-[#c7a961]">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
