import { getSupabaseAdmin } from "@/lib/db/supabase";
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
import { normalizeTier } from "@/lib/subscription";
import { DEFAULT_NOTIFICATION_PREFS } from "@/lib/notifications";

function mapSubscriptionRow(row: Record<string, unknown>): DbSubscription {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    tier: normalizeTier(String(row.tier)),
    status: row.status as SubscriptionStatus,
    billingInterval: (row.billing_interval as BillingInterval) ?? null,
    currentPeriodStart: row.current_period_start
      ? new Date(String(row.current_period_start)).toISOString()
      : null,
    currentPeriodEnd: row.current_period_end
      ? new Date(String(row.current_period_end)).toISOString()
      : null,
    provider: (row.provider as BillingProvider) ?? null,
    providerSubscriptionId: (row.provider_subscription_id as string) ?? null,
    cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

function mapUserRow(row: Record<string, unknown>, sub: DbSubscription | null): UserRecord {
  return {
    id: String(row.id),
    phone: String(row.phone),
    name: String(row.name),
    createdAt: new Date(String(row.created_at)).toISOString(),
    subscription: sub
      ? {
          tier: sub.tier,
          expiresAt: sub.currentPeriodEnd,
          startedAt: sub.currentPeriodStart,
          status: sub.status,
          billingInterval: sub.billingInterval,
          provider: sub.provider,
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        }
      : { tier: "free", expiresAt: null, startedAt: null },
    notificationPrefs: { ...DEFAULT_NOTIFICATION_PREFS, ...(row.notification_prefs as object) },
    aiQuestionsUsed: Number(row.ai_questions_used ?? 0),
    aiQuestionsResetAt: new Date(String(row.ai_questions_reset_at)).toISOString(),
    notifications: (row.notifications as AppNotification[]) ?? [],
    appData: (row.app_data as AppSyncPayload) ?? null,
    passwordHash: (row.password_hash as string) ?? null,
  };
}

async function getActiveSubscription(userId: string): Promise<DbSubscription | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["active", "past_due"])
    .order("current_period_end", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return mapSubscriptionRow(data as Record<string, unknown>);
}

async function hydrateUser(row: Record<string, unknown>): Promise<UserRecord> {
  const sub = await getActiveSubscription(String(row.id));
  return mapUserRow(row, sub);
}

function currentPeriodStart(): string {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

export async function sbFindUserByPhone(phone: string): Promise<UserRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("users").select("*").eq("phone", phone).maybeSingle();
  if (error || !data) return null;
  return hydrateUser(data as Record<string, unknown>);
}

export async function sbFindUserById(id: string): Promise<UserRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("users").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return hydrateUser(data as Record<string, unknown>);
}

export async function sbUpsertUser(user: AuthUser): Promise<UserRecord> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("users").upsert(
    {
      id: user.id,
      phone: user.phone,
      name: user.name,
      created_at: user.createdAt,
      notification_prefs: user.notificationPrefs,
      ai_questions_used: user.aiQuestionsUsed,
      ai_questions_reset_at: user.aiQuestionsResetAt,
    },
    { onConflict: "id" },
  );
  if (error) throw new Error(error.message);
  return (await sbFindUserById(user.id))!;
}

