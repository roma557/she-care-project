import type { AppSyncPayload } from "@/lib/sync-types";
import type { InsightsState } from "@/lib/insights";
import type { SubscriptionTier } from "@/lib/subscription";
import { getDataHistoryCutoff } from "@/lib/subscription/limits";

function trimByDate<T>(record: Record<string, T>, cutoff: Date | null): Record<string, T> {
  if (!cutoff) return record;
  const trimmed: Record<string, T> = {};
  for (const [key, value] of Object.entries(record)) {
    if (new Date(key) >= cutoff) trimmed[key] = value;
  }
  return trimmed;
}

export function trimSyncPayloadByTier(data: AppSyncPayload, tier: SubscriptionTier): AppSyncPayload {
  const cutoff = getDataHistoryCutoff(tier);
  return {
    ...data,
    cycle: {
      ...data.cycle,
      markedDays: trimByDate(data.cycle.markedDays, cutoff),
    },
    insights: data.insights
      ? { history: trimByDate(data.insights.history, cutoff) }
      : data.insights,
  };
}

export function trimInsightsState(insights: InsightsState, tier: SubscriptionTier): InsightsState {
  const cutoff = getDataHistoryCutoff(tier);
  return { history: trimByDate(insights.history, cutoff) };
}
