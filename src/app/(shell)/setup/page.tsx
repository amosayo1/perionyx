"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Globe, Shield, Building2, Database, UserCog, CheckCircle2, AlertTriangle,
  Settings, Server, Wrench, Sparkles,
} from "lucide-react";
import { EnterpriseWizard } from "@/components/enterprise/forms/enterprise-wizard";
import { EnterpriseForm } from "@/components/enterprise/forms/enterprise-form";
import { EnterpriseSection } from "@/components/enterprise/forms/enterprise-section";
import { EnterpriseField } from "@/components/enterprise/forms/enterprise-field";
import { AnimatedCard } from "@/components/enterprise/motion/animated-card";
import { staggerContainer, fadeInUp, scaleIn } from "@/components/enterprise/motion/tokens";
import type { PrerequisiteCheck } from "@/server/installer";
import type { WizardStep } from "@/components/enterprise/forms/types";

type FormData = {
  environment: string;
  dbConnectionString: string;
  dbHost: string;
  dbPort: string;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  redisHost: string;
  redisPort: string;
  adminEmail: string;
  adminPassword: string;
  adminConfirmPassword: string;
  adminFirstName: string;
  adminLastName: string;
  companyName: string;
  baseCurrency: string;
  fiscalYearStart: string;
  fiscalYearEnd: string;
  departments: string;
  businessUnits: string;
  chartOfAccountsTemplate: string;
  securityReview: boolean;
};

