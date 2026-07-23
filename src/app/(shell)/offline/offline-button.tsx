"use client";

export function OfflineButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="mt-8 h-10 px-6 rounded-lg bg-perionyx-accent text-perionyx-bg-primary text-sm font-medium hover:bg-perionyx-accent/90 transition-colors"
    >
      Try again
    </button>
  );
}
