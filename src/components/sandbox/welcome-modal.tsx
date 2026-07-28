"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Users, Globe, DollarSign, Sparkles, Play, Compass, BookOpen } from "lucide-react";
import { useOnboarding } from "./onboarding-context";

export function WelcomeModal() {
  const { welcomeDismissed, dismissWelcome, startTour } = useOnboarding();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!welcomeDismissed) {
      const t = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(t);
    }
  }, [welcomeDismissed]);

  return (
    <AnimatePresence>
      {visible && !welcomeDismissed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-2xl p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl rounded-2xl border border-gold/15 bg-zinc-900/95 p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

            <div className="flex items-center gap-3 mb-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 border border-gold/20">
                <Sparkles className="h-6 w-6 text-gold" />
              </span>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Welcome to Perionyx</h1>
                <p className="text-sm text-zinc-400 mt-0.5">Interactive Sandbox Experience</p>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed mb-8">
              Explore how modern enterprises manage treasury, payments, governance, risk, compliance and financial operations from a single platform.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <Building2 className="h-4 w-4 text-gold mb-2" />
                <p className="text-xs text-zinc-400">Company</p>
                <p className="text-sm font-semibold text-white">Atlas Manufacturing</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <Users className="h-4 w-4 text-gold mb-2" />
                <p className="text-xs text-zinc-400">Employees</p>
                <p className="text-sm font-semibold text-white">3,248</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <Globe className="h-4 w-4 text-gold mb-2" />
                <p className="text-xs text-zinc-400">Countries</p>
                <p className="text-sm font-semibold text-white">18</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <DollarSign className="h-4 w-4 text-gold mb-2" />
                <p className="text-xs text-zinc-400">Treasury Volume</p>
                <p className="text-sm font-semibold text-white">$185M/mo</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => { startTour(); dismissWelcome(); }}
                className="group flex w-full items-center gap-3 rounded-xl bg-gold px-5 py-3.5 text-sm font-bold text-black transition-all hover:bg-gold/90"
              >
                <Play className="h-4 w-4" />
                Start Guided Experience
                <span className="ml-auto text-xs font-normal text-black/60">~15 min</span>
              </button>

              <button
                onClick={dismissWelcome}
                className="flex w-full items-center gap-3 rounded-xl border border-white/[0.08] px-5 py-3 text-sm font-medium text-zinc-300 transition-all hover:bg-white/[0.04] hover:text-white"
              >
                <Compass className="h-4 w-4" />
                Explore Freely
              </button>

              <button
                onClick={() => { dismissWelcome(); }}
                className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] px-5 py-3 text-sm font-medium text-zinc-400 transition-all hover:bg-white/[0.03] hover:text-zinc-200"
              >
                <BookOpen className="h-4 w-4" />
                Choose a Business Scenario
              </button>
            </div>

            <p className="text-[10px] text-zinc-600 text-center mt-6">
              ⚡ Sandbox Mode — All data is simulated. No external financial systems are contacted.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
