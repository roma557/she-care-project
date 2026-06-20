import {
  syncUserSubscriptionAsync,
  createPaymentAsync,
  findSubscriptionByProviderIdAsync,
  upsertBillingCustomerAsync,
  getBillingCustomerAsync,
  findUserByIdAsync,
} from "@/lib/db";
import type { BillingEvent } from "@/lib/billing/types";
import type { PaidTier } from "@/lib/subscription";

export async function applyBillingEvents(events: BillingEvent[]): Promise<void> {
  for (const event of events) {
    await applyBillingEvent(event);
  }
}

async function applyBillingEvent(event: BillingEvent): Promise<void> {
  switch (event.type) {
    case "subscription.activated": {
      await syncUserSubscriptionAsync(event.userId, event.tier, "active", event.periodEnd, {
        billingInterval: event.interval,
        provider: event.provider,
        providerSubscriptionId: event.providerSubId,
        periodStart: event.periodStart,
        cancelAtPeriodEnd: false,
      });
      const user = await findUserByIdAsync(event.userId);
      if (user) {
        await import("@/lib/db").then((db) =>
          db.updateUserAsync(event.userId, {
            subscription: {
              tier: event.tier,
              expiresAt: event.periodEnd,
              startedAt: event.periodStart,
              status: "active",
              billingInterval: event.interval,
              provider: event.provider,
            },
          }),
        );
      }
      break;
    }
    case "subscription.renewed": {
      const sub = await findSubscriptionByProviderIdAsync(event.providerSubId);
      if (!sub) return;
      await syncUserSubscriptionAsync(sub.userId, sub.tier, "active", event.periodEnd, {
        providerSubscriptionId: event.providerSubId,
      });
      break;
    }
    case "subscription.canceled": {
      const sub = await findSubscriptionByProviderIdAsync(event.providerSubId);
      if (!sub) return;
      await syncUserSubscriptionAsync(sub.userId, sub.tier, event.cancelAtPeriodEnd ? "active" : "canceled", sub.currentPeriodEnd, {
        cancelAtPeriodEnd: event.cancelAtPeriodEnd,
        providerSubscriptionId: event.providerSubId,
      });
      break;
    }
    case "subscription.past_due": {
      const sub = await findSubscriptionByProviderIdAsync(event.providerSubId);
      if (!sub) return;
      await syncUserSubscriptionAsync(sub.userId, sub.tier, "past_due", event.periodEnd, {
        providerSubscriptionId: event.providerSubId,
      });
      break;
    }
    case "payment.succeeded": {
      const sub = event.subscriptionId
        ? await findSubscriptionByProviderIdAsync(event.subscriptionId)
        : null;
      await createPaymentAsync({
        userId: event.userId,
        subscriptionId: sub?.id ?? null,
        amountPaise: event.amountPaise,
        currency: "INR",
        status: "succeeded",
        provider: event.provider,
        providerPaymentId: event.providerPaymentId,
        providerInvoiceId: event.providerInvoiceId ?? null,
        metadata: {},
      });
      break;
    }
    case "payment.failed": {
      await createPaymentAsync({
        userId: event.userId,
        subscriptionId: null,
        amountPaise: 0,
        currency: "INR",
        status: "failed",
        provider: event.provider,
        providerPaymentId: null,
        providerInvoiceId: null,
        metadata: { reason: event.reason },
      });
      break;
    }
  }
}

export async function activateDemoSubscription(
  userId: string,
  tier: PaidTier,
  interval: "month" | "year" = "month",
): Promise<void> {
  const { periodEndFromInterval } = await import("@/lib/billing/catalog");
  const periodEnd = periodEndFromInterval(interval);
  const periodStart = new Date().toISOString();
  await syncUserSubscriptionAsync(userId, tier, "active", periodEnd, {
    billingInterval: interval,
    provider: "demo",
    providerSubscriptionId: `demo_${userId}_${Date.now()}`,
    periodStart,
  });
  await import("@/lib/db").then((db) =>
    db.updateUserAsync(userId, {
      subscription: {
        tier,
        expiresAt: periodEnd,
        startedAt: periodStart,
        status: "active",
        billingInterval: interval,
        provider: "demo",
      },
    }),
  );
}

export { getBillingCustomerAsync, upsertBillingCustomerAsync };
