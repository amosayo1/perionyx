import type { Metadata } from "next";
import { Shield } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-white/[0.06]">
          <Shield className="h-5 w-5 text-zinc-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">Privacy Policy</h1>
          <p className="text-sm text-zinc-500">Last updated: June 2026</p>
        </div>
      </div>
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-zinc-400">
        <section>
          <h2 className="text-base font-semibold text-white">1. Information We Collect</h2>
          <p className="leading-relaxed">
            PERIONYX collects information necessary to provide enterprise treasury management services. This includes account data, transaction records, user credentials, and usage analytics.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-white">2. How We Use Information</h2>
          <p className="leading-relaxed">
            We use collected information to operate, maintain, and improve our platform; to process transactions; to comply with regulatory obligations; and to communicate with authorized users.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-white">3. Data Security</h2>
          <p className="leading-relaxed">
            All data is encrypted at rest and in transit. We implement industry-standard security controls including SOC 2 compliance, role-based access control, and audit logging.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-white">4. Data Retention</h2>
          <p className="leading-relaxed">
            Transaction and ledger data is retained in accordance with regulatory requirements. Customer data is retained for the duration of the business relationship plus applicable legal retention periods.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-white">5. Contact</h2>
          <p className="leading-relaxed">
            For privacy-related inquiries, contact privacy@perionyx.io.
          </p>
        </section>
      </div>
      <div className="mt-12 pt-8 border-t border-white/[0.06]">
        <Link href="/dashboard" className="text-sm text-[#d4af37] hover:text-[#d4af37] transition-colors">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
