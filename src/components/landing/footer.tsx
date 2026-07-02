"use client";

import Link from "next/link";

const sections = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "/product" },
      { label: "Treasury", href: "/product" },
      { label: "Payments", href: "/product" },
      { label: "Approvals & Policy", href: "/product" },
      { label: "Risk Intelligence", href: "/product" },
      { label: "Ledger & Audit", href: "/product" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Pricing", href: "/pricing" },
      { label: "Security", href: "/security" },
      { label: "Contact", href: "/request-demo" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "API Reference", href: "/api" },
      { label: "Interactive Demo", href: "/demo" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
  {
    title: "Compliance",
    links: [
      { label: "SOC 2", href: "/security" },
      { label: "Data Isolation", href: "/security" },
      { label: "Encryption", href: "/security" },
      { label: "RBAC", href: "/security" },
      { label: "Audit Trail", href: "/security" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.05] py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/30 flex items-center justify-center overflow-hidden">
                <img src="/logo.PNG" alt="Perionyx" className="h-full w-full object-cover" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">PERIONYX</span>
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-sm">
              The enterprise treasury operating system. One platform for treasury, payments, governance, audit, risk, and AI-driven financial intelligence.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20">
                SOC 2
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700">
                Enterprise
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700">
                API-first
              </span>
            </div>
          </div>
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.15em] mb-5">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[12px] text-zinc-600">
            &copy; {new Date().getFullYear()} PERIONYX. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            <span className="text-[12px] text-zinc-600">SOC 2 Type II compliant</span>
            <span className="text-[12px] text-zinc-600">Enterprise-grade security</span>
            <span className="text-[12px] text-zinc-600">99.97% uptime</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
