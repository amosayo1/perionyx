"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useA11y } from "../AccessibilityProvider";
import {
  Eye, EyeOff, MousePointer2, Type, Sun, Moon,
  Maximize, Minimize, Palette, GripHorizontal, RotateCcw,
  X,
} from "lucide-react";

export function AccessibilityPreferences({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    state,
    setHighContrast,
    setReducedMotion,
    setFontScaling,
    setKeyboardNavMode,
    setFocusVisibility,
    setScreenReaderOptimized,
    setColorBlindMode,
    setReadingDensity,
    reset,
  } = useA11y();

  const toggle = useCallback(
    (setter: (v: boolean) => void, current: boolean) => () => setter(!current),
    [],
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-label="Accessibility preferences"
            aria-modal="true"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="fixed right-0 top-0 z-[80] flex h-full w-full max-w-sm flex-col border-l border-white/[0.06] bg-zinc-950 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <h2 className="text-sm font-semibold text-white">Accessibility</h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-5">
                <PreferenceSection icon={<Eye className="h-4 w-4" />} title="Visual">
                  <ToggleRow
                    label="High Contrast Mode"
                    description="Increase contrast for better readability"
                    enabled={state.highContrast}
                    onChange={toggle(setHighContrast, state.highContrast)}
                    icon={state.highContrast ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  />
                  <ToggleRow
                    label="Focus Visibility"
                    description="Show focus indicators"
                    enabled={state.focusVisibility === "always"}
                    onChange={() => setFocusVisibility(state.focusVisibility === "always" ? "keyboardOnly" : "always")}
                  />
                  <SelectRow
                    label="Color Blind Mode"
                    value={state.colorBlindMode}
                    options={[
                      { value: "none", label: "None" },
                      { value: "protanopia", label: "Protanopia (red-blind)" },
                      { value: "deuteranopia", label: "Deuteranopia (green-blind)" },
                      { value: "tritanopia", label: "Tritanopia (blue-blind)" },
                    ]}
                    onChange={(v) => setColorBlindMode(v as any)}
                  />
                  <SelectRow
                    label="Reading Density"
                    value={state.readingDensity}
                    options={[
                      { value: "comfortable", label: "Comfortable" },
                      { value: "compact", label: "Compact" },
                    ]}
                    onChange={(v) => setReadingDensity(v as any)}
                  />
                </PreferenceSection>

                <PreferenceSection icon={<Type className="h-4 w-4" />} title="Text">
                  <div className="flex items-center justify-between rounded-lg bg-zinc-900/60 px-3 py-2.5">
                    <div>
                      <span className="text-xs text-zinc-300">Font Size</span>
                      <p className="text-[10px] text-zinc-600">{state.fontScaling}%</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setFontScaling(state.fontScaling - 10)}
                        disabled={state.fontScaling <= 75}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 disabled:opacity-30 active:bg-zinc-700"
                        aria-label="Decrease font size"
                      >
                        <Minimize className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setFontScaling(state.fontScaling + 10)}
                        disabled={state.fontScaling >= 200}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 disabled:opacity-30 active:bg-zinc-700"
                        aria-label="Increase font size"
                      >
                        <Maximize className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </PreferenceSection>

                <PreferenceSection icon={<MousePointer2 className="h-4 w-4" />} title="Interaction">
                  <ToggleRow
                    label="Keyboard Navigation Mode"
                    description="Optimize for keyboard-only navigation"
                    enabled={state.keyboardNavMode}
                    onChange={toggle(setKeyboardNavMode, state.keyboardNavMode)}
                  />
                  <ToggleRow
                    label="Screen Reader Optimized"
                    description="Enhanced ARIA labels and announcements"
                    enabled={state.screenReaderOptimized}
                    onChange={toggle(setScreenReaderOptimized, state.screenReaderOptimized)}
                  />
                </PreferenceSection>

                <PreferenceSection icon={<EyeOff className="h-4 w-4" />} title="Motion">
                  <ToggleRow
                    label="Reduced Motion"
                    description="Disable animations and transitions"
                    enabled={state.reducedMotion}
                    onChange={toggle(setReducedMotion, state.reducedMotion)}
                    icon={<Minimize className="h-4 w-4" />}
                  />
                </PreferenceSection>
              </div>
            </div>

            <div className="border-t border-white/[0.06] px-5 py-4">
              <button
                onClick={reset}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800/50 active:bg-zinc-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset to defaults
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function PreferenceSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-zinc-500">{icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{title}</span>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  enabled,
  onChange,
  icon,
}: {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onChange}
      className="flex w-full items-center gap-3 rounded-lg bg-zinc-900/60 px-3 py-2.5 text-left transition-colors hover:bg-zinc-900/80 active:bg-zinc-800"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
    >
      {icon && <span className="text-zinc-500">{icon}</span>}
      <div className="flex-1">
        <span className="text-xs text-zinc-300">{label}</span>
        {description && <p className="text-[10px] text-zinc-600">{description}</p>}
      </div>
      <span
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors",
          enabled ? "bg-[#d4af37]" : "bg-zinc-700",
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
            enabled ? "translate-x-4" : "translate-x-0",
          )}
        />
      </span>
    </button>
  );
}

function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-zinc-900/60 px-3 py-2.5">
      <span className="text-xs text-zinc-300">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg bg-zinc-800 px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
        aria-label={label}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
