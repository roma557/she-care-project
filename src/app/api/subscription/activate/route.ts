import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { isDemoMode } from "@/lib/billing/types";
import { activateDemoSubscription } from "@/lib/billing/sync";
import { assertTestPlanAllowed } from "@/lib/test-plan-guard";
import { PAID_TIERS } from "@/lib/subscription/plans";
import type { PaidTier } from "@/lib/subscription";

/** Demo endpoint — only active when BILLING_DEMO_MODE=true */
export async function POST(req: NextRequest) {
  if (!isDemoMode()) {
    return NextResponse.json(
      { error: "Demo activation disabled. Use /api/billing/checkout." },
      { status: 403 },
    );
  }

  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const tier = body.tier as PaidTier;
  const interval = body.interval === "year" ? "year" : "month";

  if (!PAID_TIERS.includes(tier)) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  const planError = assertTestPlanAllowed(user, tier);
  if (planError) {
    return NextResponse.json({ error: planError }, { status: 403 });
  }

  await activateDemoSubscription(user.id, tier, interval);
  const updated = await getSessionUser();
  return NextResponse.json({ user: updated });
}
