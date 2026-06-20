import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import type { AuthUser } from "@/lib/auth-types";
import type { AppNotification } from "@/lib/notifications";
import type { AppSyncPayload } from "@/lib/sync-types";
import type {
  UserRecord,
  DbSubscription,
  DbPayment,
  UsageCounterRow,
  DbWearableDevice,
  DbPartnerInvite,
  DbWellnessReport,
  BillingCustomerRow,
} from "@/lib/db/types";
import type { SubscriptionTier, BillingInterval, BillingProvider, SubscriptionStatus } from "@/lib/subscription";
import type { UsageMeter } from "@/lib/subscription/limits";
import { normalizeTier } from "@/lib/subscription";

interface JsonDatabase {
  users: Record<string, UserRecord>;
  otps: Record<string, { code: string; expiresAt: number; name?: string }>;
  subscriptions: Record<string, DbSubscription[]>;
  payments: DbPayment[];
  usageCounters: UsageCounterRow[];
  wearableDevices: DbWearableDevice[];
  partnerInvites: DbPartnerInvite[];
  wellnessReports: DbWellnessReport[];
  billingCustomers: BillingCustomerRow[];
}

const DATA_DIR = join(process.cwd(), "data");
const DB_PATH = join(DATA_DIR, "users.json");

function ensureDb(): JsonDatabase {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DB_PATH)) {
    const empty: JsonDatabase = {
      users: {},
      otps: {},
      subscriptions: {},
      payments: [],
      usageCounters: [],
      wearableDevices: [],
      partnerInvites: [],
      wellnessReports: [],
      billingCustomers: [],
    };
    writeFileSync(DB_PATH, JSON.stringify(empty, null, 2));
    return empty;
  }
  const raw = JSON.parse(readFileSync(DB_PATH, "utf-8")) as Partial<JsonDatabase>;
  return {
    users: raw.users ?? {},
    otps: raw.otps ?? {},
    subscriptions: raw.subscriptions ?? {},
    payments: raw.payments ?? [],
    usageCounters: raw.usageCounters ?? [],
    wearableDevices: raw.wearableDevices ?? [],
    partnerInvites: raw.partnerInvites ?? [],
    wellnessReports: raw.wellnessReports ?? [],
    billingCustomers: raw.billingCustomers ?? [],
  };
}

function saveDb(db: JsonDatabase): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function currentPeriodStart(): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function jsonFindUserByPhone(phone: string): UserRecord | null {
  const db = ensureDb();
  return Object.values(db.users).find((u) => u.phone === phone) ?? null;
}

export function jsonFindUserById(id: string): UserRecord | null {
  return ensureDb().users[id] ?? null;
}

export function jsonUpsertUser(user: AuthUser): UserRecord {
  const db = ensureDb();
  const existing = db.users[user.id];
  const record: UserRecord = {
    ...user,
    subscription: { ...user.subscription, tier: normalizeTier(user.subscription.tier) },
    notifications: existing?.notifications ?? [],
    appData: existing?.appData,
    passwordHash: existing?.passwordHash ?? null,
  };
  db.users[user.id] = record;
  saveDb(db);
  return record;
}

export function jsonUpdateUser(id: string, patch: Partial<UserRecord>): UserRecord | null {
  const db = ensureDb();
  const user = db.users[id];
  if (!user) return null;
  db.users[id] = { ...user, ...patch };
  saveDb(db);
  return db.users[id];
}

export function jsonStoreOtp(phone: string, code: string, name?: string): void {
  const db = ensureDb();
  db.otps[phone] = { code, expiresAt: Date.now() + 5 * 60 * 1000, name };
  saveDb(db);
}

export function jsonVerifyOtp(phone: string, code: string): { valid: boolean; name?: string } {
  const db = ensureDb();
  const entry = db.otps[phone];
  if (!entry) return { valid: false };
  if (Date.now() > entry.expiresAt) {
    delete db.otps[phone];
    saveDb(db);
    return { valid: false };
  }
  if (entry.code !== code) return { valid: false };
  const name = entry.name;
  delete db.otps[phone];
  saveDb(db);
  return { valid: true, name };
}

