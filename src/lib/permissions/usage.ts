import type { SubscriptionTier } from "@/lib/subscription";
import { getMeterLimit } from "@/lib/subscription/limits";
import type { UsageMeter } from "@/lib/subscription/limits";
import { getUsageAsync } from "@/lib/db";

export interface UsageStatus {
  meter: UsageMeter;
  used: number;
  limit: number;
  remaining: number;
  unlimited: boolean;
}

export async function getUsageStatus(userId: string, tier: SubscriptionTier, meter: UsageMeter): Promise<UsageStatus> {
  const limit = getMeterLimit(tier, meter);
  const used = await getUsageAsync(userId, meter);
  const unlimited = limit === Infinity;
  return {
    meter,
    used,
    limit: unlimited ? used : limit,
    remaining: unlimited ? Infinity : Math.max(0, limit - used),
    unlimited,
  };
}

export class UsageLimitError extends Error {
  constructor(
    public meter: UsageMeter,
    public requiredTier: SubscriptionTier = "starter",
  ) {
    super(`Usage limit reached for ${meter}`);
    this.name = "UsageLimitError";
  }
}

export async function consumeUsage(userId: string, tier: SubscriptionTier, meter: UsageMeter): Promise<UsageStatus> {
  const status = await getUsageStatus(userId, tier, meter);
  if (!status.unlimited && status.remaining <= 0) {
    const requiredTier = meter === "ai_coach" && tier === "free" ? "starter" : tier === "starter" ? "plus" : "premium";
    throw new UsageLimitError(meter, requiredTier);
  }
  const newCount = await import("@/lib/db").then((db) => db.incrementUsageAsync(userId, meter));
  const limit = getMeterLimit(tier, meter);
  const unlimited = limit === Infinity;
  return {
    meter,
    used: newCount,
    limit: unlimited ? newCount : limit,
    remaining: unlimited ? Infinity : Math.max(0, limit - newCount),
    unlimited,
  };
}