export async function sbUpdateUser(id: string, patch: Partial<UserRecord>): Promise<UserRecord | null> {
  const existing = await sbFindUserById(id);
  if (!existing) return null;
  const merged = { ...existing, ...patch };
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("users")
    .update({
      name: merged.name,
      notification_prefs: merged.notificationPrefs,
      ai_questions_used: merged.aiQuestionsUsed,
      ai_questions_reset_at: merged.aiQuestionsResetAt,
      notifications: merged.notifications,
      app_data: merged.appData,
      ...(patch.passwordHash !== undefined ? { password_hash: patch.passwordHash } : {}),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  return sbFindUserById(id);
}

export async function sbStoreOtp(phone: string, code: string, name?: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("otps").upsert(
    { phone, code, expires_at: Date.now() + 5 * 60 * 1000, name: name ?? null },
    { onConflict: "phone" },
  );
  if (error) throw new Error(error.message);
}

export async function sbVerifyOtp(phone: string, code: string): Promise<{ valid: boolean; name?: string }> {
  const supabase = getSupabaseAdmin();
  const { data: entry, error } = await supabase.from("otps").select("*").eq("phone", phone).maybeSingle();
  if (error || !entry) return { valid: false };
  if (Date.now() > Number(entry.expires_at)) {
    await supabase.from("otps").delete().eq("phone", phone);
    return { valid: false };
  }
  if (entry.code !== code) return { valid: false };
  const name = entry.name as string | undefined;
  await supabase.from("otps").delete().eq("phone", phone);
  return { valid: true, name };
}

export function sbGetUserNotifications(userId: string): never {
  throw new Error("Use sbGetUserNotificationsAsync in Supabase mode");
}

export async function sbGetUserNotificationsAsync(userId: string): Promise<AppNotification[]> {
  const user = await sbFindUserById(userId);
  return user?.notifications ?? [];
}

export function sbSetUserNotifications(userId: string, notifications: AppNotification[]): never {
  throw new Error("Use sbSetUserNotificationsAsync in Supabase mode");
}

export async function sbSetUserNotificationsAsync(
  userId: string,
  notifications: AppNotification[],
): Promise<AppNotification[]> {
  await sbUpdateUser(userId, { notifications });
  return notifications;
}

export function sbGetUserAppData(userId: string): never {
  throw new Error("Use sbGetUserAppDataAsync in Supabase mode");
}

export async function sbGetUserAppDataAsync(userId: string): Promise<AppSyncPayload | null> {
  const user = await sbFindUserById(userId);
  return user?.appData ?? null;
}

export function sbSetUserAppData(userId: string, data: AppSyncPayload): never {
  throw new Error("Use sbSetUserAppDataAsync in Supabase mode");
}

export async function sbSetUserAppDataAsync(userId: string, data: AppSyncPayload): Promise<AppSyncPayload> {
  await sbUpdateUser(userId, { appData: data });
  return data;
}

export async function sbGetUsage(userId: string, meter: UsageMeter): Promise<number> {
  const supabase = getSupabaseAdmin();
  const periodStart = currentPeriodStart();
  const { data } = await supabase
    .from("usage_counters")
    .select("count")
    .eq("user_id", userId)
    .eq("meter", meter)
    .eq("period_start", periodStart)
    .maybeSingle();
  return Number(data?.count ?? 0);
}

export async function sbIncrementUsage(userId: string, meter: UsageMeter): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("increment_usage_counter", {
    p_user_id: userId,
    p_meter: meter,
    p_period_start: currentPeriodStart(),
  });
  if (error) throw new Error(error.message);
  return Number(data);
}

export async function sbSyncUserSubscription(
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
  const supabase = getSupabaseAdmin();
  const existing = await getActiveSubscription(userId);
  const now = new Date().toISOString();

  if (existing?.id) {
    const { error } = await supabase
      .from("subscriptions")
      .update({
        tier,
        status,
        billing_interval: opts?.billingInterval ?? existing.billingInterval,
        current_period_start: opts?.periodStart ?? existing.currentPeriodStart ?? now,
        current_period_end: periodEnd,
        provider: opts?.provider ?? existing.provider,
        provider_subscription_id: opts?.providerSubscriptionId ?? existing.providerSubscriptionId,
        cancel_at_period_end: opts?.cancelAtPeriodEnd ?? false,
        updated_at: now,
      })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("subscriptions").insert({
      id: crypto.randomUUID(),
      user_id: userId,
      tier,
      status,
      billing_interval: opts?.billingInterval ?? null,
      current_period_start: opts?.periodStart ?? now,
      current_period_end: periodEnd,
      provider: opts?.provider ?? "demo",
      provider_subscription_id: opts?.providerSubscriptionId ?? null,
      cancel_at_period_end: opts?.cancelAtPeriodEnd ?? false,
    });
    if (error) throw new Error(error.message);
  }

  return (await getActiveSubscription(userId))!;
}

export async function sbGetActiveSubscription(userId: string): Promise<DbSubscription | null> {
  return getActiveSubscription(userId);
}

export async function sbCreatePayment(payment: Omit<DbPayment, "id" | "createdAt">): Promise<DbPayment> {
  const supabase = getSupabaseAdmin();
  const id = crypto.randomUUID();
  const { error } = await supabase.from("payments").insert({
    id,
    user_id: payment.userId,
    subscription_id: payment.subscriptionId,
    amount_paise: payment.amountPaise,
    currency: payment.currency,
    status: payment.status,
    provider: payment.provider,
    provider_payment_id: payment.providerPaymentId,
    provider_invoice_id: payment.providerInvoiceId,
    metadata: payment.metadata,
  });
  if (error) throw new Error(error.message);
  return { ...payment, id, createdAt: new Date().toISOString() };
}

export async function sbFindSubscriptionByProviderId(providerSubId: string): Promise<DbSubscription | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("provider_subscription_id", providerSubId)
    .maybeSingle();
  if (error || !data) return null;
  return mapSubscriptionRow(data as Record<string, unknown>);
}

export async function sbGetBillingCustomer(
  userId: string,
  provider: "stripe" | "razorpay",
): Promise<BillingCustomerRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("billing_customers")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", provider)
    .maybeSingle();
  if (error || !data) return null;
  return {
    userId: String(data.user_id),
    provider: data.provider as "stripe" | "razorpay",
    providerCustomerId: String(data.provider_customer_id),
  };
}

export async function sbUpsertBillingCustomer(row: BillingCustomerRow): Promise<BillingCustomerRow> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("billing_customers").upsert(
    {
      user_id: row.userId,
      provider: row.provider,
      provider_customer_id: row.providerCustomerId,
    },
    { onConflict: "user_id,provider" },
  );
  if (error) throw new Error(error.message);
  return row;
}

