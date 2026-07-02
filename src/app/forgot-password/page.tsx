import Link from "next/link";

export const metadata = {
  title: "Forgot Password | PERIONYX",
  description: "Reset your PERIONYX account password.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#090909] flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/20 mb-8">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Forgot Password</h1>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto mb-8">
          To reset your password, please contact your organization administrator or PERIONYX support.
          Self-service password reset will be available in a future release.
        </p>
        <div className="flex flex-col items-center gap-3">
          <a
            href="mailto:support@perionyx.com"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-[#d4af37] text-black hover:bg-[#c7a961] transition-colors duration-200"
          >
            Contact Support
          </a>
          <Link
            href="/sign-in"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