export function jsonGetUserNotifications(userId: string): AppNotification[] {
  return ensureDb().users[userId]?.notifications ?? [];
}

export function jsonSetUserNotifications(userId: string, notifications: AppNotification[]): AppNotification[] {
  jsonUpdateUser(userId, { notifications });
  return notifications;
}

export function jsonGetUserAppData(userId: string): AppSyncPayload | null {
  return ensureDb().users[userId]?.appData ?? null;
}

export function jsonSetUserAppData(userId: string, data: AppSyncPayload): AppSyncPayload {
  jsonUpdateUser(userId, { appData: data });
  return data;
}

export function jsonGetActiveSubscription(userId: string): DbSubscription | null {
  const subs = ensureDb().subscriptions[userId] ?? [];
  const active = subs
    .filter((s) => s.status === "active" || s.status === "past_due")
    .sort((a, b) => (b.currentPeriodEnd ?? "").localeCompare(a.currentPeriodEnd ?? ""));
  return active[0] ?? null;
}

export function jsonUpsertSubscription(
  sub: Omit<DbSubscription, "id" | "createdAt" | "updatedAt"> & { id?: string },
): DbSubscription {
  const db = ensureDb();
  const now = new Date().toISOString();
  const record: DbSubscription = {
    id: sub.id ?? crypto.randomUUID(),
    userId: sub.userId,
    tier: normalizeTier(sub.tier),
    status: sub.status,
    billingInterval: sub.billingInterval ?? null,
    currentPeriodStart: sub.currentPeriodStart ?? null,
    currentPeriodEnd: sub.currentPeriodEnd ?? null,
    provider: sub.provider ?? null,
    providerSubscriptionId: sub.providerSubscriptionId ?? null,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd ?? false,
    createdAt: now,
    updatedAt: now,
  };
  if (!db.subscriptions[sub.userId]) db.subscriptions[sub.userId] = [];
  const idx = db.subscriptions[sub.userId].findIndex((s) => s.id === record.id);
  if (idx >= 0) {
    db.subscriptions[sub.userId][idx] = { ...db.subscriptions[sub.userId][idx], ...record, updatedAt: now };
  } else {
    db.subscriptions[sub.userId].unshift(record);
  }
  saveDb(db);
  return record;
}

