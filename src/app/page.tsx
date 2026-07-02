import { Navigation, Hero, TrustBar, ProblemSection, SolutionSection, WorkflowTimeline, ThreePillars, ProductShowcase, WhyPerionyx, EnterpriseArchitecture, FinalCTA, Footer } from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#090909]">
      <Navigation />
      <Hero />
      <TrustBar />
      <ProblemSection />
      <SolutionSection />
      <WorkflowTimeline />
      <ThreePillars />
      <ProductShowcase />
      <WhyPerionyx />
      <EnterpriseArchitecture />
      <FinalCTA />
      <Footer />
    </div>
  );
}
