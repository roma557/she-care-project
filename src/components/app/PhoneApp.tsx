"use client";

import { useState } from "react";
import { PhoneFrame } from "@/components/layout/PhoneFrame";
import { BottomNav } from "@/components/ui/BottomNav";
import { ScreenTransition } from "@/components/ui/ScreenTransition";
import { HomeScreen } from "@/components/sections/HomeScreen";
import { ChatScreen } from "@/components/sections/ChatScreen";
import { CycleScreen } from "@/components/sections/CycleScreen";
import { LearnScreen } from "@/components/sections/LearnScreen";
import { WellnessScreen } from "@/components/sections/WellnessScreen";
import { AssessmentScreen } from "@/components/sections/AssessmentScreen";
import { CarePlanScreen } from "@/components/sections/CarePlanScreen";
import { OnboardingScreen } from "@/components/sections/OnboardingScreen";
import { AppStateProvider, useAppState } from "@/context/AppStateContext";
import { AppScreen, NavTab, OVERLAY_SCREENS, PHONE_DISPLAY, PHONE_FRAME } from "@/lib/phone";

interface ScreenContentProps {
  screen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

function ScreenContent({ screen, onNavigate }: ScreenContentProps) {
  switch (screen) {
    case "home":
      return <HomeScreen onNavigate={onNavigate} />;
    case "learn":
      return <LearnScreen />;
    case "chat":
      return <ChatScreen />;
    case "cycle":
      return <CycleScreen />;
    case "wellness":
      return <WellnessScreen />;
    case "assessment":
      return <AssessmentScreen onBack={() => onNavigate("home")} />;
    case "careplan":
      return <CarePlanScreen onBack={() => onNavigate("home")} />;
    default:
      return <HomeScreen onNavigate={onNavigate} />;
  }
}

function isNavTab(screen: AppScreen): screen is NavTab {
  return !OVERLAY_SCREENS.includes(screen);
}

function PhoneAppInner() {
  const { profile, hydrated } = useAppState();
  const [screen, setScreen] = useState<AppScreen>("home");

  const showBottomNav = isNavTab(screen) && profile.onboardingComplete;

  if (!hydrated) {
    return (
      <div className="flex h-full items-center justify-center bg-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pink-light border-t-pink-mid" />
      </div>
    );
  }

  if (!profile.onboardingComplete) {
    return <OnboardingScreen />;
  }

  return (
    <>
      <ScreenTransition screenKey={screen}>
        <ScreenContent screen={screen} onNavigate={setScreen} />
      </ScreenTransition>
      {showBottomNav && (
        <BottomNav active={screen} onNavigate={(tab) => setScreen(tab)} />
      )}
    </>
  );
}

export function PhoneApp() {
  return (
    <AppStateProvider>
      <div
        className="flex min-h-screen items-center justify-center bg-neutral-200"
        style={{ padding: PHONE_DISPLAY.padding }}
      >
        <div
          style={{
            width: PHONE_FRAME.outerWidth * PHONE_DISPLAY.scale,
            height: PHONE_FRAME.outerHeight * PHONE_DISPLAY.scale,
            margin: PHONE_DISPLAY.margin,
          }}
        >
          <div
            style={{
              transform: `scale(${PHONE_DISPLAY.scale})`,
              transformOrigin: "top left",
              width: PHONE_FRAME.outerWidth,
              height: PHONE_FRAME.outerHeight,
            }}
          >
            <PhoneFrame>
              <div className="relative h-full">
                <PhoneAppInner />
              </div>
            </PhoneFrame>
          </div>
        </div>
      </div>
    </AppStateProvider>
  );
}
