import { isSupabaseEnabled } from "@/lib/db/supabase";
import type { AuthUser } from "@/lib/auth-types";
import type { AppNotification } from "@/lib/notifications";
import type { AppSyncPayload } from "@/lib/sync-types";
import type {
  UserRecord,
  DbSubscription,
  DbPayment,
  DbWearableDevice,
  DbPartnerInvite,
  DbWellnessReport,
  BillingCustomerRow,
} from "@/lib/db/types";
import type { SubscriptionTier, BillingInterval, BillingProvider, SubscriptionStatus } from "@/lib/subscription";
import type { UsageMeter } from "@/lib/subscription/limits";
import * as json from "@/lib/db/json-store";
import * as sb from "@/lib/db/supabase-store";

export { isSupabaseEnabled };
export { isSupabaseEnabled as isPostgresEnabled };

export function findUserByPhone(phone: string): UserRecord | null {
  if (isSupabaseEnabled()) {
    throw new Error("Use findUserByPhoneAsync when Supabase is configured");
  }
  return json.jsonFindUserByPhone(phone);
}

export async function findUserByPhoneAsync(phone: string): Promise<UserRecord | null> {
  if (isSupabaseEnabled()) return sb.sbFindUserByPhone(phone);
  return json.jsonFindUserByPhone(phone);
}

export function findUserById(id: string): UserRecord | null {
  if (isSupabaseEnabled()) {
    throw new Error("Use findUserByIdAsync when Supabase is configured");
  }
  return json.jsonFindUserById(id);
}

export async function findUserByIdAsync(id: string): Promise<UserRecord | null> {
  if (isSupabaseEnabled()) return sb.sbFindUserById(id);
  return json.jsonFindUserById(id);
}

export function upsertUser(user: AuthUser): UserRecord {
  if (isSupabaseEnabled()) throw new Error("Use upsertUserAsync when Supabase is configured");
  return json.jsonUpsertUser(user);
}

export async function upsertUserAsync(user: AuthUser): Promise<UserRecord> {
  if (isSupabaseEnabled()) return sb.sbUpsertUser(user);
  return json.jsonUpsertUser(user);
}

export function updateUser(id: string, patch: Partial<UserRecord>): UserRecord | null {
  if (isSupabaseEnabled()) throw new Error("Use updateUserAsync when Supabase is configured");
  return json.jsonUpdateUser(id, patch);
}

export async function updateUserAsync(id: string, patch: Partial<UserRecord>): Promise<UserRecord | null> {
  if (isSupabaseEnabled()) return sb.sbUpdateUser(id, patch);
  return json.jsonUpdateUser(id, patch);
}

export function storeOtp(phone: string, code: string, name?: string): void {
  if (isSupabaseEnabled()) throw new Error("Use storeOtpAsync when Supabase is configured");
  json.jsonStoreOtp(phone, code, name);
}

export async function storeOtpAsync(phone: string, code: string, name?: string): Promise<void> {
  if (isSupabaseEnabled()) return sb.sbStoreOtp(phone, code, name);
  json.jsonStoreOtp(phone, code, name);
}

export function verifyOtp(phone: string, code: string): { valid: boolean; name?: string } {
  if (isSupabaseEnabled()) throw new Error("Use verifyOtpAsync when Supabase is configured");
  return json.jsonVerifyOtp(phone, code);
}

export async function verifyOtpAsync(phone: string, code: string): Promise<{ valid: boolean; name?: string }> {
  if (isSupabaseEnabled()) return sb.sbVerifyOtp(phone, code);
  return json.jsonVerifyOtp(phone, code);
}

export function getUserNotifications(userId: string): AppNotification[] {
  if (isSupabaseEnabled()) throw new Error("Use getUserNotificationsAsync when Supabase is configured");
  return json.jsonGetUserNotifications(userId);
}

