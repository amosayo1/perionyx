"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navigation } from "@/components/landing/navigation";
import { Footer } from "@/components/landing/footer";

const tiers = [
  {
    name: "Starter",
    price: "$0",
    period: "/month",
    desc: "For small teams exploring PERIONYX.",
    features: [
      "Up to 50 transactions/month",
      "5 team members",
      "Basic policy engine",
      "Single approval chain",
      "Standard audit trail",
      "Email support",
    ],
    cta: "Get Started",
    ctaHref: "/sign-up",
    featured: false,
  },
  {
    name: "Growth",
    price: "$2,500",
    period: "/month",
    desc: "For growing companies with active treasury operations.",
    features: [
      "Up to 1,000 transactions/month",
      "25 team members",
      "Full policy engine",
      "Multi-level approval chains",
      "Double-entry ledger",
      "Bank integrations",
      "Webhook access",
      "Priority support",
    ],
    cta: "Start Free Trial",
    ctaHref: "/sign-up",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For large organizations with complex requirements.",
    features: [
      "Unlimited transactions",
      "Unlimited team members",
      "Custom policy rules",
      "Custom approval workflows",
      "Dedicated infrastructure",
      "SSO/SAML + MFA",
      "SOC 2 reports",
      "SLA guarantee",
      "Dedicated support engineer",
      "On-premise deployment option",
    ],
    cta: "Contact Sales",
    ctaHref: "/sign-up",
    featured: false,
  },
];

const faqs = [
  { q: "Is there a free trial?", a: "Yes. All plans include a 14-day free trial with full access to all features. No credit card required." },
  { q: "Can I upgrade my plan later?", a: "You can upgrade, downgrade, or cancel at any time. Changes take effect at the start of the next billing cycle." },
  { q: "What payment methods do you support?", a: "We support all major credit cards, ACH transfers, and wire transfers for annual plans." },
  { q: "Do you offer annual pricing?", a: "Yes. Annual plans receive a 20% discount compared to monthly billing." },
  { q: "Is my data secure?", a: "All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We are SOC 2 compliant with annual third-party audits." },
  { q: "Can I get a dedicated instance?", a: "Enterprise customers can request dedicated infrastructure with isolated databases and custom SLAs." },
  { q: "What happens if I exceed my transaction limit?", a: "We will notify you before you reach your limit. Overage fees apply at a per-transaction rate." },
  { q: "Do you offer support for custom integrations?", a: "Enterprise plans include a dedicated support engineer who can assist with custom integrations and migration." },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#090909]">
      <Navigation />

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#d4af37]/3 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-6xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 text-[#d4af37] mb-6">
              Pricing
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.05] mb-6"
          >
            Transparent Pricing for
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#c7a961]">
              Enterprise Financial Operations
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-2xl text-base text-zinc-400 leading-relaxed mb-10"
          >
            Start for free. Scale as you grow. Enterprise plans include dedicated infrastructure, SLAs, and support.
          </motion.p>
        </div>
      </section>

      {/* Tiers */}
      <section className="pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`rounded-xl border p-6 flex flex-col ${
                  tier.featured
                    ? "border-[#d4af37]/30 bg-[#d4af37]/5 shadow-lg shadow-[#d4af37]/10"
                    : "border-white/[0.06] bg-zinc-900/50"
                }`}
              >
                {tier.featured && (
                  <div className="inline-flex self-start px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                <div className="mt-2 mb-1">
                  <span className="text-3xl font-bold text-white">{tier.price}</span>
                  <span className="text-sm text-zinc-500">{tier.period}</span>
                </div>
                <p className="text-xs text-zinc-500 mb-6">{tier.desc}</p>
                <div className="space-y-2.5 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#d4af37] shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-xs text-zinc-400">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href={tier.ctaHref}
                  className={`w-full text-center px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    tier.featured
                      ? "bg-[#d4af37] text-black hover:bg-[#c7a961] shadow-lg shadow-[#d4af37]/20"
                      : "border border-white/[0.08] text-zinc-300 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {tier.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="mx-auto max-w-4xl px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.04 }}
                className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5"
              >
                <h3 className="text-sm font-semibold text-white mb-1.5">{faq.q}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 border-t border-white/[0.04]">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-6">
              Still have questions?
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-lg mx-auto mb-10">
              Talk to our sales team about your specific requirements. We build custom plans for every customer.
            </p>
            <Link href="/sign-up" className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold rounded-xl bg-[#d4af37] text-black hover:bg-[#c7a961] transition-colors shadow-lg shadow-[#d4af37]/20">
              Contact Sales
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
