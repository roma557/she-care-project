import { NotificationPreferences } from "@/lib/notifications";
import { Subscription, DEFAULT_SUBSCRIPTION, PaidTier } from "@/lib/subscription";

export interface AuthUser {
  id: string;
  phone: string;
  name: string;
  createdAt: string;
  subscription: Subscription;
  notificationPrefs: NotificationPreferences;
  aiQuestionsUsed: number;
  aiQuestionsResetAt: string;
  /** Google test account email when signed in via Google */
  email?: string;
  /** Locked plan tier for Google test accounts — cannot preview or switch plans */
  testPlanTier?: PaidTier;
  /** Populated by auth API responses only */
  hasPassword?: boolean;
  /** Paid user who must set a password before using the app */
  needsPasswordSetup?: boolean;
}

export interface SessionPayload {
  userId: string;
  phone: string;
}

export const SESSION_COOKIE = "hw_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function createDefaultUser(phone: string, name: string): AuthUser {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    phone,
    name,
    createdAt: now,
    subscription: { ...DEFAULT_SUBSCRIPTION },
    notificationPrefs: {
      periodReminders: true,
      wellnessTips: true,
      assessmentReminders: true,
      planUpdates: true,
      cycleInsights: true,
      symptomCheckins: true,
      carePlanReminders: true,
      doctorAlerts: true,
      learnContent: true,
      browserPush: false,
    },
    aiQuestionsUsed: 0,
    aiQuestionsResetAt: getNextMonthReset(),
  };
}

export function getNextMonthReset(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length === 13 && digits.startsWith("91")) return `+${digits}`;
  return null;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) {
    const last10 = digits.slice(-10);
    return `+91 ${last10.slice(0, 2)}****${last10.slice(6)}`;
  }
  return phone;
}
