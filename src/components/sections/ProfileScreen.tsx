"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { AppShell, AppHeader } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useAppState } from "@/context/AppStateContext";
import { usePermissions } from "@/hooks/usePermissions";
import { AuthScreen } from "@/components/sections/AuthScreen";
import { ChangePasswordForm, SetPasswordScreen } from "@/components/sections/SetPasswordScreen";
import {
  PLANS,
  getPlanLabel,
  getEffectiveTier,
  isSubscriptionActive,
  PaidTier,
  BillingInterval,
} from "@/lib/subscription";
import { maskPhone } from "@/lib/auth-types";
import { NotificationPreferences } from "@/lib/notifications";
import { enableBrowserPush, getBrowserPushStatus } from "@/hooks/useAwarenessPush";
import { AppIcon, IconName } from "@/components/ui/icons";
import { AppScreen } from "@/lib/phone";
import {
  PLAN_ACCENT_TEXT,
  PLAN_CTA_BUTTON,
  PLAN_HEADING_TEXT,
} from "@/lib/subscription/plan-colors";
import { PlanExploreBar } from "@/components/plans/PlanExploreBar";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useDevPlanPreview } from "@/context/DevPlanPreviewContext";
import { comingSoonLabel, tierLockDesc } from "@/lib/app-features";

interface ProfileScreenProps {
  onNavigate: (screen: AppScreen) => void;
}

const PREFS_LABELS: { key: keyof NotificationPreferences; label: string; desc: string }[] = [
  { key: "cycleInsights", label: "Cycle phase awareness", desc: "Gentle tips for your current cycle phase" },
  { key: "periodReminders", label: "Period reminders", desc: "Only for regular cycles — estimated window" },
  { key: "symptomCheckins", label: "Symptom check-ins", desc: "Daily nudge to log how you feel" },
  { key: "carePlanReminders", label: "Care plan tips", desc: "Personalised guidance from your health profile" },
  { key: "doctorAlerts", label: "Doctor awareness", desc: "Reminders to discuss flagged symptoms" },
  { key: "learnContent", label: "PCOS learn content", desc: "Recommended articles for your profile" },
  { key: "wellnessTips", label: "Daily wellness tips", desc: "PCOS-friendly habits & nutrition" },
  { key: "assessmentReminders", label: "Assessment reminders", desc: "Nudge to complete your health profile" },
  { key: "planUpdates", label: "Plan updates", desc: "Subscription expiry & renewal alerts" },
];

const TIER_ICONS: Record<string, IconName> = {
  free: "flower",
  starter: "leaf",
  plus: "heart",
  premium: "star",
};

