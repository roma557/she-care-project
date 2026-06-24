import type { SubscriptionTier } from "@/lib/subscription/types";

/** Maps subscription tier to the data-tier attribute value on the app shell. */
export function tierAccentAttribute(tier: SubscriptionTier): string {
  if (tier === "plus") return "plus";
  if (tier === "premium") return "premium";
  return "default";
}
