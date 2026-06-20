import type { BillingProviderAdapter } from "@/lib/billing/types";
import { stripeAdapter } from "@/lib/billing/stripe";
import { razorpayAdapter } from "@/lib/billing/razorpay";
import { getDefaultProvider } from "@/lib/billing/types";

const providers: Record<string, BillingProviderAdapter> = {
  stripe: stripeAdapter,
  razorpay: razorpayAdapter,
};

export function getProvider(name?: string): BillingProviderAdapter {
  const key = name ?? getDefaultProvider();
  const provider = providers[key];
  if (!provider) throw new Error(`Unknown billing provider: ${key}`);
  return provider;
}

export { stripeAdapter, razorpayAdapter };
