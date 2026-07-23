"use client";

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="min-h-screen bg-perionyx-bg-primary md:hidden">
        {children}
      </div>
      <div className="hidden md:flex md:h-screen md:items-center md:justify-center md:bg-perionyx-bg-primary">
        <div className="text-center">
          <p className="text-sm text-zinc-500">This view is optimized for mobile devices.</p>
          <p className="text-xs text-zinc-600">Resize to mobile width or use a phone.</p>
        </div>
      </div>
    </>
  );
}
