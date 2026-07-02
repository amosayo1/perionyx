export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-perionyx-bg-primary text-perionyx-text-primary">
      <div className="relative min-h-screen">
        <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,rgba(212,175,55,0.03),transparent_60%)]" />
        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-14 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
