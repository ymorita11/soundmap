"use client";

import { useAppStore } from "@/app/lib/store";
import { useEffect, useState } from "react";
import { Header } from "./components/layout/Header";
import { MapView } from "./components/MapView";
import { OnboardingScreen } from "./onboarding/OnboardingScreen";

export default function HomePage() {
  const { showOnboarding, setShowOnboarding } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const seen = localStorage.getItem("soundmap_onboarding_seen");
    if (seen === "true") {
      setShowOnboarding(false);
    }
  }, [setShowOnboarding]);

  if (!mounted) return null;

  if (showOnboarding) {
    return (
      <OnboardingScreen
        onComplete={() => {
          localStorage.setItem("soundmap_onboarding_seen", "true");
          setShowOnboarding(false);
        }}
      />
    );
  }

  return (
    <main>
      <Header />
      <MapView />
    </main>
  );
}
