import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { getProvider } from "@/lib/billing/provider";
import { isDemoMode } from "@/lib/billing/types";
import { activateDemoSubscription } from "@/lib/billing/sync";
import { assertTestPlanAllowed } from "@/lib/test-plan-guard";
import type { PaidTier, BillingInterval } from "@/lib/subscription";
import { PAID_TIERS } from "@/lib/subscription/plans";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json();
  const tier = body.tier as PaidTier;
  const interval = (body.interval ?? "month") as BillingInterval;
  const providerName = body.provider as string | undefined;

  if (!PAID_TIERS.includes(tier)) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }
  if (interval !== "month" && interval !== "year") {
    return NextResponse.json({ error: "Invalid interval" }, { status: 400 });
  }

  const planError = assertTestPlanAllowed(user, tier);
  if (planError) {
    return NextResponse.json({ error: planError }, { status: 403 });
  }

  if (isDemoMode()) {
    await activateDemoSubscription(user.id, tier, interval);
    const updated = await getSessionUser();
    return NextResponse.json({ demo: true, user: updated });
  }

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const provider = getProvider(providerName);

  try {
    const result = await provider.createCheckout({
      userId: user.id,
      userPhone: user.phone,
      userName: user.name,
      tier,
      interval,
      successUrl: `${origin}/?billing=success`,
      cancelUrl: `${origin}/?billing=cancel`,
    });
    return NextResponse.json({ url: result.url, sessionId: result.sessionId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
