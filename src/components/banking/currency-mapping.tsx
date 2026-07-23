"use client";

import { cn } from "@/lib/utils";
import { memo } from "react";
import { DollarSign, Check } from "lucide-react";
import type { CurrencyMappingItem } from "./types";

const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", flag: "🇸🇦" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr", flag: "🇨🇭" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", flag: "🇭🇰" },
  { code: "KRW", name: "South Korean Won", symbol: "₩", flag: "🇰🇷" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", flag: "🇸🇪" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", flag: "🇳🇴" },
  { code: "DKK", name: "Danish Krone", symbol: "kr", flag: "🇩🇰" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł", flag: "🇵🇱" },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦" },
];

interface CurrencyMappingProps {
  items: CurrencyMappingItem[];
  onChange: (accountId: string, currency: string) => void;
  onContinue: () => void;
  className?: string;
}

export const CurrencyMapping = memo(function CurrencyMapping({
  items,
  onChange,
  onContinue,
  className,
}: CurrencyMappingProps) {
  const allMapped = items.every((i) => i.currency && i.mapped);

  return (
    <div className={cn("space-y-4", className)} role="group" aria-label="Currency mapping">
      <div className="flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-gold" aria-hidden="true" />
        <h2 className="text-lg font-medium text-white/[0.87]">Currency Mapping</h2>
      </div>
      <p className="text-sm text-white/[0.5]">Confirm or update the default currency for each account.</p>

      <div className="space-y-3">
        {items.map((item) => {
          const currencyInfo = CURRENCIES.find((c) => c.code === item.currency);
          return (
            <div
              key={item.accountId}
              className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/[0.04] text-xs text-white/[0.5]">
                {item.accountName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white/[0.87]">{item.accountName}</p>
              </div>
              <select
                value={item.currency}
                onChange={(e) => onChange(item.accountId, e.target.value)}
                className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-sm text-white/[0.87] focus:border-gold/50 focus:outline-none"
                aria-label={`Currency for ${item.accountName}`}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-[#0A0A0A]">
                    {c.flag} {c.code} — {c.symbol}
                  </option>
                ))}
              </select>
              {item.mapped && <Check className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden="true" />}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end border-t border-white/[0.06] pt-4">
        <button
          type="button"
          onClick={onContinue}
          disabled={!allMapped}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all",
            allMapped
              ? "bg-gold text-black hover:opacity-90"
              : "bg-white/[0.06] text-white/[0.3] cursor-not-allowed",
          )}
        >
          Continue
        </button>
      </div>
    </div>
  );
});