export async function sbGetWearables(userId: string): Promise<DbWearableDevice[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("wearable_devices").select("*").eq("user_id", userId);
  if (error || !data) return [];
  return data.map((row) => ({
    id: String(row.id),
    userId: String(row.user_id),
    provider: String(row.provider),
    externalId: String(row.external_id),
    deviceName: row.device_name as string | null,
    lastSyncAt: row.last_sync_at ? new Date(String(row.last_sync_at)).toISOString() : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
  }));
}

export async function sbAddWearable(
  device: Omit<DbWearableDevice, "id" | "createdAt">,
): Promise<DbWearableDevice> {
  const supabase = getSupabaseAdmin();
  const id = crypto.randomUUID();
  const { error } = await supabase.from("wearable_devices").insert({
    id,
    user_id: device.userId,
    provider: device.provider,
    external_id: device.externalId,
    device_name: device.deviceName,
    last_sync_at: device.lastSyncAt,
  });
  if (error) throw new Error(error.message);
  return { ...device, id, createdAt: new Date().toISOString() };
}

export async function sbRemoveWearable(userId: string, deviceId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { error, count } = await supabase
    .from("wearable_devices")
    .delete({ count: "exact" })
    .eq("user_id", userId)
    .eq("id", deviceId);
  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

export async function sbUpdateWearableSync(deviceId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("wearable_devices")
    .update({ last_sync_at: new Date().toISOString() })
    .eq("id", deviceId);
  if (error) throw new Error(error.message);
}

export async function sbGetPartnerInvites(userId: string): Promise<DbPartnerInvite[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("partner_invites")
    .select("*")
    .or(`inviter_id.eq.${userId},invitee_id.eq.${userId}`);
  if (error || !data) return [];
  return data.map((row) => ({
    id: String(row.id),
    inviterId: String(row.inviter_id),
    inviteePhone: String(row.invitee_phone),
    inviteeId: row.invitee_id ? String(row.invitee_id) : null,
    status: row.status as DbPartnerInvite["status"],
    createdAt: new Date(String(row.created_at)).toISOString(),
    acceptedAt: row.accepted_at ? new Date(String(row.accepted_at)).toISOString() : null,
  }));
}

export async function sbCreatePartnerInvite(
  invite: Omit<DbPartnerInvite, "id" | "createdAt" | "acceptedAt">,
): Promise<DbPartnerInvite> {
  const supabase = getSupabaseAdmin();
  const id = crypto.randomUUID();
  const { error } = await supabase.from("partner_invites").insert({
    id,
    inviter_id: invite.inviterId,
    invitee_phone: invite.inviteePhone,
    invitee_id: invite.inviteeId,
    status: invite.status,
  });
  if (error) throw new Error(error.message);
  return { ...invite, id, createdAt: new Date().toISOString(), acceptedAt: null };
}

export async function sbGetReports(userId: string): Promise<DbWellnessReport[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("wellness_reports")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => ({
    id: String(row.id),
    userId: String(row.user_id),
    reportType: row.report_type as "weekly" | "monthly",
    periodStart: String(row.period_start),
    periodEnd: String(row.period_end),
    title: String(row.title),
    summary: row.summary as Record<string, unknown>,
    content: String(row.content),
    createdAt: new Date(String(row.created_at)).toISOString(),
  }));
}

export async function sbCreateReport(
  report: Omit<DbWellnessReport, "id" | "createdAt">,
): Promise<DbWellnessReport> {
  const supabase = getSupabaseAdmin();
  const id = crypto.randomUUID();
  const { error } = await supabase.from("wellness_reports").insert({
    id,
    user_id: report.userId,
    report_type: report.reportType,
    period_start: report.periodStart,
    period_end: report.periodEnd,
    title: report.title,
    summary: report.summary,
    content: report.content,
  });
  if (error) throw new Error(error.message);
  return { ...report, id, createdAt: new Date().toISOString() };
}

export async function sbGetReport(userId: string, reportId: string): Promise<DbWellnessReport | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("wellness_reports")
    .select("*")
    .eq("user_id", userId)
    .eq("id", reportId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: String(data.id),
    userId: String(data.user_id),
    reportType: data.report_type as "weekly" | "monthly",
    periodStart: String(data.period_start),
    periodEnd: String(data.period_end),
    title: String(data.title),
    summary: data.summary as Record<string, unknown>,
    content: String(data.content),
    createdAt: new Date(String(data.created_at)).toISOString(),
  };
}

export async function sbSetUserPassword(userId: string, passwordHash: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("users").update({ password_hash: passwordHash }).eq("id", userId);
  if (error) throw new Error(error.message);
}

export async function sbGetUserPasswordHash(userId: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("users").select("password_hash").eq("id", userId).maybeSingle();
  if (error || !data) return null;
  return (data.password_hash as string) ?? null;
}

export async function sbUserHasPassword(userId: string): Promise<boolean> {
  return Boolean(await sbGetUserPasswordHash(userId));
}
