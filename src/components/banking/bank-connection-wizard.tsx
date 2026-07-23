"use client";

import { cn } from "@/lib/utils";
import { memo, useState, useCallback } from "react";
import { Globe, MapPin, Building2, Landmark, Lock, Wallet, RefreshCw, DollarSign, CheckCircle, ChevronLeft } from "lucide-react";
import { RegionSelector } from "./region-selector";
import { CountrySelector } from "./country-selector";
import { ProviderSelector } from "./provider-selector";
import { InstitutionSelector } from "./institution-selector";
import { AuthenticationFlow } from "./authentication-flow";
import { AccountSelector } from "./account-selector";
import { LegalEntitySelector } from "./legal-entity-selector";
import { CurrencyMapping } from "./currency-mapping";
import { SyncConfiguration } from "./sync-configuration";
import { ConnectionSummary } from "./connection-summary";
import { ConnectionComplete } from "./connection-complete";
import type { Region, Country, BankProvider, BankInstitution, DiscoveredAccount, CurrencyMappingItem, SyncConfig } from "./types";
import { DEFAULT_SYNC_CONFIG } from "./types";

interface BankConnectionWizardProps {
  onComplete?: () => void;
  className?: string;
}

const STEPS = [
  { id: 1, name: "Region", icon: Globe },
  { id: 2, name: "Country", icon: MapPin },
  { id: 3, name: "Provider", icon: Building2 },
  { id: 4, name: "Institution", icon: Landmark },
  { id: 5, name: "Authenticate", icon: Lock },
  { id: 6, name: "Accounts", icon: Wallet },
  { id: 7, name: "Entities", icon: Building2 },
  { id: 8, name: "Currencies", icon: DollarSign },
  { id: 9, name: "Sync", icon: RefreshCw },
  { id: 10, name: "Review", icon: CheckCircle },
] as const;