export async function getUserNotificationsAsync(userId: string): Promise<AppNotification[]> {
  if (isSupabaseEnabled()) return sb.sbGetUserNotificationsAsync(userId);
  return json.jsonGetUserNotifications(userId);
}

export function setUserNotifications(userId: string, notifications: AppNotification[]): AppNotification[] {
  if (isSupabaseEnabled()) throw new Error("Use setUserNotificationsAsync when Supabase is configured");
  return json.jsonSetUserNotifications(userId, notifications);
}

export async function setUserNotificationsAsync(
  userId: string,
  notifications: AppNotification[],
): Promise<AppNotification[]> {
  if (isSupabaseEnabled()) return sb.sbSetUserNotificationsAsync(userId, notifications);
  return json.jsonSetUserNotifications(userId, notifications);
}

export function getUserAppData(userId: string): AppSyncPayload | null {
  if (isSupabaseEnabled()) throw new Error("Use getUserAppDataAsync when Supabase is configured");
  return json.jsonGetUserAppData(userId);
}

export async function getUserAppDataAsync(userId: string): Promise<AppSyncPayload | null> {
  if (isSupabaseEnabled()) return sb.sbGetUserAppDataAsync(userId);
  return json.jsonGetUserAppData(userId);
}

export function setUserAppData(userId: string, data: AppSyncPayload): AppSyncPayload {
  if (isSupabaseEnabled()) throw new Error("Use setUserAppDataAsync when Supabase is configured");
  return json.jsonSetUserAppData(userId, data);
}

export async function setUserAppDataAsync(userId: string, data: AppSyncPayload): Promise<AppSyncPayload> {
  if (isSupabaseEnabled()) return sb.sbSetUserAppDataAsync(userId, data);
  return json.jsonSetUserAppData(userId, data);
}

export async function getUsageAsync(userId: string, meter: UsageMeter): Promise<number> {
  if (isSupabaseEnabled()) return sb.sbGetUsage(userId, meter);
  return json.jsonGetUsage(userId, meter);
}

export async function incrementUsageAsync(userId: string, meter: UsageMeter): Promise<number> {
  if (isSupabaseEnabled()) return sb.sbIncrementUsage(userId, meter);
  return json.jsonIncrementUsage(userId, meter);
}

export async function syncUserSubscriptionAsync(
  userId: string,
  tier: SubscriptionTier,
  status: SubscriptionStatus,
  periodEnd: string | null,
  opts?: {
    billingInterval?: BillingInterval | null;
    provider?: BillingProvider | null;
    providerSubscriptionId?: string | null;
    cancelAtPeriodEnd?: boolean;
    periodStart?: string | null;
  },
): Promise<DbSubscription> {
  if (isSupabaseEnabled()) return sb.sbSyncUserSubscription(userId, tier, status, periodEnd, opts);
  return json.jsonSyncUserSubscription(userId, tier, status, periodEnd, opts);
}

export async function getActiveSubscriptionAsync(userId: string): Promise<DbSubscription | null> {
  if (isSupabaseEnabled()) return sb.sbGetActiveSubscription(userId);
  return json.jsonGetActiveSubscription(userId);
}

export async function createPaymentAsync(payment: Omit<DbPayment, "id" | "createdAt">): Promise<DbPayment> {
  if (isSupabaseEnabled()) return sb.sbCreatePayment(payment);
  return json.jsonCreatePayment(payment);
}

export async function findSubscriptionByProviderIdAsync(providerSubId: string): Promise<DbSubscription | null> {
  if (isSupabaseEnabled()) return sb.sbFindSubscriptionByProviderId(providerSubId);
  return json.jsonFindSubscriptionByProviderId(providerSubId);
}

export async function getBillingCustomerAsync(
  userId: string,
  provider: "stripe" | "razorpay",
): Promise<BillingCustomerRow | null> {
  if (isSupabaseEnabled()) return sb.sbGetBillingCustomer(userId, provider);
  return json.jsonGetBillingCustomer(userId, provider);
}