const INITIAL_DATA: FormData = {
  environment: "production",
  dbConnectionString: "",
  dbHost: "localhost",
  dbPort: "5432",
  dbName: "perionyx",
  dbUser: "perionyx",
  dbPassword: "",
  redisHost: "localhost",
  redisPort: "6379",
  adminEmail: "",
  adminPassword: "",
  adminConfirmPassword: "",
  adminFirstName: "",
  adminLastName: "",
  companyName: "",
  baseCurrency: "USD",
  fiscalYearStart: "1",
  fiscalYearEnd: "12",
  departments: "",
  businessUnits: "",
  chartOfAccountsTemplate: "standard",
  securityReview: false,
};

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "SGD", "HKD", "INR"];
const ACCOUNT_TEMPLATES = ["standard", "manufacturing", "retail", "financial-services", "non-profit"];

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<FormData>(INITIAL_DATA);
  const [installing, setInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState<{ step: string; status: string }[]>([]);
  const [installComplete, setInstallComplete] = useState(false);
  const [installResult, setInstallResult] = useState<{ success: boolean; message: string } | null>(null);
  const [prereqResults, setPrereqResults] = useState<PrerequisiteCheck[]>([]);
  const [prereqLoaded, setPrereqLoaded] = useState(false);

  const update = useCallback((partial: Partial<FormData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const [stepValidations, setStepValidations] = useState<Record<number, boolean>>({});

  const validateStep = useCallback((step: number): boolean => {
    const r = stepValidations[step] ?? false;
    return r;
  }, [stepValidations]);

  const setValid = useCallback((step: number, valid: boolean) => {
    setStepValidations((prev) => ({ ...prev, [step]: valid }));
  }, []);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (pw: string) => pw.length >= 12;

  const steps: WizardStep[] = useMemo(() => [
    { id: "welcome", title: "Welcome", icon: <Server className="h-4 w-4" />, validate: () => validateStep(0) },
    { id: "environment", title: "Environment Check", icon: <Shield className="h-4 w-4" />, validate: () => validateStep(1) },
    { id: "database", title: "Database", icon: <Database className="h-4 w-4" />, validate: () => validateStep(2) },
    { id: "administrator", title: "Administrator", icon: <UserCog className="h-4 w-4" />, validate: () => validateStep(3) },
    { id: "company", title: "Company", icon: <Building2 className="h-4 w-4" />, validate: () => validateStep(4) },
    { id: "finance", title: "Finance Setup", icon: <Globe className="h-4 w-4" />, validate: () => validateStep(5) },
    { id: "security", title: "Security Review", icon: <Shield className="h-4 w-4" />, validate: () => validateStep(6) },
    { id: "review", title: "Review", icon: <CheckCircle2 className="h-4 w-4" />, validate: () => true },
    { id: "install", title: "Install", icon: <Wrench className="h-4 w-4" />, validate: () => true },
    { id: "completion", title: "Completion", icon: <Sparkles className="h-4 w-4" />, validate: () => true },
  ], [validateStep]);

  const handleComplete = useCallback(async () => {
    setInstalling(true);
    setInstallProgress([]);

    const progressTrack = (step: string, status: string) => {
      setInstallProgress((prev) => [...prev, { step, status }]);
    };

    try {
      progressTrack("Starting installation", "running");

      const config = {
        mode: "fresh" as const,
        environment: data.environment as "development" | "testing" | "staging" | "production",
        version: process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0",
        companyName: data.companyName,
        adminEmail: data.adminEmail,
        adminPassword: data.adminPassword,
        baseCurrency: data.baseCurrency,
        fiscalYearStart: parseInt(data.fiscalYearStart, 10),
      };

      progressTrack("Validating configuration", "running");
      const checksRes = await apiCall("validate", config);
      const checks: PrerequisiteCheck[] = checksRes.checks;
      setPrereqResults(checks);
      const failed = checks.filter((c) => c.required && !c.passed);
      if (failed.length > 0) {
        setInstallResult({ success: false, message: `Prerequisites failed: ${failed.map((f) => f.name).join(", ")}` });
        setInstalling(false);
        setInstallComplete(true);
        return;
      }

      progressTrack("Running installation", "running");
      const result = await apiCall("install", config);

      if (result.status === "completed") {
        progressTrack("Installation complete", "completed");
        setInstallResult({ success: true, message: `Installation completed successfully in ${((result.duration ?? 0) / 1000).toFixed(1)}s` });
      } else {
        setInstallResult({ success: false, message: `Installation ${result.status}: ${result.errors.join("; ")}` });
      }
    } catch (err) {
      setInstallResult({ success: false, message: err instanceof Error ? err.message : "Installation failed" });
    } finally {
      setInstalling(false);
      setInstallComplete(true);
    }
  }, [data]);

  const apiCall = useCallback(async (action: string, config?: Record<string, unknown>) => {
    const res = await fetch("/api/installer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, config }),
    });
    return res.json();
  }, []);

  const loadPrerequisites = useCallback(async () => {
    if (prereqLoaded) return;
    try {
      const result = await apiCall("check-prerequisites");
      setPrereqResults(result.checks);
      setPrereqLoaded(true);
      setValid(1, result.passed);
    } catch {
      setPrereqResults([{ name: "Error", description: "", required: true, passed: false, message: "Failed to check prerequisites", severity: "error" }]);
      setPrereqLoaded(true);
      setValid(1, false);
    }
  }, [prereqLoaded, setValid, apiCall]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-6 text-center">
              <Server className="mx-auto h-12 w-12 text-[#d4af37] mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Perionyx Enterprise Installer</h3>
              <p className="text-sm text-zinc-400 max-w-md mx-auto">
                This wizard will guide you through a complete platform installation, including environment validation,
                database configuration, administrator setup, and company bootstrap.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AnimatedCard className="p-4 text-center" hoverEffect="scale">
                <Shield className="mx-auto h-6 w-6 text-[#d4af37] mb-2" />
                <p className="text-xs font-medium text-zinc-300">Validate Environment</p>
                <p className="text-[10px] text-zinc-600 mt-1">Check system prerequisites</p>
              </AnimatedCard>
              <AnimatedCard className="p-4 text-center" hoverEffect="scale">
                <Database className="mx-auto h-6 w-6 text-[#d4af37] mb-2" />
                <p className="text-xs font-medium text-zinc-300">Configure Database</p>
                <p className="text-[10px] text-zinc-600 mt-1">Set up the data layer</p>
              </AnimatedCard>
              <AnimatedCard className="p-4 text-center" hoverEffect="scale">
                <Building2 className="mx-auto h-6 w-6 text-[#d4af37] mb-2" />
                <p className="text-xs font-medium text-zinc-300">Bootstrap Company</p>
                <p className="text-[10px] text-zinc-600 mt-1">Create your organization</p>
              </AnimatedCard>
            </div>
            <style>{`
              div:has(> .installer-start) { display: flex; justify-content: center; margin-top: 1rem; }
            `}</style>
            <div className="installer-start">
              <p className="text-xs text-zinc-600">Select {"Next"} to begin</p>
            </div>
          </div>
        );

      case 1:
        return (
          <EnterpriseForm title="Environment Check" description="System prerequisites and runtime validation">
            <EnterpriseSection
              config={{ id: "prerequisites", title: "Prerequisite Checks", initiallyExpanded: true }}
            >
              {!prereqLoaded ? (
                <div className="flex items-center justify-center py-8">
                  <button
                    type="button"
                    onClick={loadPrerequisites}
                    className="rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20 px-4 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/20 transition-colors"
                  >
                    Run Prerequisite Checks
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {prereqResults.map((check) => (
                    <motion.div
                      key={check.name}
                      variants={scaleIn}
                      className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3"
                    >
                      {check.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-300">{check.name}</p>
                        <p className="text-[10px] text-zinc-500">{check.message}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </EnterpriseSection>

            <EnterpriseSection
              config={{ id: "environment", title: "Deployment Environment", initiallyExpanded: true }}
            >
              <EnterpriseField label="Environment Type" htmlFor="environment" required>
                <select
                  id="environment"
                  value={data.environment}
                  onChange={(e) => { update({ environment: e.target.value }); setValid(1, prereqLoaded && prereqResults.every((c) => c.required ? c.passed : true)); }}
                  className="w-full rounded-lg border border-white/[0.1] bg-zinc-900 px-3 py-2 text-sm text-white"
                >
                  <option value="development">Development</option>
                  <option value="testing">Testing</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </EnterpriseField>
            </EnterpriseSection>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setValid(1, prereqLoaded && prereqResults.every((c) => c.required ? c.passed : true))}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-xs text-zinc-400 hover:bg-zinc-700 transition-colors"
              >
                Re-check
              </button>
            </div>
          </EnterpriseForm>
        );

      case 2:
        return (
          <EnterpriseForm title="Database Configuration" description="Configure the database connection">
            <EnterpriseSection
              config={{ id: "db-settings", title: "Connection Settings", initiallyExpanded: true }}
            >
              <EnterpriseField label="Host" htmlFor="dbHost" required>
                <input
                  id="dbHost"
                  value={data.dbHost}
                  onChange={(e) => update({ dbHost: e.target.value })}
                  className="w-full rounded-lg border border-white/[0.1] bg-zinc-900 px-3 py-2 text-sm text-white font-mono"
                />
              </EnterpriseField>
              <div className="grid grid-cols-2 gap-4">
                <EnterpriseField label="Port" htmlFor="dbPort" required>
                  <input
                    id="dbPort"
                    value={data.dbPort}
                    onChange={(e) => { update({ dbPort: e.target.value }); setValid(2, true); }}
                    className="w-full rounded-lg border border-white/[0.1] bg-zinc-900 px-3 py-2 text-sm text-white font-mono"
                  />
                </EnterpriseField>
                <EnterpriseField label="Database Name" htmlFor="dbName" required>
                  <input
                    id="dbName"
                    value={data.dbName}
                    onChange={(e) => update({ dbName: e.target.value })}
                    className="w-full rounded-lg border border-white/[0.1] bg-zinc-900 px-3 py-2 text-sm text-white font-mono"
                  />
                </EnterpriseField>
              </div>
              <EnterpriseField label="Username" htmlFor="dbUser" required>
                <input
                  id="dbUser"
                  value={data.dbUser}
                  onChange={(e) => update({ dbUser: e.target.value })}
                  className="w-full rounded-lg border border-white/[0.1] bg-zinc-900 px-3 py-2 text-sm text-white font-mono"
                />
              </EnterpriseField>
              <EnterpriseField label="Password" htmlFor="dbPassword" required>
                <input
                  id="dbPassword"
                  type="password"
                  value={data.dbPassword}
                  onChange={(e) => update({ dbPassword: e.target.value })}
                  className="w-full rounded-lg border border-white/[0.1] bg-zinc-900 px-3 py-2 text-sm text-white font-mono"
                />
              </EnterpriseField>
            </EnterpriseSection>
          </EnterpriseForm>
        );

      case 3:
        return (
          <EnterpriseForm title="Administrator Account" description="Create the first admin user">
            <EnterpriseSection
              config={{ id: "admin-details", title: "Admin User", initiallyExpanded: true }}
            >
              <div className="grid grid-cols-2 gap-4">
                <EnterpriseField label="First Name" htmlFor="adminFirstName" required>
                  <input
                    id="adminFirstName"
                    value={data.adminFirstName}
                    onChange={(e) => update({ adminFirstName: e.target.value })}
                    className="w-full rounded-lg border border-white/[0.1] bg-zinc-900 px-3 py-2 text-sm text-white"
                  />
                </EnterpriseField>
                <EnterpriseField label="Last Name" htmlFor="adminLastName" required>
                  <input
                    id="adminLastName"
                    value={data.adminLastName}
                    onChange={(e) => update({ adminLastName: e.target.value })}
                    className="w-full rounded-lg border border-white/[0.1] bg-zinc-900 px-3 py-2 text-sm text-white"
                  />
                </EnterpriseField>
              </div>
              <EnterpriseField label="Email Address" htmlFor="adminEmail" required>
                <input
                  id="adminEmail"
                  type="email"
                  value={data.adminEmail}
                  onChange={(e) => {
                    update({ adminEmail: e.target.value });
                  }}
                  className="w-full rounded-lg border border-white/[0.1] bg-zinc-900 px-3 py-2 text-sm text-white font-mono"
                />
              </EnterpriseField>
              <EnterpriseField label="Password" htmlFor="adminPassword" required helpText="Minimum 12 characters">
                <input
                  id="adminPassword"
                  type="password"
                  value={data.adminPassword}
                  onChange={(e) => {
                    update({ adminPassword: e.target.value });
                    const valid = validateEmail(data.adminEmail) && e.target.value.length >= 12 && e.target.value === data.adminConfirmPassword && data.adminFirstName.length > 0 && data.adminLastName.length > 0;
                    setValid(3, valid);
                  }}
                  className="w-full rounded-lg border border-white/[0.1] bg-zinc-900 px-3 py-2 text-sm text-white font-mono"
                />
              </EnterpriseField>
              <EnterpriseField
                label="Confirm Password"
                htmlFor="adminConfirmPassword"
                required
                error={data.adminConfirmPassword && data.adminPassword !== data.adminConfirmPassword ? "Passwords do not match" : undefined}
              >
                <input
                  id="adminConfirmPassword"
                  type="password"
                  value={data.adminConfirmPassword}
                  onChange={(e) => {
                    update({ adminConfirmPassword: e.target.value });
                    const valid = validateEmail(data.adminEmail) && data.adminPassword.length >= 12 && data.adminPassword === e.target.value && data.adminFirstName.length > 0 && data.adminLastName.length > 0;
                    setValid(3, valid);
                  }}
                  className="w-full rounded-lg border border-white/[0.1] bg-zinc-900 px-3 py-2 text-sm text-white font-mono"
                />
              </EnterpriseField>
            </EnterpriseSection>
          </EnterpriseForm>
        );

      case 4:
        return (
          <EnterpriseForm title="Company Setup" description="Configure your organization">
            <EnterpriseSection
              config={{ id: "company-details", title: "Company Details", initiallyExpanded: true }}
            >
              <EnterpriseField label="Company Name" htmlFor="companyName" required>
                <input
                  id="companyName"
                  value={data.companyName}
                  onChange={(e) => {
                    update({ companyName: e.target.value });
                    setValid(4, e.target.value.length > 0);
                  }}
                  className="w-full rounded-lg border border-white/[0.1] bg-zinc-900 px-3 py-2 text-sm text-white"
                />
              </EnterpriseField>
              <div className="grid grid-cols-2 gap-4">
                <EnterpriseField label="Base Currency" htmlFor="baseCurrency" required>
                  <select
                    id="baseCurrency"
                    value={data.baseCurrency}
                    onChange={(e) => update({ baseCurrency: e.target.value })}
                    className="w-full rounded-lg border border-white/[0.1] bg-zinc-900 px-3 py-2 text-sm text-white"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </EnterpriseField>
                <EnterpriseField label="Fiscal Year Start (Month)" htmlFor="fiscalYearStart" required>
                  <select
                    id="fiscalYearStart"
                    value={data.fiscalYearStart}
                    onChange={(e) => {
                      const start = parseInt(e.target.value, 10);
                      const end = start === 1 ? 12 : start - 1;
                      update({ fiscalYearStart: e.target.value, fiscalYearEnd: String(end) });
                    }}
                    className="w-full rounded-lg border border-white/[0.1] bg-zinc-900 px-3 py-2 text-sm text-white"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>{new Date(0, m - 1).toLocaleString("en", { month: "long" })}</option>
                    ))}
                  </select>
                </EnterpriseField>
              </div>
              <EnterpriseField label="Fiscal Year End (Month)" htmlFor="fiscalYearEnd">
                <input
                  id="fiscalYearEnd"
                  value={data.fiscalYearEnd}
                  readOnly
                  className="w-full rounded-lg border border-white/[0.1] bg-zinc-800 px-3 py-2 text-sm text-zinc-500 font-mono"
                />
              </EnterpriseField>
            </EnterpriseSection>
          </EnterpriseForm>
        );

      case 5:
        return (
          <EnterpriseForm title="Finance Setup" description="Configure financial structure">
            <EnterpriseSection
              config={{ id: "chart-of-accounts", title: "Chart of Accounts", initiallyExpanded: true }}
            >
              <EnterpriseField label="Template" htmlFor="chartTemplate" required>
                <select
                  id="chartTemplate"
                  value={data.chartOfAccountsTemplate}
                  onChange={(e) => { update({ chartOfAccountsTemplate: e.target.value }); setValid(5, true); }}
                  className="w-full rounded-lg border border-white/[0.1] bg-zinc-900 px-3 py-2 text-sm text-white"
                >
                  {ACCOUNT_TEMPLATES.map((t) => (
                    <option key={t} value={t}>{t.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</option>
                  ))}
                </select>
              </EnterpriseField>
            </EnterpriseSection>
            <EnterpriseSection
              config={{ id: "departments", title: "Departments", description: "Comma-separated list of department names", initiallyExpanded: true }}
            >
              <EnterpriseField label="Departments" htmlFor="departments" hint="e.g. Finance, Engineering, Sales" hintType="example">
                <textarea
                  id="departments"
                  value={data.departments}
                  onChange={(e) => update({ departments: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-white/[0.1] bg-zinc-900 px-3 py-2 text-sm text-white"
                />
              </EnterpriseField>
              <EnterpriseField label="Business Units" htmlFor="businessUnits" hint="e.g. North America, EMEA, APAC" hintType="example">
                <textarea
                  id="businessUnits"
                  value={data.businessUnits}
                  onChange={(e) => update({ businessUnits: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-white/[0.1] bg-zinc-900 px-3 py-2 text-sm text-white"
                />
              </EnterpriseField>
            </EnterpriseSection>
          </EnterpriseForm>
        );

      case 6:
        return (
          <EnterpriseForm title="Security Review" description="Review security configuration">
            <EnterpriseSection
              config={{ id: "security-review", title: "Security Settings", initiallyExpanded: true }}
            >
              <EnterpriseField
                label="I have reviewed the security configuration"
                htmlFor="securityReview"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="securityReview"
                    type="checkbox"
                    checked={data.securityReview}
                    onChange={(e) => {
                      update({ securityReview: e.target.checked });
                      setValid(6, e.target.checked);
                    }}
                    className="rounded border-white/[0.1] bg-zinc-900"
                  />
                  <span className="text-xs text-zinc-400">
                    Confirm that all security settings meet enterprise requirements
                  </span>
                </label>
              </EnterpriseField>
              <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <p className="text-xs text-amber-400 font-medium mb-1">Security Checklist</p>
                <ul className="space-y-1 text-[11px] text-zinc-400">
                  <li className="flex items-center gap-2">
                    <Shield className="h-3 w-3 text-zinc-600" />
                    Admin password meets minimum length requirements
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-3 w-3 text-zinc-600" />
                    Database connection uses strong credentials
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-3 w-3 text-zinc-600" />
                    Environment is properly isolated
                  </li>
                </ul>
              </div>
            </EnterpriseSection>
          </EnterpriseForm>
        );

      case 7:
        return (
          <EnterpriseForm title="Review Configuration" description="Verify all settings before installation">
            <EnterpriseSection
              config={{ id: "review-summary", title: "Installation Summary", initiallyExpanded: true }}
            >
              <div className="space-y-3">
                {[
                  { label: "Environment", value: data.environment },
                  { label: "Database", value: `${data.dbHost}:${data.dbPort}/${data.dbName}` },
                  { label: "Administrator", value: data.adminEmail },
                  { label: "Company", value: data.companyName },
                  { label: "Currency", value: data.baseCurrency },
                  { label: "Fiscal Year", value: `${data.fiscalYearStart} → ${data.fiscalYearEnd}` },
                  { label: "COA Template", value: data.chartOfAccountsTemplate },
                  { label: "Departments", value: data.departments || "—" },
                  { label: "Security Reviewed", value: data.securityReview ? "Yes" : "No" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-lg bg-zinc-900/40 px-3 py-2">
                    <span className="text-xs text-zinc-500">{item.label}</span>
                    <span className="text-xs text-zinc-300 font-mono">{item.value}</span>
                  </div>
                ))}
              </div>
            </EnterpriseSection>
          </EnterpriseForm>
        );

      case 8:
        return (
          <div className="space-y-6">
            <EnterpriseForm title="Installing" description="Platform installation in progress">
              <EnterpriseSection
                config={{ id: "install-progress", title: "Installation Progress", initiallyExpanded: true }}
              >
                {installProgress.length === 0 && !installing && (
                  <p className="text-sm text-zinc-500">Click Complete to start installation</p>
                )}
                <div className="space-y-2">
                  {installProgress.map((p, i) => (
                    <motion.div
                      key={i}
                      variants={fadeInUp}
                      className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/40 px-3 py-2"
                    >
                      {p.status === "running" ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="h-4 w-4 rounded-full border-2 border-[#d4af37] border-t-transparent"
                        />
                      ) : p.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                      )}
                      <span className="text-xs text-zinc-300">{p.step}</span>
                    </motion.div>
                  ))}
                </div>
              </EnterpriseSection>
            </EnterpriseForm>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6 text-center">
            <motion.div
              variants={scaleIn}
              className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-8"
            >
              {installResult?.success ? (
                <>
                  <CheckCircle2 className="mx-auto h-16 w-16 text-green-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Installation Complete</h3>
                  <p className="text-sm text-zinc-400">{installResult.message}</p>
                </>
              ) : (
                <>
                  <AlertTriangle className="mx-auto h-16 w-16 text-amber-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Installation Incomplete</h3>
                  <p className="text-sm text-zinc-400">{installResult?.message ?? "Unknown result"}</p>
                </>
              )}
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <AnimatedCard className="p-4 text-center">
                <Building2 className="mx-auto h-5 w-5 text-[#d4af37] mb-2" />
                <p className="text-xs font-medium text-zinc-300">{data.companyName}</p>
                <p className="text-[10px] text-zinc-600">Company</p>
              </AnimatedCard>
              <AnimatedCard className="p-4 text-center">
                <UserCog className="mx-auto h-5 w-5 text-[#d4af37] mb-2" />
                <p className="text-xs font-medium text-zinc-300">{data.adminEmail}</p>
                <p className="text-[10px] text-zinc-600">Administrator</p>
              </AnimatedCard>
              <AnimatedCard className="p-4 text-center">
                <Globe className="mx-auto h-5 w-5 text-[#d4af37] mb-2" />
                <p className="text-xs font-medium text-zinc-300">{data.baseCurrency}</p>
                <p className="text-[10px] text-zinc-600">Base Currency</p>
              </AnimatedCard>
              <AnimatedCard className="p-4 text-center">
                <Database className="mx-auto h-5 w-5 text-[#d4af37] mb-2" />
                <p className="text-xs font-medium text-zinc-300">{data.environment}</p>
                <p className="text-[10px] text-zinc-600">Environment</p>
              </AnimatedCard>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-white">Platform Installer</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Complete the setup wizard to deploy the Perionyx Enterprise platform
            </p>
          </div>

          <EnterpriseWizard
            steps={steps}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            onComplete={handleComplete}
            completeLabel={installing ? "Installing..." : "Install"}
            saving={installing}
          >
            <div className="min-h-[300px]">
              {renderStepContent()}
            </div>
          </EnterpriseWizard>
        </motion.div>
      </div>
    </div>
  );
}
