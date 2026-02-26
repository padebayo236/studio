
import { LandingHeader } from "@/components/landing/header";
import { LandingHero } from "@/components/landing/hero";
import { LandingAbout } from "@/components/landing/about";
import { LandingFeatures } from "@/components/landing/features";
import { LandingHowItWorks } from "@/components/landing/how-it-works";
import { LandingBenefits } from "@/components/landing/benefits";
import { LandingCTA } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingAbout />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingBenefits />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