export const BankConnectionWizard = memo(function BankConnectionWizard({
  onComplete,
  className,
}: BankConnectionWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [region, setRegion] = useState<Region | null>(null);
  const [country, setCountry] = useState<Country | null>(null);
  const [provider, setProvider] = useState<BankProvider | null>(null);
  const [institution, setInstitution] = useState<BankInstitution | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [accounts, setAccounts] = useState<DiscoveredAccount[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<DiscoveredAccount[]>([]);
  const [entityMappings, setEntityMappings] = useState<Record<string, string>>({});
  const [currencyMappings, setCurrencyMappings] = useState<CurrencyMappingItem[]>([]);
  const [syncConfig, setSyncConfig] = useState<SyncConfig>(DEFAULT_SYNC_CONFIG);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1: return region !== null;
      case 2: return country !== null;
      case 3: return provider !== null;
      case 4: return institution !== null;
      case 5: return authenticated;
      case 6: return selectedAccounts.length > 0;
      case 7: return entityMappings[selectedAccounts[0]?.id] !== undefined;
      case 8: return currencyMappings.every((cm) => cm.mapped);
      case 9: return true;
      case 10: return true;
      default: return false;
    }
  }, [currentStep, region, country, provider, institution, authenticated, selectedAccounts, entityMappings, currencyMappings]);

  const handleNext = useCallback(() => {
    if (currentStep < 10) setCurrentStep(currentStep + 1);
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  }, [currentStep]);

  const handleRegionSelect = useCallback((r: Region) => {
    setRegion(r);
    setCountry(null);
    setProvider(null);
    setInstitution(null);
    setAuthenticated(false);
    setAccounts([]);
    setSelectedAccounts([]);
    setCurrentStep(2);
  }, []);

  const handleCountrySelect = useCallback((c: Country) => {
    setCountry(c);
    setProvider(null);
    setInstitution(null);
    setAuthenticated(false);
    setAccounts([]);
    setSelectedAccounts([]);
    setCurrentStep(3);
  }, []);

  const handleProviderSelect = useCallback((p: BankProvider) => {
    setProvider(p);
    setInstitution(null);
    setCurrentStep(4);
  }, []);

  const handleInstitutionSelect = useCallback((i: BankInstitution) => {
    setInstitution(i);
    setCurrentStep(5);
  }, []);

  const handleAuthComplete = useCallback(() => {
    setAuthenticated(true);
    setCurrentStep(6);
  }, []);

  const handleAccountToggle = useCallback((account: DiscoveredAccount) => {
    setSelectedAccounts((prev) => {
      const exists = prev.find((a) => a.id === account.id);
      if (exists) return prev.filter((a) => a.id !== account.id);
      return [...prev, { ...account, selected: true }];
    });
  }, []);

  const handleAccountComplete = useCallback(() => {
    setAccounts(selectedAccounts);
    const mappings: CurrencyMappingItem[] = selectedAccounts.map((a) => ({
      accountId: a.id,
      accountName: a.name,
      currency: a.currency,
      mapped: true,
    }));
    setCurrencyMappings(mappings);
    setCurrentStep(7);
  }, [selectedAccounts]);

  const handleEntityAssign = useCallback((accountId: string, entityId: string) => {
    setEntityMappings((prev) => ({ ...prev, [accountId]: entityId }));
  }, []);

  const handleEntityContinue = useCallback(() => {
    setCurrentStep(8);
  }, []);

  const handleCurrencyChange = useCallback((accountId: string, currency: string) => {
    setCurrencyMappings((prev) =>
      prev.map((cm) =>
        cm.accountId === accountId ? { ...cm, currency, mapped: true } : cm,
      ),
    );
  }, []);

  const handleCurrencyContinue = useCallback(() => {
    setCurrentStep(9);
  }, []);

  const handleSyncChange = useCallback((config: SyncConfig) => {
    setSyncConfig(config);
  }, []);

  const handleSyncContinue = useCallback(() => {
    setCurrentStep(10);
  }, []);

  const handleConfirm = useCallback(() => {
    setCurrentStep(11);
  }, []);

  const handleFinish = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  const handleCompleteFinish = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  const totalSteps = 11;

  return (
    <div className={cn("mx-auto max-w-3xl", className)} role="application" aria-label="Bank connection wizard">
      {currentStep <= 10 && (
        <>
          <nav className="mb-6" aria-label="Setup steps">
            <ol className="flex items-center gap-1">
              {STEPS.map((step, idx) => {
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;
                const Icon = step.icon;
                return (
                  <li key={step.id} className="flex items-center gap-1">
                    <div
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors",
                        isCurrent && "bg-gold/[0.1] text-gold",
                        isCompleted && "text-emerald-400",
                        !isCurrent && !isCompleted && "text-white/[0.3]",
                      )}
                      aria-current={isCurrent ? "step" : undefined}
                    >
                      <Icon className="h-3 w-3" aria-hidden="true" />
                      <span className="hidden sm:inline">{step.name}</span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={cn(
                        "h-px w-3",
                        currentStep > step.id ? "bg-emerald-500/40" : "bg-white/[0.06]",
                      )} aria-hidden="true" />
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="min-h-[400px]">
            {currentStep === 1 && (
              <RegionSelector selected={region} onSelect={handleRegionSelect} />
            )}
            {currentStep === 2 && region && (
              <CountrySelector region={region} selected={country} onSelect={handleCountrySelect} />
            )}
            {currentStep === 3 && country && (
              <ProviderSelector country={country} selected={provider} onSelect={handleProviderSelect} />
            )}
            {currentStep === 4 && country && provider && (
              <InstitutionSelector country={country} provider={provider} selected={institution} onSelect={handleInstitutionSelect} />
            )}
            {currentStep === 5 && provider && institution && (
              <AuthenticationFlow provider={provider} institution={institution} onComplete={handleAuthComplete} />
            )}
            {currentStep === 6 && (
              <AccountSelector
                selected={selectedAccounts}
                onToggle={handleAccountToggle}
                onComplete={handleAccountComplete}
              />
            )}
            {currentStep === 7 && selectedAccounts.length > 0 && (
              <LegalEntitySelector
                account={selectedAccounts[0]}
                selected={entityMappings}
                onAssign={handleEntityAssign}
                onContinue={handleEntityContinue}
              />
            )}
            {currentStep === 8 && (
              <CurrencyMapping
                items={currencyMappings}
                onChange={handleCurrencyChange}
                onContinue={handleCurrencyContinue}
              />
            )}
            {currentStep === 9 && (
              <SyncConfiguration
                config={syncConfig}
                onChange={handleSyncChange}
                onContinue={handleSyncContinue}
              />
            )}
            {currentStep === 10 && (
              <ConnectionSummary
                state={{
                  step: currentStep,
                  region,
                  country,
                  provider,
                  institution,
                  verified: authenticated,
                  accounts: selectedAccounts,
                  legalEntityMappings: entityMappings,
                  currencyMappings,
                  syncConfig,
                }}
                accounts={selectedAccounts}
                onConfirm={handleConfirm}
                onBack={handleBack}
              />
            )}
          </div>

          {currentStep > 1 && currentStep < 10 && (
            <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-sm text-white/[0.5] transition-colors hover:text-white/[0.7]"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </button>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/[0.3]">
                  Step {currentStep} of {totalSteps - 1}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                    canProceed()
                      ? "bg-gold text-black hover:opacity-90"
                      : "bg-white/[0.06] text-white/[0.3] cursor-not-allowed",
                  )}
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {currentStep === 11 && provider && institution && (
        <ConnectionComplete
          provider={provider}
          institution={institution}
          syncConfig={syncConfig}
          onFinish={handleCompleteFinish}
        />
      )}
    </div>
  );
});