export function jsonCreatePayment(payment: Omit<DbPayment, "id" | "createdAt">): DbPayment {
  const db = ensureDb();
  const record: DbPayment = { ...payment, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  db.payments.unshift(record);
  saveDb(db);
  return record;
}

export function jsonGetUsage(userId: string, meter: UsageMeter): number {
  const period = currentPeriodStart();
  const row = ensureDb().usageCounters.find(
    (u) => u.userId === userId && u.meter === meter && u.periodStart === period,
  );
  return row?.count ?? 0;
}

export function jsonIncrementUsage(userId: string, meter: UsageMeter): number {
  const db = ensureDb();
  const period = currentPeriodStart();
  const idx = db.usageCounters.findIndex(
    (u) => u.userId === userId && u.meter === meter && u.periodStart === period,
  );
  if (idx >= 0) {
    db.usageCounters[idx].count += 1;
    saveDb(db);
    return db.usageCounters[idx].count;
  }
  db.usageCounters.push({ userId, meter, periodStart: period, count: 1 });
  saveDb(db);
  return 1;
}

export function jsonGetWearables(userId: string): DbWearableDevice[] {
  return ensureDb().wearableDevices.filter((d) => d.userId === userId);
}

export function jsonAddWearable(device: Omit<DbWearableDevice, "id" | "createdAt">): DbWearableDevice {
  const db = ensureDb();
  const record: DbWearableDevice = { ...device, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  db.wearableDevices.push(record);
  saveDb(db);
  return record;
}

export function jsonRemoveWearable(userId: string, deviceId: string): boolean {
  const db = ensureDb();
  const before = db.wearableDevices.length;
  db.wearableDevices = db.wearableDevices.filter((d) => !(d.userId === userId && d.id === deviceId));
  saveDb(db);
  return db.wearableDevices.length < before;
}

export function jsonGetPartnerInvites(userId: string): DbPartnerInvite[] {
  const db = ensureDb();
  return db.partnerInvites.filter((p) => p.inviterId === userId || p.inviteeId === userId);
}

export function jsonCreatePartnerInvite(invite: Omit<DbPartnerInvite, "id" | "createdAt" | "acceptedAt">): DbPartnerInvite {
  const db = ensureDb();
  const record: DbPartnerInvite = {
    ...invite,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    acceptedAt: null,
  };
  db.partnerInvites.push(record);
  saveDb(db);
  return record;
}

export function jsonGetReports(userId: string): DbWellnessReport[] {
  return ensureDb().wellnessReports.filter((r) => r.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function jsonCreateReport(report: Omit<DbWellnessReport, "id" | "createdAt">): DbWellnessReport {
  const db = ensureDb();
  const record: DbWellnessReport = { ...report, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  db.wellnessReports.unshift(record);
  saveDb(db);
  return record;
}

export function jsonGetReport(userId: string, reportId: string): DbWellnessReport | null {
  return ensureDb().wellnessReports.find((r) => r.userId === userId && r.id === reportId) ?? null;
}

export function jsonGetBillingCustomer(userId: string, provider: "stripe" | "razorpay"): BillingCustomerRow | null {
  return ensureDb().billingCustomers.find((c) => c.userId === userId && c.provider === provider) ?? null;
}

export function jsonUpsertBillingCustomer(row: BillingCustomerRow): BillingCustomerRow {
  const db = ensureDb();
  const idx = db.billingCustomers.findIndex((c) => c.userId === row.userId && c.provider === row.provider);
  if (idx >= 0) db.billingCustomers[idx] = row;
  else db.billingCustomers.push(row);
  saveDb(db);
  return row;
}

export function jsonFindSubscriptionByProviderId(providerSubId: string): DbSubscription | null {
  const db = ensureDb();
  for (const subs of Object.values(db.subscriptions)) {
    const found = subs.find((s) => s.providerSubscriptionId === providerSubId);
    if (found) return found;
  }
  return null;
}

export function jsonSyncUserSubscription(userId: string, tier: SubscriptionTier, status: SubscriptionStatus, periodEnd: string | null, opts?: {
  billingInterval?: BillingInterval | null;
  provider?: BillingProvider | null;
  providerSubscriptionId?: string | null;
  cancelAtPeriodEnd?: boolean;
}): DbSubscription {
  const existing = jsonGetActiveSubscription(userId);
  return jsonUpsertSubscription({
    ...(existing?.id ? { id: existing.id } : {}),
    userId,
    tier,
    status,
    billingInterval: opts?.billingInterval ?? existing?.billingInterval ?? null,
    currentPeriodStart: existing?.currentPeriodStart ?? new Date().toISOString(),
    currentPeriodEnd: periodEnd,
    provider: opts?.provider ?? existing?.provider ?? "demo",
    providerSubscriptionId: opts?.providerSubscriptionId ?? existing?.providerSubscriptionId ?? null,
    cancelAtPeriodEnd: opts?.cancelAtPeriodEnd ?? false,
  });
}

export function jsonSetUserPassword(userId: string, passwordHash: string): void {
  jsonUpdateUser(userId, { passwordHash });
}

export function jsonGetUserPasswordHash(userId: string): string | null {
  return ensureDb().users[userId]?.passwordHash ?? null;
}

export function jsonUserHasPassword(userId: string): boolean {
  return Boolean(jsonGetUserPasswordHash(userId));
}
