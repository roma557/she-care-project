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
  const { profile, hydrated, currentCycleDay, assessmentResult } = useAppState();
  const {
    notifications,
    unreadCount,
    syncNotifications,
    markNotificationRead,
    dismissNotification,
    markAllNotificationsRead,
  } = useAuth();

  const [screen, setScreen] = useState<AppScreen>("home");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const showBottomNav = isNavTab(screen) && profile.onboardingComplete;

  useEffect(() => {
    if (hydrated && profile.onboardingComplete) {
      syncNotifications(currentCycleDay, !!assessmentResult);
    }
  }, [hydrated, profile.onboardingComplete, currentCycleDay, assessmentResult, syncNotifications]);

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
