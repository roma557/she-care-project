"use client";

import { useState, useEffect } from "react";
import { AppShell, AppHeader } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useAppState } from "@/context/AppStateContext";
import { AuthScreen } from "@/components/sections/AuthScreen";
import {
  PLANS,
  getEffectiveTier,
  getPlanLabel,
  isSubscriptionActive,
  SubscriptionTier,
} from "@/lib/subscription";
import { maskPhone } from "@/lib/auth-types";
import { NotificationPreferences, DEFAULT_NOTIFICATION_PREFS } from "@/lib/notifications";
import { loadJSON } from "@/lib/storage";

import { AppScreen } from "@/lib/phone";

interface ProfileScreenProps {
  onNavigate: (screen: AppScreen) => void;
}

const PREFS_LABELS: { key: keyof NotificationPreferences; label: string; desc: string }[] = [
  { key: "periodReminders", label: "Period reminders", desc: "When your period may be approaching" },
  { key: "wellnessTips", label: "Daily wellness tips", desc: "PCOS-friendly habits & nutrition" },
  { key: "assessmentReminders", label: "Assessment reminders", desc: "Nudge to complete your health profile" },
  { key: "cycleInsights", label: "Cycle insights", desc: "Phase-based tips for your cycle day" },
  { key: "planUpdates", label: "Plan updates", desc: "Subscription expiry & renewal alerts" },
];

