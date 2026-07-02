import type { Metadata } from "next";
import { ScrollText } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-white/[0.06]">
          <ScrollText className="h-5 w-5 text-zinc-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">Terms of Service</h1>
          <p className="text-sm text-zinc-500">Last updated: June 2026</p>
        </div>
      </div>
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-zinc-400">
        <section>
          <h2 className="text-base font-semibold text-white">1. Acceptance of Terms</h2>
          <p className="leading-relaxed">
            By accessing or using PERIONYX, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-white">2. Enterprise License</h2>
          <p className="leading-relaxed">
            PERIONYX grants you a limited, non-exclusive, non-transferable license to access and use the platform for your internal business operations in accordance with your subscription agreement.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-white">3. User Obligations</h2>
          <p className="leading-relaxed">
            You are responsible for maintaining the confidentiality of your credentials, for all activities under your account, and for complying with applicable laws and regulations.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-white">4. Service Level</h2>
          <p className="leading-relaxed">
            PERIONYX is provided on an enterprise SaaS basis with SLAs as defined in your subscription agreement. We strive for 99.9% uptime but do not guarantee uninterrupted service.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-white">5. Limitation of Liability</h2>
          <p className="leading-relaxed">
            PERIONYX&apos;s liability is limited as set forth in your subscription agreement. The platform is provided &ldquo;as is&rdquo; without warranties beyond those expressly stated.
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
