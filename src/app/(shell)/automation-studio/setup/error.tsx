"use client";

export default function OnboardingSetupError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
        <span className="text-2xl text-red-400">!</span>
      </div>
      <h2 className="mt-6 text-lg font-semibold text-white">Setup wizard error</h2>
      <p className="mt-2 text-sm text-zinc-400">
        {error.message || "Something went wrong loading the setup wizard. Please try again."}
      </p>
      <button
        onClick={reset}
        className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-[#d4af37] px-5 text-sm font-semibold text-black shadow-lg shadow-[#d4af37]/20 hover:bg-[#c7a961]"
      >
        Try again
      </button>
    </div>
  );
}