export function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const { profile } = useAppState();
  const {
    user,
    isAuthenticated,
    logout,
    activatePlan,
    updateNotificationPrefs,
    unreadCount,
  } = useAuth();

  const [showAuth, setShowAuth] = useState(false);
  const [activating, setActivating] = useState<SubscriptionTier | null>(null);
  const [section, setSection] = useState<"main" | "plans" | "notifications">("main");
  const [localPrefs, setLocalPrefs] = useState(DEFAULT_NOTIFICATION_PREFS);

  const displayName = user?.name || profile.name || "Friend";
  const tier = user ? getEffectiveTier(user.subscription) : "free";
  const prefs = user?.notificationPrefs ?? localPrefs;

  useEffect(() => {
    if (!user) {
      setLocalPrefs(loadJSON("notification-prefs", DEFAULT_NOTIFICATION_PREFS));
    }
  }, [user, section]);

  async function handleActivate(plan: SubscriptionTier) {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    setActivating(plan);
    await activatePlan(plan);
    setActivating(null);
    setSection("main");
  }

  async function togglePref(key: keyof NotificationPreferences) {
    const next = { ...prefs, [key]: !prefs[key] };
    if (!user) setLocalPrefs(next);
    await updateNotificationPrefs({ [key]: !prefs[key] });
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
        <p className="mt-1 text-xs text-gray-500">Affordable care for every girl — pay via UPI (coming soon)</p>

        <div className="mt-5 space-y-3">
          {(Object.keys(PLANS) as Array<keyof typeof PLANS>).map((planId) => {
            const plan = PLANS[planId];
            const isCurrent = tier === planId && user && isSubscriptionActive(user.subscription);
            return (
              <div key={planId} className={`rounded-2xl p-4 ${plan.color} shadow-card`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-serif text-base text-purple-dark">{plan.name}</p>
                    <p className="text-[10px] text-gray-600">{plan.tagline}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-purple-dark">₹{plan.monthlyPrice}<span className="text-[10px] font-normal">/mo</span></p>
                    <p className="text-[9px] text-gray-500">₹{plan.annualPrice}/yr</p>
                  </div>
                </div>
                <ul className="mt-3 space-y-1">
                  {plan.features.slice(0, 3).map((f) => (
                    <li key={f} className="flex gap-1.5 text-[10px] text-gray-700">
                      <span className="text-teal-mid">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => handleActivate(planId)}
                  disabled={isCurrent || activating === planId}
                  className="mt-3 w-full rounded-full bg-purple-dark py-2.5 text-xs font-medium text-white disabled:opacity-50"
                >
                  {isCurrent ? "Current plan" : activating === planId ? "Activating…" : `Start ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-[9px] text-gray-400">
          Demo mode: plans activate instantly. Production will use UPI via Razorpay.
        </p>
      </AppShell>
    );
  }

  if (section === "notifications") {
    return (
      <AppShell className="bg-cream">
        <button type="button" onClick={() => setSection("main")} className="mb-4 text-xs text-gray-500">
          ← Profile
        </button>
        <h2 className="font-serif text-2xl text-purple-dark">Notification settings</h2>
        <p className="mt-1 text-xs text-gray-500">Choose what you want to hear about</p>

        <ul className="mt-5 space-y-2">
          {PREFS_LABELS.map(({ key, label, desc }) => (
            <li key={key} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-card">
              <div>
                <p className="text-sm font-medium text-purple-dark">{label}</p>
                <p className="text-[10px] text-gray-500">{desc}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs[key]}
                onClick={() => togglePref(key)}
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  prefs[key] ? "bg-pink-mid" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                    prefs[key] ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>
      </AppShell>
    );
  }

  return (
    <AppShell className="bg-gradient-to-b from-peach/30 via-cream to-cream">
      <AppHeader>
        <h1 className="font-serif text-2xl font-semibold text-purple-dark">Profile</h1>
      </AppHeader>

      {/* Account card */}
      <div className="mb-4 rounded-3xl bg-white p-5 shadow-card">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-mid to-purple-mid text-xl text-white">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-serif text-lg text-purple-dark">{displayName}</p>
            {isAuthenticated && user ? (
              <p className="text-[10px] text-gray-500">{maskPhone(user.phone)}</p>
            ) : (
              <p className="text-[10px] text-gray-500">Guest · data saved on this device</p>
            )}
          </div>
        </div>

        {!isAuthenticated ? (
          <button
            type="button"
            onClick={() => setShowAuth(true)}
            className="mt-4 w-full rounded-full bg-pink-mid py-2.5 text-xs font-medium text-white"
          >
            Sign in with phone →
          </button>
        ) : (
          <button
            type="button"
            onClick={logout}
            className="mt-4 w-full rounded-full border border-pink-light py-2.5 text-xs font-medium text-pink-mid"
          >
            Sign out
          </button>
        )}
      </div>

      {/* Subscription card */}
      <div className="mb-4 rounded-3xl bg-gradient-to-br from-purple-light to-pink-light/60 p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-purple-mid">Your plan</p>
            <p className="mt-0.5 font-serif text-xl text-purple-dark">{getPlanLabel(tier)}</p>
            {user?.subscription.expiresAt && tier !== "free" && (
              <p className="mt-1 text-[10px] text-gray-600">
                Renews {new Date(user.subscription.expiresAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
          <span className="text-3xl">{tier === "free" ? "🌸" : tier === "rozana" ? "🌿" : tier === "sampoorna" ? "💜" : "✨"}</span>
        </div>
        <button
          type="button"
          onClick={() => setSection("plans")}
          className="mt-4 w-full rounded-full bg-purple-dark py-2.5 text-xs font-medium text-white"
        >
          {tier === "free" ? "Upgrade plan" : "Change plan"}
        </button>
      </div>

      {/* Menu items */}
      <div className="space-y-2">
        <MenuRow
          icon="🔔"
          label="Notifications"
          desc={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          onClick={() => onNavigate("notifications")}
        />
        <MenuRow
          icon="⚙️"
          label="Notification settings"
          desc="Reminders, tips & alerts"
          onClick={() => setSection("notifications")}
        />
        <MenuRow
          icon="📋"
          label="Health profile"
          desc="Your intake & care plan"
          onClick={() => onNavigate("assessment")}
        />
        <MenuRow
          icon="🔒"
          label="Privacy"
          desc="Your data stays private"
          onClick={() => {}}
        />
      </div>

      {!isAuthenticated && (
        <p className="mt-5 rounded-xl bg-amber-light/60 px-3 py-2.5 text-[10px] leading-relaxed text-amber-mid">
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
}: {
  icon: string;
  label: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-card"
    >
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-purple-dark">{label}</p>
        <p className="text-[10px] text-gray-500">{desc}</p>
      </div>
      <span className="text-gray-300">→</span>
    </button>
  );
}
