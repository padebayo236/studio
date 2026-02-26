'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { LandingHeader } from "@/components/landing/header";
import { LandingHero } from "@/components/landing/hero";
import { LandingAbout } from "@/components/landing/about";
import { LandingFeatures } from "@/components/landing/features";
import { LandingHowItWorks } from "@/components/landing/how-it-works";
import { LandingBenefits } from "@/components/landing/benefits";
import { LandingCTA } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/footer";

export default function LandingPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

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
