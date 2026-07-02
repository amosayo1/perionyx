import { Navigation } from "@/components/landing/navigation";
import { Footer } from "@/components/landing/footer";
import { RequestDemoForm } from "@/components/landing/request-demo-form";

export const metadata = {
  title: "Request a Demo | PERIONYX",
  description: "Schedule a personalized demo of PERIONYX — the enterprise treasury operating system.",
};

export default function RequestDemoPage() {
  return (
    <div className="min-h-screen bg-[#090909] flex flex-col">
      <Navigation />
      <div className="flex-1 flex items-center justify-center px-6 pt-28 pb-24">
        <div className="w-full max-w-2xl">
          <RequestDemoForm />
        </div>
      </div>
      <Footer />
    </div>
  );
}
