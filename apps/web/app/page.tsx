"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { HeroSection } from "@/components/landing/HeroSection";
import { UnitShowcase } from "@/components/landing/UnitShowcase";
import { MechanicsSection } from "@/components/landing/MechanicsSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TrailerSection } from "@/components/landing/TrailerSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Home() {
  const { profile, loading } = useAuth();

  return (
    <main>
      <HeroSection profile={profile} loading={loading} />
      <UnitShowcase />
      <MechanicsSection />
      <HowItWorks />
      <TrailerSection />
      <StatsSection />
      <FinalCTA isLoggedIn={!!profile} />
      <LandingFooter />
    </main>
  );
}
