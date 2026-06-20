import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { getUsageStatus } from "@/lib/permissions/usage";
import { getEffectiveTier, getTierLimits } from "@/lib/subscription";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({
      tier: "free",
      authenticated: false,
      usage: {},
      limits: getTierLimits("free"),
    });
  }

  const tier = getEffectiveTier(user.subscription);

  const [aiCoach, aiInsights, reports] = await Promise.all([
    getUsageStatus(user.id, tier, "ai_coach"),
    getUsageStatus(user.id, tier, "ai_insights"),
    getUsageStatus(user.id, tier, "reports_generated"),
  ]);

  return NextResponse.json({
    tier,
    authenticated: true,
    demoMode: process.env.BILLING_DEMO_MODE === "true",
    subscription: user.subscription,
    usage: {
      ai_coach: aiCoach,
      ai_insights: aiInsights,
      reports_generated: reports,
    },
    limits: getTierLimits(tier),
  });
}
