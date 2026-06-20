import type { AuthUser } from "@/lib/auth-types";
import type { AppNotification, NotificationPreferences } from "@/lib/notifications";
import type { AppSyncPayload } from "@/lib/sync-types";
import type { Subscription, SubscriptionStatus, BillingInterval, BillingProvider } from "@/lib/subscription";
import type { UsageMeter } from "@/lib/subscription/limits";

export interface UserRecord extends AuthUser {
  /** Server-only; never expose to client */
  passwordHash?: string | null;
  notifications: AppNotification[];
  appData?: AppSyncPayload | null;
}

export interface DbSubscription {
  id: string;
  userId: string;
  tier: Subscription["tier"];
  status: SubscriptionStatus;
  billingInterval: BillingInterval | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  provider: BillingProvider | null;
  providerSubscriptionId: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbPayment {
  id: string;
  userId: string;
  subscriptionId: string | null;
  amountPaise: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  provider: BillingProvider;
  providerPaymentId: string | null;
  providerInvoiceId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface DbWearableDevice {
  id: string;
  userId: string;
  provider: string;
  externalId: string;
  deviceName: string | null;
  lastSyncAt: string | null;
  createdAt: string;
}

export interface DbPartnerInvite {
  id: string;
  inviterId: string;
  inviteePhone: string;
  inviteeId: string | null;
  status: "pending" | "accepted" | "revoked";
  createdAt: string;
  acceptedAt: string | null;
}

export interface DbWellnessReport {
  id: string;
  userId: string;
  reportType: "weekly" | "monthly";
  periodStart: string;
  periodEnd: string;
  title: string;
  summary: Record<string, unknown>;
  content: string;
  createdAt: string;
}

export interface UsageCounterRow {
  userId: string;
  meter: UsageMeter;
  periodStart: string;
  count: number;
}

export interface BillingCustomerRow {
  userId: string;
  provider: "stripe" | "razorpay";
  providerCustomerId: string;
}