export function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const { profile } = useAppState();
  const {
    user,
    isAuthenticated,
    logout,
    activatePlan,
    updateNotificationPrefs,
    unreadCount,
    notificationPrefs,
    refreshUser,
    setPassword,
    changePassword,
  } = useAuth();
  const { tier, remaining, startCheckout, refresh, can, demoMode, lockedTier } = usePermissions();
  const { setPreviewTier } = useDevPlanPreview();

  const [showAuth, setShowAuth] = useState(false);
  const [activating, setActivating] = useState<PaidTier | null>(null);
  const [section, setSection] = useState<"main" | "plans" | "notifications" | "password">("main");
  const [pushStatus, setPushStatus] = useState<ReturnType<typeof getBrowserPushStatus>>("default");
  const [pushLoading, setPushLoading] = useState(false);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("month");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const displayName = user?.name || profile.name || "Friend";
  const effectiveTier = tier;
  const isPaidUser = isAuthenticated && user && getEffectiveTier(user.subscription) !== "free";
  const isTestAccount = Boolean(lockedTier ?? user?.testPlanTier);
  const displayEmail = user?.email ?? (user?.phone.startsWith("google:") ? user.phone.slice(7) : null);

  useEffect(() => {
    setPushStatus(getBrowserPushStatus());
  }, [section]);

  async function handleGoogleSuccess() {
    setGoogleLoading(true);
    setGoogleError(null);
    setPreviewTier(null);
    await refreshUser();
    refresh();
    setGoogleLoading(false);
  }

  async function handleCheckout(plan: PaidTier) {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    setActivating(plan);
    setCheckoutError(null);

    if (demoMode) {
      const result = await activatePlan(plan);
      if (result.error) setCheckoutError(result.error);
      else {
        await refreshUser();
        refresh();
        setSection("main");
      }
    } else {
      const result = await startCheckout(plan, billingInterval);
      if (!result.ok) setCheckoutError(result.error ?? "Checkout failed");
    }
    setActivating(null);
  }

  async function togglePref(key: keyof NotificationPreferences) {
    await updateNotificationPrefs({ [key]: !notificationPrefs[key] });
  }

  async function handleEnablePush() {
    setPushLoading(true);
    const result = await enableBrowserPush();
    setPushStatus(result === "granted" ? "granted" : result === "unsupported" ? "unsupported" : "denied");
    if (result === "granted") {
      await updateNotificationPrefs({ browserPush: true });
    }
    setPushLoading(false);
  }

  if (showAuth) {
    return (
      <AuthScreen
        initialName={profile.name}
        onSuccess={() => setShowAuth(false)}
        onCancel={() => setShowAuth(false)}
      />
    );
  }

  if (section === "plans") {
    return (
      <AppShell className="bg-gradient-to-b from-purple-light/30 to-cream">
        <button type="button" onClick={() => setSection("main")} className="mb-4 text-xs text-gray-500">
          ← Profile
        </button>
        <h2 className="font-serif text-2xl text-purple-dark">Choose your plan</h2>
        <p className="mt-1 text-xs text-gray-500">
          {demoMode ? "Demo mode — instant activation" : "Pay securely via Razorpay or Stripe"}
        </p>

        <div className="mt-4 flex rounded-full bg-white p-1 shadow-card">
          {(["month", "year"] as BillingInterval[]).map((iv) => (
            <button
              key={iv}
              type="button"
              onClick={() => setBillingInterval(iv)}
              className={`flex-1 rounded-full py-2 text-[10px] font-medium ${
                billingInterval === iv ? "bg-purple-dark text-white" : "text-gray-500"
              }`}
            >
              {iv === "month" ? "Monthly" : "Yearly (save ~17%)"}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {(Object.keys(PLANS) as PaidTier[])
            .filter((planId) => !isTestAccount || planId === lockedTier)
            .map((planId) => {
            const plan = PLANS[planId];
            const isCurrent = effectiveTier === planId && user && isSubscriptionActive(user.subscription);
            const price = billingInterval === "month" ? plan.monthlyPrice : plan.annualPrice;
            return (
              <div key={planId} className={`rounded-2xl p-4 ${plan.color} shadow-card`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`font-serif text-base ${PLAN_HEADING_TEXT[planId]}`}>{plan.name}</p>
                    <p className="text-[10px] text-gray-600">{plan.tagline}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${PLAN_HEADING_TEXT[planId]}`}>
                      ₹{price}
                      <span className="text-[10px] font-normal">/{billingInterval === "month" ? "mo" : "yr"}</span>
                    </p>
                  </div>
                </div>
                <ul className="mt-3 space-y-1">
                  {plan.limits.slice(0, 3).map((f) => (
                    <li key={f} className="flex gap-1.5 text-[10px] text-gray-700">
                      <span className={PLAN_ACCENT_TEXT[planId]}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => handleCheckout(planId)}
                  disabled={isCurrent || activating === planId}
                  className={`mt-3 w-full rounded-full py-2.5 text-xs font-medium text-white disabled:opacity-50 ${PLAN_CTA_BUTTON[planId]}`}
                >
                  {isCurrent ? "Current plan" : activating === planId ? "Processing…" : `Get ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {checkoutError && (
          <p className="mt-3 text-[10px] text-red-600">{checkoutError}</p>
        )}
      </AppShell>
    );
  }

  if (section === "password" && isPaidUser) {
    return (
      <AppShell className="bg-gradient-to-b from-peach/30 via-cream to-cream">
        <button type="button" onClick={() => setSection("main")} className="mb-4 text-xs text-gray-500">
          ← Profile
        </button>
        <h2 className="font-serif text-2xl text-purple-dark">
          {user?.hasPassword ? "Change password" : "Set up password"}
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          {user?.hasPassword
            ? "Update your sign-in password for this paid plan."
            : "Create a password to sign in without OTP."}
        </p>

        <div className="mt-6">
          {user?.hasPassword ? (
            <ChangePasswordForm
              onSubmit={changePassword}
              onCancel={() => setSection("main")}
            />
          ) : (
            <SetPasswordScreen
              embedded
              description="Create a password to sign in without OTP on your paid plan."
              submitLabel="Save password"
              onSubmit={async (pwd, confirm) => {
                const result = await setPassword(pwd, confirm);
                if (!result.error) setSection("main");
                return result;
              }}
              onCancel={() => setSection("main")}
            />
          )}
        </div>
      </AppShell>
    );
  }

  if (section === "notifications") {
    return (
      <AppShell className="bg-cream">
        <button type="button" onClick={() => setSection("main")} className="mb-4 text-xs text-gray-500">
          ← Profile
        </button>
        <h2 className="font-serif text-2xl text-purple-dark">Awareness settings</h2>
        <p className="mt-1 text-xs text-gray-500">Education & reminders — not medical predictions</p>

        <div className="mt-5 rounded-2xl bg-white p-4 shadow-card">
          <p className="text-sm font-medium text-purple-dark">Browser notifications</p>
          <p className="mt-0.5 text-[10px] text-gray-500">
            Get awareness alerts when the app is in the background
          </p>
          {pushStatus === "granted" && notificationPrefs.browserPush ? (
            <p className="mt-3 text-[10px] font-medium text-teal-mid">Enabled on this device</p>
          ) : pushStatus === "denied" ? (
            <p className="mt-3 text-[10px] text-amber-mid">
              Blocked in browser settings — allow notifications for this site
            </p>
          ) : pushStatus === "unsupported" ? (
            <p className="mt-3 text-[10px] text-gray-500">Not supported in this browser</p>
          ) : (
            <button
              type="button"
              onClick={handleEnablePush}
              disabled={pushLoading}
              className="mt-3 w-full rounded-full bg-pink-mid py-2.5 text-xs font-medium text-white disabled:opacity-50"
            >
              {pushLoading ? "Requesting…" : "Enable push notifications"}
            </button>
          )}
        </div>

        <ul className="mt-4 space-y-2">
          {PREFS_LABELS.map(({ key, label, desc }) => (
            <li key={key} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-card">
              <div>
                <p className="text-sm font-medium text-purple-dark">{label}</p>
                <p className="text-[10px] text-gray-500">{desc}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notificationPrefs[key]}
                onClick={() => togglePref(key)}
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  notificationPrefs[key] ? "bg-pink-mid" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                    notificationPrefs[key] ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>
      </AppShell>
    );
  }

  const aiLeft = remaining("ai_coach");
  const insightsLeft = remaining("ai_insights");

  return (
    <AppShell className="bg-surface-0">
      <AppHeader>
        <h1 className="font-serif text-2xl font-semibold text-content-primary">Profile</h1>
      </AppHeader>

      <div className="mb-4 rounded-3xl bg-surface-1 border border-divider p-5 shadow-card">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-xl text-white">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-serif text-lg text-content-primary">{displayName}</p>
            {isAuthenticated && user ? (
              <>
                {displayEmail ? (
                  <p className="text-[10px] text-content-secondary">{displayEmail}</p>
                ) : (
                  <p className="text-[10px] text-content-secondary">{maskPhone(user.phone)}</p>
                )}
                {isTestAccount && lockedTier && (
                  <p className="text-[10px] font-medium text-brand">
                    Test account · {getPlanLabel(lockedTier)} only
                  </p>
                )}
              </>
            ) : (
              <p className="text-[10px] text-content-secondary">Guest · data saved on this device</p>
            )}
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={() => setShowAuth(true)}
              className="w-full rounded-full bg-brand hover:bg-brand-hover py-2.5 text-xs font-medium text-white transition-colors"
            >
              Sign in with phone →
            </button>
            <div className="relative flex items-center gap-3">
              <div className="h-px flex-1 bg-divider" />
              <span className="text-[10px] text-content-secondary">or test with Google</span>
              <div className="h-px flex-1 bg-divider" />
            </div>
            <GoogleSignInButton
              disabled={googleLoading}
              onSuccess={() => void handleGoogleSuccess()}
              onError={setGoogleError}
            />
            {googleError && (
              <p className="text-center text-[10px] text-destructive">{googleError}</p>
            )}
            <p className="text-center text-[10px] text-content-tertiary">
              plus@test.com → Plus · premium@test.com → Premium
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={logout}
            className="mt-4 w-full rounded-full border border-divider hover:bg-surface-2 py-2.5 text-xs font-medium text-content-primary transition-colors"
          >
            Sign out
          </button>
        )}
      </div>

      <PlanExploreBar />

      <div className="mb-4 rounded-3xl bg-surface-1 border border-divider p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-content-secondary">Your plan</p>
            <p className="mt-0.5 font-serif text-xl text-content-primary">{getPlanLabel(effectiveTier)}</p>
            {user?.subscription.expiresAt && effectiveTier !== "free" && (
              <p className="mt-1 text-[10px] text-content-secondary">
                Renews{" "}
                {new Date(user.subscription.expiresAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
            {isAuthenticated && aiLeft !== null && (
              <p className="mt-1 text-[10px] text-content-secondary">
                AI Coach: {aiLeft} left · Insights: {insightsLeft ?? 0} left
              </p>
            )}
          </div>
          <AppIcon
            name={TIER_ICONS[effectiveTier] ?? "flower"}
            className="h-8 w-8 text-brand"
          />
        </div>
        {!isTestAccount && (
          <button
            type="button"
            onClick={() => setSection("plans")}
            className="mt-4 w-full rounded-full bg-surface-2 hover:bg-surface-3 border border-divider py-2.5 text-xs font-medium text-content-primary transition-colors"
          >
            {effectiveTier === "free" ? "Upgrade plan" : "Change plan"}
          </button>
        )}
        {isTestAccount && (
          <p className="mt-4 rounded-xl bg-surface-2 px-3 py-2 text-center text-[10px] text-content-primary border border-divider">
            Plan locked to {getPlanLabel(lockedTier ?? effectiveTier)} on this test account
          </p>
        )}
        {can("priority_support") && (
          <a
            href="mailto:support@herwellness.app?subject=Premium%20Support"
            className="mt-2 block text-center text-[10px] text-brand underline"
          >
            Priority support
          </a>
        )}
      </div>

      <div className="space-y-2">
        <MenuRow
          icon="bell"
          label="Notifications"
          desc={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          onClick={() => onNavigate("notifications")}
        />
        <MenuRow
          icon="settings"
          label="Notification settings"
          desc="Reminders, tips & alerts"
          onClick={() => setSection("notifications")}
        />
        {isPaidUser && (
          <MenuRow
            icon="lock"
            label={user?.hasPassword ? "Change password" : "Set up password"}
            desc={user?.hasPassword ? "Update your sign-in password" : "Sign in without OTP"}
            onClick={() => setSection("password")}
          />
        )}
        <MenuRow
          icon="clipboard"
          label="Health profile"
          desc="Your intake & care plan"
          onClick={() => onNavigate("assessment")}
        />
        <MenuRow
          icon="chart"
          label="PCOS dashboard"
          desc={can("pcos_basic") ? "Cycle & symptom analytics" : tierLockDesc("pcos_basic")}
          locked={!can("pcos_basic")}
          onClick={() => onNavigate("pcos-dashboard")}
        />
        <MenuRow
          icon="heart"
          label="Pregnancy mode"
          desc={can("pregnancy_mode") ? "Premium trimester tracking" : tierLockDesc("pregnancy_mode")}
          locked={!can("pregnancy_mode")}
          onClick={() => onNavigate("pregnancy")}
        />
        <MenuRow
          icon="leaf"
          label="Wearables"
          desc={can("wearable_sync") ? "Sync steps & sleep" : tierLockDesc("wearable_sync")}
          locked={!can("wearable_sync")}
          onClick={() => onNavigate("wearables")}
        />
        <MenuRow
          icon="user"
          label="Partner access"
          desc={can("partner_access") ? "Share with your partner" : tierLockDesc("partner_access")}
          locked={!can("partner_access")}
          onClick={() => onNavigate("partner")}
        />
        <MenuRow icon="book" label="Learn" desc="PCOS guide & conditions" onClick={() => onNavigate("learn")} />
        <MenuRow
          icon="shield"
          label="Privacy"
          desc={comingSoonLabel("privacy")}
          locked
          disabled
        />
        <DarkModeRow />
      </div>

      {!isAuthenticated && (
        <p className="mt-5 rounded-xl bg-surface-2 border border-warning-subtle px-3 py-2.5 text-[10px] leading-relaxed text-content-secondary">
          Sign in to sync your plan & notifications across devices. Paid plans are linked to your phone number.
        </p>
      )}
    </AppShell>
  );
}

function MenuRow({
  icon,
  label,
  desc,
  onClick,
  locked,
  disabled,
}: {
  icon: IconName;
  label: string;
  desc: string;
  onClick?: () => void;
  locked?: boolean;
  disabled?: boolean;
}) {
  const isDisabled = disabled || !onClick;

  return (
    <button
      type="button"
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={`flex w-full items-center gap-3 rounded-2xl bg-surface-1 border border-divider p-4 text-left shadow-card ${
        isDisabled ? "cursor-not-allowed opacity-60" : "hover:bg-surface-2 active:scale-95 transition-all"
      }`}
    >
      <AppIcon name={icon} className="h-5 w-5 shrink-0 text-brand" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-content-primary">{label}</p>
        <p className="text-[10px] text-content-secondary">{desc}</p>
      </div>
      {locked ? (
        <AppIcon name="lock" className="h-4 w-4 shrink-0 text-content-tertiary" aria-hidden />
      ) : (
        <span className="text-content-tertiary">→</span>
      )}
    </button>
  );
}

function DarkModeRow() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex w-full items-center gap-3 rounded-2xl bg-surface-1 border border-divider p-4 h-[60px]" />
    );
  }

  const isDark = theme === "dark";

  return (
    <div className="flex w-full items-center gap-3 rounded-2xl bg-surface-1 border border-divider p-4 shadow-card">
      <AppIcon name={isDark ? "moon" : "sun"} className="h-5 w-5 shrink-0 text-brand" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-content-primary">Dark mode</p>
        <p className="text-[10px] text-content-secondary">
          {isDark ? "On — easier on the eyes" : "Off — light appearance"}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label="Toggle dark mode"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={`relative h-7 w-12 rounded-full transition-colors ${
          isDark ? "bg-brand" : "bg-surface-3"
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
            isDark ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

