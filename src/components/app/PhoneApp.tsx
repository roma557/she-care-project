"use client";

import { useState, useEffect } from "react";
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
import { ProfileScreen } from "@/components/sections/ProfileScreen";
import { NotificationsPanel } from "@/components/sections/NotificationsPanel";
import { OnboardingScreen } from "@/components/sections/OnboardingScreen";
import { AppStateProvider, useAppState } from "@/context/AppStateContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppScreen, NavTab, OVERLAY_SCREENS } from "@/lib/phone";
import { buildNotificationContext } from "@/lib/notifications";
import { getEffectiveTier } from "@/lib/subscription";
import { useAwarenessPush } from "@/hooks/useAwarenessPush";
import { useCloudSync } from "@/hooks/useCloudSync";

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
      return <WellnessScreen onBack={() => onNavigate("home")} />;
    case "profile":
      return <ProfileScreen onNavigate={onNavigate} />;
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
  const {
    profile,
    hydrated,
    currentCycleDay,
    assessmentResult,
    lastSymptomSaveDate,
  } = useAppState();
  const {
    user,
    notifications,
    unreadCount,
    notificationPrefs,
    syncNotifications,
    markNotificationRead,
    dismissNotification,
    markAllNotificationsRead,
  } = useAuth();

  const [screen, setScreen] = useState<AppScreen>("home");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const showBottomNav = isNavTab(screen) && profile.onboardingComplete;

  useAwarenessPush({
    enabled: notificationPrefs.browserPush,
    notifications,
  });

  useCloudSync();

  useEffect(() => {
    if (!hydrated || !profile.onboardingComplete) return;

    const context = buildNotificationContext({
      currentCycleDay,
      cycleLength: profile.cycleLength || 28,
      cycleRegularity: profile.intakeAnswers?.cycleRegularity,
      hasAssessment: !!assessmentResult,
      assessmentResult,
      primaryGoal: profile.intakeAnswers?.primaryGoal,
      lastSymptomSaveDate: lastSymptomSaveDate ?? undefined,
      subscriptionExpiresAt: user?.subscription.expiresAt ?? null,
      subscriptionTier: user ? getEffectiveTier(user.subscription) : "free",
    });

    syncNotifications(context);
  }, [
    hydrated,
    profile.onboardingComplete,
    profile.cycleLength,
    profile.intakeAnswers?.cycleRegularity,
    profile.intakeAnswers?.primaryGoal,
    currentCycleDay,
    assessmentResult,
    lastSymptomSaveDate,
    user,
    syncNotifications,
  ]);

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState !== "visible" || !hydrated || !profile.onboardingComplete) {
        return;
      }
      const context = buildNotificationContext({
        currentCycleDay,
        cycleLength: profile.cycleLength || 28,
        cycleRegularity: profile.intakeAnswers?.cycleRegularity,
        hasAssessment: !!assessmentResult,
        assessmentResult,
        primaryGoal: profile.intakeAnswers?.primaryGoal,
        lastSymptomSaveDate: lastSymptomSaveDate ?? undefined,
        subscriptionExpiresAt: user?.subscription.expiresAt ?? null,
        subscriptionTier: user ? getEffectiveTier(user.subscription) : "free",
      });
      syncNotifications(context);
    }

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [
    hydrated,
    profile.onboardingComplete,
    profile.cycleLength,
    profile.intakeAnswers?.cycleRegularity,
    profile.intakeAnswers?.primaryGoal,
    currentCycleDay,
    assessmentResult,
    lastSymptomSaveDate,
    user,
    syncNotifications,
  ]);

  function handleNavigate(target: AppScreen) {
    if (target === "notifications") {
      setNotificationsOpen(true);
      return;
    }
    setScreen(target);
  }

  if (!hydrated) {
    return (
      <div className="flex h-full items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-pale border-t-rose-deep" />
      </div>
    );
  }

  if (!profile.onboardingComplete) {
    return <OnboardingScreen />;
  }

  return (
    <>
      <ScreenTransition screenKey={screen}>
        {screen === "home" ? (
          <HomeScreen
            onNavigate={handleNavigate}
            onOpenNotifications={() => setNotificationsOpen(true)}
            unreadCount={unreadCount}
          />
        ) : (
          <ScreenContent screen={screen} onNavigate={handleNavigate} />
        )}
      </ScreenTransition>

      {showBottomNav && (
        <BottomNav active={screen} onNavigate={(tab) => setScreen(tab)} />
      )}

      <NotificationsPanel
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={markNotificationRead}
        onDismiss={dismissNotification}
        onMarkAllRead={markAllNotificationsRead}
        onNavigate={handleNavigate}
      />
    </>
  );
}

export function PhoneApp() {
  return (
    <AuthProvider>
      <AppStateProvider>
        <div className="app-viewport-root">
          <div className="app-viewport-clip">
            <div className="app-viewport-scale">
              <PhoneFrame>
                <div className="relative h-full">
                  <PhoneAppInner />
                </div>
              </PhoneFrame>
            </div>
          </div>
        </div>
      </AppStateProvider>
    </AuthProvider>
  );
}
