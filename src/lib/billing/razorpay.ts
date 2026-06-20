import Razorpay from "razorpay";
import crypto from "crypto";
import type { BillingProviderAdapter, CheckoutParams, CheckoutResult, BillingEvent } from "@/lib/billing/types";
import { getProviderPriceId, getAmountPaise, periodEndFromInterval } from "@/lib/billing/catalog";
import { getBillingCustomerAsync, upsertBillingCustomerAsync } from "@/lib/billing/sync";

function getRazorpay(): InstanceType<typeof Razorpay> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay keys not configured");
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export const razorpayAdapter: BillingProviderAdapter = {
  name: "razorpay",

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    const razorpay = getRazorpay();
    const planId = getProviderPriceId("razorpay", params.tier, params.interval);
    const amountPaise = getAmountPaise(params.tier, params.interval);

    let customerId: string | undefined;
    const existing = await getBillingCustomerAsync(params.userId, "razorpay");
    if (existing) {
      customerId = existing.providerCustomerId;
    } else {
      const customer = await razorpay.customers.create({
        name: params.userName,
        contact: params.userPhone.replace(/\D/g, "").slice(-10),
        notes: { userId: params.userId },
      });
      customerId = customer.id;
      await upsertBillingCustomerAsync({
        userId: params.userId,
        provider: "razorpay",
        providerCustomerId: customer.id,
      });
    }

    if (planId) {
      const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        total_count: params.interval === "year" ? 1 : 12,
        notes: { userId: params.userId, tier: params.tier, interval: params.interval, customerId },
      } as Parameters<typeof razorpay.subscriptions.create>[0]);
      return {
        url: `${params.successUrl}?subscription_id=${subscription.id}&provider=razorpay`,
        sessionId: subscription.id,
      };
    }

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `hw_${params.userId}_${Date.now()}`,
      notes: {
        userId: params.userId,
        tier: params.tier,
        interval: params.interval,
      },
    });

    return {
      url: `${params.successUrl}?order_id=${order.id}&provider=razorpay&amount=${amountPaise}`,
      sessionId: order.id,
    };
  },

  async verifyWebhook(body: string, signature: string): Promise<BillingEvent[]> {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) throw new Error("RAZORPAY_WEBHOOK_SECRET not configured");

    const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
    if (expected !== signature) throw new Error("Invalid Razorpay webhook signature");

    const payload = JSON.parse(body) as {
      event: string;
      payload: {
        subscription?: { entity: Record<string, unknown> };
        payment?: { entity: Record<string, unknown> };
      };
    };

    const events: BillingEvent[] = [];
    const entity = payload.payload.subscription?.entity ?? payload.payload.payment?.entity;
    if (!entity) return events;

    const notes = (entity.notes ?? {}) as Record<string, string>;
    const userId = notes.userId;
    const tier = notes.tier as CheckoutParams["tier"] | undefined;
    const interval = (notes.interval ?? "month") as CheckoutParams["interval"];

    if (payload.event === "subscription.activated" && userId && tier) {
      events.push({
        type: "subscription.activated",
        userId,
        tier,
        interval,
        periodStart: new Date().toISOString(),
        periodEnd: periodEndFromInterval(interval),
        providerSubId: String(entity.id),
        provider: "razorpay",
      });
    }

    if (payload.event === "subscription.charged" && userId) {
      events.push({
        type: "subscription.renewed",
        userId,
        periodEnd: periodEndFromInterval(interval),
        providerSubId: String(entity.id ?? entity.subscription_id),
      });
      events.push({
        type: "payment.succeeded",
        userId,
        amountPaise: Number(entity.amount ?? 0),
        providerPaymentId: String(entity.id),
        provider: "razorpay",
        subscriptionId: String(entity.subscription_id ?? entity.id),
      });
    }

    if (payload.event === "subscription.cancelled" && userId) {
      events.push({
        type: "subscription.canceled",
        userId,
        providerSubId: String(entity.id),
        cancelAtPeriodEnd: Boolean(entity.cancel_at_cycle_end),
      });
    }

    if (payload.event === "payment.failed" && userId) {
      events.push({
        type: "payment.failed",
        userId,
        reason: String(entity.error_description ?? "payment_failed"),
        provider: "razorpay",
      });
    }

    return events;
  },
};
