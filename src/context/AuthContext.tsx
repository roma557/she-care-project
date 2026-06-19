"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { AuthUser } from "@/lib/auth-types";
import { SubscriptionTier, getEffectiveTier } from "@/lib/subscription";
import {
  AppNotification,
  NotificationPreferences,
  NotificationSyncContext,
  generateSmartNotifications,
  DEFAULT_NOTIFICATION_PREFS,
} from "@/lib/notifications";
import { loadJSON, saveJSON } from "@/lib/storage";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  sendOtp: (phone: string, name?: string) => Promise<{ devOtp?: string; error?: string }>;
  verifyOtp: (phone: string, otp: string, name?: string) => Promise<{ error?: string }>;
  verifyMsg91AccessToken: (accessToken: string, name?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  activatePlan: (tier: SubscriptionTier) => Promise<{ error?: string }>;
  notifications: AppNotification[];
  unreadCount: number;
  notificationPrefs: NotificationPreferences;
  syncNotifications: (context: NotificationSyncContext) => Promise<AppNotification[]>;
  markNotificationRead: (id: string) => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  updateNotificationPrefs: (prefs: Partial<NotificationPreferences>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const LOCAL_NOTIFICATIONS_KEY = "notifications";
const LOCAL_PREFS_KEY = "notification-prefs";

function mergePrefs(prefs?: Partial<NotificationPreferences>): NotificationPreferences {
  return { ...DEFAULT_NOTIFICATION_PREFS, ...prefs };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [localPrefs, setLocalPrefs] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFS);

  const notificationPrefs = user
    ? mergePrefs(user.notificationPrefs)
    : localPrefs;

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
    setNotifications(loadJSON<AppNotification[]>(LOCAL_NOTIFICATIONS_KEY, []));
    setLocalPrefs(loadJSON(LOCAL_PREFS_KEY, DEFAULT_NOTIFICATION_PREFS));
  }, [refreshUser]);

  const syncNotifications = useCallback(
    async (context: NotificationSyncContext): Promise<AppNotification[]> => {
      if (user) {
        try {
          const res = await fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ context }),
          });
          if (res.ok) {
            const data = await res.json();
            setNotifications(data.notifications);
            saveJSON(LOCAL_NOTIFICATIONS_KEY, data.notifications);
            return data.notifications as AppNotification[];
          }
        } catch {
          // fall through to local
        }
      }

      const existing = loadJSON<AppNotification[]>(LOCAL_NOTIFICATIONS_KEY, []);
      const existingIds = new Set(existing.map((n) => n.id));
      const prefs = loadJSON(LOCAL_PREFS_KEY, DEFAULT_NOTIFICATION_PREFS);

      const newOnes = generateSmartNotifications({
        context: {
          ...context,
          subscriptionExpiresAt: user?.subscription.expiresAt ?? null,
          subscriptionTier: user ? getEffectiveTier(user.subscription) : "free",
        },
        existingIds,
        prefs: mergePrefs(prefs),
      });

      const merged =
        newOnes.length > 0 ? [...newOnes, ...existing].slice(0, 50) : existing;

      if (newOnes.length > 0 || merged !== existing) {
        setNotifications(merged);
        saveJSON(LOCAL_NOTIFICATIONS_KEY, merged);
      }

      return merged;
    },
    [user],
  );

  const patchNotifications = useCallback(
    async (body: Record<string, unknown>) => {
      if (user) {
        const res = await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications);
          if (data.user) setUser(data.user);
        }
      } else {
        setNotifications((prev) => {
          let next = prev;
          if (body.markAllRead) next = next.map((n) => ({ ...n, read: true }));
          if (body.dismissId) next = next.filter((n) => n.id !== body.dismissId);
          if (body.markReadId) {
            next = next.map((n) =>
              n.id === body.markReadId ? { ...n, read: true } : n,
            );
          }
          saveJSON(LOCAL_NOTIFICATIONS_KEY, next);
          return next;
        });
        if (body.prefs) {
          const current = loadJSON(LOCAL_PREFS_KEY, DEFAULT_NOTIFICATION_PREFS);
          const updated = mergePrefs({ ...current, ...body.prefs });
          saveJSON(LOCAL_PREFS_KEY, updated);
          setLocalPrefs(updated);
        }
      }
    },
    [user],
  );

  const sendOtp = useCallback(async (phone: string, name?: string) => {
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, name }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error ?? "Failed to send OTP" };
    return { devOtp: data.devOtp };
  }, []);

  const verifyOtp = useCallback(async (phone: string, otp: string, name?: string) => {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp, name }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error ?? "Verification failed" };
    setUser(data.user);
    return {};
  }, []);

  const verifyMsg91AccessToken = useCallback(async (accessToken: string, name?: string) => {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken, name }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error ?? "Verification failed" };
    setUser(data.user);
    return {};
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  const activatePlan = useCallback(async (tier: SubscriptionTier) => {
    const res = await fetch("/api/subscription/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error ?? "Failed to activate plan" };
    setUser(data.user);
    return {};
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        sendOtp,
        verifyOtp,
        verifyMsg91AccessToken,
        logout,
        refreshUser,
        activatePlan,
        notifications,
        unreadCount,
        notificationPrefs,
        syncNotifications,
        markNotificationRead: (id) => patchNotifications({ markReadId: id }),
        dismissNotification: (id) => patchNotifications({ dismissId: id }),
        markAllNotificationsRead: () => patchNotifications({ markAllRead: true }),
        updateNotificationPrefs: (prefs) => patchNotifications({ prefs }),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
