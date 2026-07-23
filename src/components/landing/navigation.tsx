"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DropdownItem {
  label: string;
  href: string;
}

const productItems: DropdownItem[] = [
  { label: "Treasury Management", href: "/product" },
  { label: "Payments & Wallets", href: "/product" },
  { label: "Approvals & Policy", href: "/product" },
  { label: "Risk Intelligence", href: "/product" },
  { label: "Ledger & Audit", href: "/product" },
  { label: "Reporting & AI", href: "/product" },
  { label: "Enterprise Intelligence", href: "/enterprise-intelligence" },
];

const solutionsItems: DropdownItem[] = [
  { label: "For CFOs", href: "/solutions" },
  { label: "For Treasurers", href: "/solutions" },
  { label: "For Risk Officers", href: "/solutions" },
  { label: "For Developers", href: "/api" },
];

const resourcesItems: DropdownItem[] = [
  { label: "Documentation", href: "/docs" },
  { label: "API Reference", href: "/api" },
  { label: "Security Overview", href: "/security" },
];

const companyItems: DropdownItem[] = [
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
];

function NavDropdown({ label, items }: { label: string; items: DropdownItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200"
      >
        {label}
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-48 rounded-xl border border-white/[0.06] bg-neutral-950/95 backdrop-blur-xl p-2 shadow-xl shadow-black/40">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors duration-150"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Navigation() {
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between h-16 mt-3 rounded-xl border border-white/[0.06] bg-black/70 backdrop-blur-xl px-6 shadow-lg shadow-black/30">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/30 flex items-center justify-center overflow-hidden">
              <img src="/logo.svg" alt="Perionyx" className="h-full w-full object-cover" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">PERIONYX</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <NavDropdown label="Product" items={productItems} />
            <NavDropdown label="Solutions" items={solutionsItems} />
            <Link
              href="/security"
              className={`text-sm font-medium transition-colors duration-200 ${
                pathname === "/security" ? "text-[#d4af37]" : "text-zinc-400 hover:text-white"
              }`}
            >
              Security
            </Link>
            <Link
              href="/api"
              className={`text-sm font-medium transition-colors duration-200 ${
                pathname === "/api" ? "text-[#d4af37]" : "text-zinc-400 hover:text-white"
              }`}
            >
              Developers
            </Link>
            <NavDropdown label="Resources" items={resourcesItems} />
            <NavDropdown label="Company" items={companyItems} />
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="hidden md:inline-flex text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200"
            >
              Sign in
            </Link>
            <Link
              href="/request-demo"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold rounded-lg bg-[#d4af37] text-black hover:bg-[#c7a961] transition-colors duration-200 shadow-lg shadow-[#d4af37]/10 shrink-0"
            >
              Request a Demo
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