export async function upsertBillingCustomerAsync(row: BillingCustomerRow): Promise<BillingCustomerRow> {
  if (isSupabaseEnabled()) return sb.sbUpsertBillingCustomer(row);
  return json.jsonUpsertBillingCustomer(row);
}

export async function getWearablesAsync(userId: string): Promise<DbWearableDevice[]> {
  if (isSupabaseEnabled()) return sb.sbGetWearables(userId);
  return json.jsonGetWearables(userId);
}

export async function addWearableAsync(
  device: Omit<DbWearableDevice, "id" | "createdAt">,
): Promise<DbWearableDevice> {
  if (isSupabaseEnabled()) return sb.sbAddWearable(device);
  return json.jsonAddWearable(device);
}

export async function removeWearableAsync(userId: string, deviceId: string): Promise<boolean> {
  if (isSupabaseEnabled()) return sb.sbRemoveWearable(userId, deviceId);
  return json.jsonRemoveWearable(userId, deviceId);
}

export async function updateWearableSyncAsync(deviceId: string): Promise<void> {
  if (isSupabaseEnabled()) return sb.sbUpdateWearableSync(deviceId);
}

export async function getPartnerInvitesAsync(userId: string): Promise<DbPartnerInvite[]> {
  if (isSupabaseEnabled()) return sb.sbGetPartnerInvites(userId);
  return json.jsonGetPartnerInvites(userId);
}

export async function createPartnerInviteAsync(
  invite: Omit<DbPartnerInvite, "id" | "createdAt" | "acceptedAt">,
): Promise<DbPartnerInvite> {
  if (isSupabaseEnabled()) return sb.sbCreatePartnerInvite(invite);
  return json.jsonCreatePartnerInvite(invite);
}

export async function getReportsAsync(userId: string): Promise<DbWellnessReport[]> {
  if (isSupabaseEnabled()) return sb.sbGetReports(userId);
  return json.jsonGetReports(userId);
}

export async function createReportAsync(
  report: Omit<DbWellnessReport, "id" | "createdAt">,
): Promise<DbWellnessReport> {
  if (isSupabaseEnabled()) return sb.sbCreateReport(report);
  return json.jsonCreateReport(report);
}

export async function getReportAsync(userId: string, reportId: string): Promise<DbWellnessReport | null> {
  if (isSupabaseEnabled()) return sb.sbGetReport(userId, reportId);
  return json.jsonGetReport(userId, reportId);
}

export async function setUserPasswordAsync(userId: string, passwordHash: string): Promise<void> {
  if (isSupabaseEnabled()) return sb.sbSetUserPassword(userId, passwordHash);
  json.jsonSetUserPassword(userId, passwordHash);
}

export async function getUserPasswordHashAsync(userId: string): Promise<string | null> {
  if (isSupabaseEnabled()) return sb.sbGetUserPasswordHash(userId);
  return json.jsonGetUserPasswordHash(userId);
}

export async function userHasPasswordAsync(userId: string): Promise<boolean> {
  if (isSupabaseEnabled()) return sb.sbUserHasPassword(userId);
  return json.jsonUserHasPassword(userId);
}

export async function hydrateUserSubscription(user: UserRecord): Promise<UserRecord> {
  if (isSupabaseEnabled()) {
    const refreshed = await sb.sbFindUserById(user.id);
    return refreshed ?? user;
  }
  const sub = await getActiveSubscriptionAsync(user.id);
  if (!sub) {
    return { ...user, subscription: { tier: "free", expiresAt: null, startedAt: null } };
  }
  return {
    ...user,
    subscription: {
      tier: sub.tier,
      expiresAt: sub.currentPeriodEnd,
      startedAt: sub.currentPeriodStart,
      status: sub.status,
      billingInterval: sub.billingInterval,
      provider: sub.provider,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    },
  };
}
