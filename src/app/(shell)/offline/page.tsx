import type { Metadata } from "next";
import { OfflineButton } from "./offline-button";

export const metadata: Metadata = {
  title: "Offline | PERIONYX",
};

export default function OfflinePage() {
  return (
    <div className="min-h-[80dvh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-perionyx-bg-tertiary mx-auto flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-perionyx-text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-3.536 0a9 9 0 012.359-5.889m0 0L3 3m4.008 4.008l2.121 2.121"
            />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-perionyx-text-primary mb-2">
          You&apos;re offline
        </h1>
        <p className="text-sm text-perionyx-text-secondary leading-relaxed">
          PERIONYX needs a network connection to load your treasury data.
          Cached pages are still available — try navigating to your recently
          viewed sections.
        </p>

        <OfflineButton />
      </div>
    </div>
  );
}
