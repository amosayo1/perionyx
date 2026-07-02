"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const companySizes = [
  "51–200 employees",
  "201–1,000 employees",
  "1,001–5,000 employees",
  "5,001–10,000 employees",
  "10,000+ employees",
];

const roles = [
  "CFO",
  "Treasurer",
  "VP of Finance",
  "Controller",
  "Risk Officer",
  "CEO / Founder",
  "Engineer / Developer",
  "Other",
];

const countries = [
  "United States", "Canada", "United Kingdom", "Germany", "France",
  "Italy", "Spain", "Netherlands", "Switzerland", "Sweden",
  "Norway", "Denmark", "Finland", "Belgium", "Austria",
  "Ireland", "Portugal", "Luxembourg", "Australia", "New Zealand",
  "Singapore", "Japan", "South Korea", "China", "India",
  "United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait", "Israel",
  "Brazil", "Mexico", "Argentina", "Colombia", "Chile",
  "South Africa", "Nigeria", "Kenya", "Turkey", "Other",
];

const phonePattern = /^[+]?[\d\s()-]{7,20}$/;

interface FieldError {
  field: string;
  message: string;
}

export function RequestDemoForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [country, setCountry] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function getFieldError(field: string): string | undefined {
    return fieldErrors.find((e) => e.field === field)?.message;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors([]);
    setSubmitError(null);

    if (!name.trim()) {
      setFieldErrors([{ field: "name", message: "Full name is required." }]);
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setFieldErrors([{ field: "email", message: "A valid business email is required." }]);
      return;
    }
    if (phone.trim() && !phonePattern.test(phone.trim())) {
      setFieldErrors([{ field: "phone", message: "Enter a valid phone number." }]);
      return;
    }
    if (!company.trim()) {
      setFieldErrors([{ field: "company", message: "Company name is required." }]);
      return;
    }
    if (!role) {
      setFieldErrors([{ field: "role", message: "Please select your role." }]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/demo-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          company: company.trim(),
          role,
          companySize: companySize || undefined,
          country: country || undefined,
          message: message.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setSubmitError(body?.error?.message ?? "Submission failed. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/20 mb-8">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Request Received</h2>
        <p className="text-zinc-400 max-w-md mx-auto leading-relaxed mb-8">
          Thank you for your interest in PERIONYX. A specialist will follow up to schedule your demo.
        </p>

        <div className="max-w-sm mx-auto mb-8 space-y-3 text-left">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3 flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d4af37]/10 text-[10px] font-bold text-[#d4af37]">1</span>
            <div>
              <p className="text-xs font-medium text-white">Request reviewed</p>
              <p className="text-[11px] text-zinc-500">Our team reviews your requirements</p>
            </div>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3 flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-bold text-zinc-500">2</span>
            <div>
              <p className="text-xs font-medium text-white">Specialist assigned</p>
              <p className="text-[11px] text-zinc-500">A treasury specialist reaches out</p>
            </div>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3 flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-bold text-zinc-500">3</span>
            <div>
              <p className="text-xs font-medium text-white">Demo scheduled</p>
              <p className="text-[11px] text-zinc-500">Personalized walkthrough of PERIONYX</p>
            </div>
          </div>
        </div>

        <Link
          href="/demo"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl border border-white/[0.1] text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-all duration-200 mb-4"
        >
          Explore the interactive demo while you wait
        </Link>

        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-[#d4af37] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
            </svg>
            Return to home
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mb-10">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 text-[#d4af37]">
          Enterprise Demo
        </span>
        <h1 className="mt-6 text-3xl md:text-4xl font-bold tracking-tight text-white leading-[1.1]">
          Request a Demo
        </h1>
        <p className="mt-3 text-sm text-zinc-400 leading-relaxed max-w-lg">
          A specialist will walk you through PERIONYX and answer questions specific to your treasury, payments, and risk workflows.
        </p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-medium text-zinc-400">Full name <span className="text-[#d4af37]">*</span></label>
            <input
              id="name"
              required
              value={name}
              onChange={(e) => { setName(e.target.value); setFieldErrors([]); }}
              placeholder="Jane Smith"
              className={`w-full h-10 rounded-lg border px-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-all ${
                getFieldError("name")
                  ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                  : "border-white/[0.08] bg-white/[0.03] focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/20"
              }`}
            />
            {getFieldError("name") && <p className="text-[11px] text-red-400">{getFieldError("name")}</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-zinc-400">Business email <span className="text-[#d4af37]">*</span></label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors([]); }}
              placeholder="jane@company.com"
              className={`w-full h-10 rounded-lg border px-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-all ${
                getFieldError("email")
                  ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                  : "border-white/[0.08] bg-white/[0.03] focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/20"
              }`}
            />
            {getFieldError("email") && <p className="text-[11px] text-red-400">{getFieldError("email")}</p>}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-xs font-medium text-zinc-400">Phone <span className="text-zinc-600">(optional)</span></label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setFieldErrors([]); }}
              placeholder="+1 555 123 4567"
              className={`w-full h-10 rounded-lg border px-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-all ${
                getFieldError("phone")
                  ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                  : "border-white/[0.08] bg-white/[0.03] focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/20"
              }`}
            />
            {getFieldError("phone") && <p className="text-[11px] text-red-400">{getFieldError("phone")}</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="company" className="text-xs font-medium text-zinc-400">Company <span className="text-[#d4af37]">*</span></label>
            <input
              id="company"
              required
              value={company}
              onChange={(e) => { setCompany(e.target.value); setFieldErrors([]); }}
              placeholder="Acme Corp"
              className={`w-full h-10 rounded-lg border px-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-all ${
                getFieldError("company")
                  ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                  : "border-white/[0.08] bg-white/[0.03] focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/20"
              }`}
            />
            {getFieldError("company") && <p className="text-[11px] text-red-400">{getFieldError("company")}</p>}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="role" className="text-xs font-medium text-zinc-400">Role <span className="text-[#d4af37]">*</span></label>
            <select
              id="role"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={`w-full h-10 rounded-lg border px-3 text-sm text-white focus:outline-none transition-all appearance-none ${
                getFieldError("role")
                  ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                  : "border-white/[0.08] bg-white/[0.03] focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/20"
              } ${!role ? "text-zinc-600" : "text-white"}`}
            >
              <option value="" disabled className="bg-[#090909]">Select your role</option>
              {roles.map((r) => (
                <option key={r} value={r} className="bg-[#090909]">{r}</option>
              ))}
            </select>
            {getFieldError("role") && <p className="text-[11px] text-red-400">{getFieldError("role")}</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="companySize" className="text-xs font-medium text-zinc-400">Company size</label>
            <select
              id="companySize"
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              className={`w-full h-10 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm focus:outline-none focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/20 transition-all appearance-none ${!companySize ? "text-zinc-600" : "text-white"}`}
            >
              <option value="" disabled className="bg-[#090909]">Select company size</option>
              {companySizes.map((s) => (
                <option key={s} value={s} className="bg-[#090909]">{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="country" className="text-xs font-medium text-zinc-400">Country</label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={`w-full h-10 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm focus:outline-none focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/20 transition-all appearance-none ${!country ? "text-zinc-600" : "text-white"}`}
            >
              <option value="" disabled className="bg-[#090909]">Select country</option>
              {countries.map((c) => (
                <option key={c} value={c} className="bg-[#090909]">{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="message" className="text-xs font-medium text-zinc-400">
            Message <span className="text-zinc-600">(optional)</span>
          </label>
          <textarea
            id="message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us about your treasury operations or what you'd like to see in the demo."
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/20 transition-all resize-none"
          />
        </div>

        {submitError ? (
          <p role="alert" className="text-sm text-red-400">{submitError}</p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg bg-[#d4af37] text-sm font-semibold text-black hover:bg-[#c7a961] transition-all duration-200 shadow-lg shadow-[#d4af37]/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Request a Demo"}
        </button>

        <p className="text-[11px] text-zinc-600 text-center leading-relaxed">
          By submitting, you agree to our{" "}
          <Link href="/privacy" className="text-zinc-500 hover:text-zinc-300 underline underline-offset-2">Privacy Policy</Link>.
        </p>
      </form>
    </motion.div>
  );
}
