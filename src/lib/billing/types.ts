import type { PaidTier, BillingInterval, BillingProvider } from "@/lib/subscription";

export type BillingEvent =
  | {
      type: "subscription.activated";
      userId: string;
      tier: PaidTier;
      interval: BillingInterval;
      periodStart: string;
      periodEnd: string;
      providerSubId: string;
      provider: BillingProvider;
    }
  | {
      type: "subscription.renewed";
      userId: string;
      periodEnd: string;
      providerSubId: string;
    }
  | {
      type: "subscription.canceled";
      userId: string;
      providerSubId: string;
      cancelAtPeriodEnd: boolean;
    }
  | {
      type: "subscription.past_due";
      userId: string;
      providerSubId: string;
      periodEnd: string;
    }
  | {
      type: "payment.succeeded";
      userId: string;
      amountPaise: number;
      providerPaymentId: string;
      providerInvoiceId?: string;
      provider: BillingProvider;
      subscriptionId?: string;
    }
  | {
      type: "payment.failed";
      userId: string;
      reason: string;
      provider: BillingProvider;
    };

export interface CheckoutParams {
  userId: string;
  userEmail?: string;
  userPhone: string;
  userName: string;
  tier: PaidTier;
  interval: BillingInterval;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  url: string;
  sessionId: string;
}

export interface BillingProviderAdapter {
  name: BillingProvider;
  createCheckout(params: CheckoutParams): Promise<CheckoutResult>;
  verifyWebhook(body: string, signature: string): Promise<BillingEvent[]>;
  createPortalSession?(customerId: string, returnUrl: string): Promise<string>;
}

export function isDemoMode(): boolean {
  return process.env.BILLING_DEMO_MODE === "true";
}

export function getDefaultProvider(): "stripe" | "razorpay" {
  const p = process.env.BILLING_DEFAULT_PROVIDER;
  if (p === "stripe" || p === "razorpay") return p;
  return "razorpay";
}
