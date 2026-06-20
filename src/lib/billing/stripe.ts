import Stripe from "stripe";
import type { BillingProviderAdapter, CheckoutParams, CheckoutResult, BillingEvent } from "@/lib/billing/types";
import { getProviderPriceId, getTierFromPriceId, periodEndFromInterval } from "@/lib/billing/catalog";
import { getBillingCustomerAsync, upsertBillingCustomerAsync } from "@/lib/billing/sync";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key);
}

export const stripeAdapter: BillingProviderAdapter = {
  name: "stripe",

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    const stripe = getStripe();
    const priceId = getProviderPriceId("stripe", params.tier, params.interval);
    if (!priceId) throw new Error(`Stripe price not configured for ${params.tier} ${params.interval}`);

    let customerId: string | undefined;
    const existing = await getBillingCustomerAsync(params.userId, "stripe");
    if (existing) {
      customerId = existing.providerCustomerId;
    } else {
      const customer = await stripe.customers.create({
        phone: params.userPhone,
        name: params.userName,
        metadata: { userId: params.userId },
      });
      customerId = customer.id;
      await upsertBillingCustomerAsync({
        userId: params.userId,
        provider: "stripe",
        providerCustomerId: customer.id,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: { userId: params.userId, tier: params.tier, interval: params.interval },
      subscription_data: {
        metadata: { userId: params.userId, tier: params.tier, interval: params.interval },
      },
    });

    if (!session.url) throw new Error("Stripe checkout URL missing");
    return { url: session.url, sessionId: session.id };
  },

  async verifyWebhook(body: string, signature: string): Promise<BillingEvent[]> {
    const stripe = getStripe();
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET not configured");

    const event = stripe.webhooks.constructEvent(body, signature, secret);
    const events: BillingEvent[] = [];

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const tier = session.metadata?.tier as CheckoutParams["tier"] | undefined;
      const interval = (session.metadata?.interval ?? "month") as CheckoutParams["interval"];
      if (userId && tier) {
        events.push({
          type: "subscription.activated",
          userId,
          tier,
          interval,
          periodStart: new Date().toISOString(),
          periodEnd: periodEndFromInterval(interval),
          providerSubId: String(session.subscription),
          provider: "stripe",
        });
      }
    }

    if (event.type === "invoice.paid") {
      const invoice = event.data.object as Stripe.Invoice & {
        subscription?: string | { id: string } | null;
        payment_intent?: string | null;
      };
      const subId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id;
      const userId = invoice.metadata?.userId ?? invoice.customer_email ?? "";
      if (subId && userId) {
        events.push({
          type: "payment.succeeded",
          userId: String(invoice.metadata?.userId ?? userId),
          amountPaise: invoice.amount_paid ?? 0,
          providerPaymentId: invoice.payment_intent as string ?? invoice.id,
          providerInvoiceId: invoice.id,
          provider: "stripe",
          subscriptionId: subId,
        });
        events.push({
          type: "subscription.renewed",
          userId: String(invoice.metadata?.userId ?? userId),
          periodEnd: periodEndFromInterval("month"),
          providerSubId: subId,
        });
      }
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      events.push({
        type: "payment.failed",
        userId: String(invoice.metadata?.userId ?? "unknown"),
        reason: "invoice_payment_failed",
        provider: "stripe",
      });
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      events.push({
        type: "subscription.canceled",
        userId: String(sub.metadata?.userId ?? "unknown"),
        providerSubId: sub.id,
        cancelAtPeriodEnd: false,
      });
    }

    return events;
  },

  async createPortalSession(customerId: string, returnUrl: string): Promise<string> {
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session.url;
  },
};

export { getTierFromPriceId };
