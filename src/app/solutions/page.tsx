import Link from "next/link";

export const metadata = {
  title: "Solutions | PERIONYX",
  description: "PERIONYX solutions for CFOs, treasurers, risk officers, and developers.",
};

const solutions = [
  {
    title: "For CFOs",
    description: "Real-time visibility into cash position, automated reconciliations, policy-driven expense control, and comprehensive financial reporting across all entities and currencies.",
    href: "/product",
  },
  {
    title: "For Treasurers",
    description: "Multi-currency treasury management, bank connectivity, payment execution, cash forecasting, and liquidity management from a single operating platform.",
    href: "/product",
  },
  {
    title: "For Risk Officers",
    description: "Continuous risk monitoring, anomaly detection, policy enforcement, compliance tracking, audit trails, and AI-powered risk intelligence across all financial operations.",
    href: "/product",
  },
  {
    title: "For Developers",
    description: "API-first architecture with comprehensive REST APIs, webhooks, idempotent endpoints, and SDKs for seamless integration into your existing financial stack.",
    href: "/api",
  },
];

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-[#090909]">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 text-[#d4af37]">
            Solutions
          </span>
          <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1]">
            Built for Enterprise
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#d4af37]">
              Finance Teams
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-zinc-400 leading-relaxed">
            PERIONYX adapts to your role. Whether you oversee treasury, manage risk, lead finance, or build on our platform, you get the tools and data you need.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {solutions.map((sol) => (
            <Link
              key={sol.title}
              href={sol.href}
              className="group rounded-xl border border-white/[0.06] bg-black/40 p-8 hover:border-[#d4af37]/20 hover:bg-[#d4af37]/[0.02] transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-white group-hover:text-[#d4af37] transition-colors mb-3">
                {sol.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {sol.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/request-demo"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold rounded-xl bg-[#d4af37] text-black hover:bg-[#c7a961] transition-all duration-200 shadow-lg shadow-[#d4af37]/20"
          >
            Request a Demo
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
