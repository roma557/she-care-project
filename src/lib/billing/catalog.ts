import type { PaidTier, BillingInterval } from "@/lib/subscription";
import { PLANS } from "@/lib/subscription/plans";

type Provider = "stripe" | "razorpay";

function envKey(provider: Provider, tier: PaidTier, interval: BillingInterval): string {
  const tierUpper = tier.toUpperCase();
  const intervalUpper = interval === "month" ? "MONTHLY" : "YEARLY";
  return provider === "stripe"
    ? `STRIPE_PRICE_${tierUpper}_${intervalUpper}`
    : `RAZORPAY_PLAN_${tierUpper}_${intervalUpper}`;
}

export function getProviderPriceId(provider: Provider, tier: PaidTier, interval: BillingInterval): string | null {
  return process.env[envKey(provider, tier, interval)] ?? null;
}

export function getAmountPaise(tier: PaidTier, interval: BillingInterval): number {
  const plan = PLANS[tier];
  const rupees = interval === "month" ? plan.monthlyPrice : plan.annualPrice;
  return rupees * 100;
}

export function getTierFromPriceId(provider: Provider, priceId: string): { tier: PaidTier; interval: BillingInterval } | null {
  const tiers: PaidTier[] = ["starter", "plus", "premium"];
  const intervals: BillingInterval[] = ["month", "year"];
  for (const tier of tiers) {
    for (const interval of intervals) {
      const id = getProviderPriceId(provider, tier, interval);
      if (id === priceId) return { tier, interval };
    }
  }
  return null;
}

export function periodEndFromInterval(interval: BillingInterval, from = new Date()): string {
  const end = new Date(from);
  if (interval === "month") {
    end.setMonth(end.getMonth() + 1);
  } else {
    end.setFullYear(end.getFullYear() + 1);
  }
  return end.toISOString();
}
