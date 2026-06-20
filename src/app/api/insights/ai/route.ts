import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { assertAccess, resolveEffectiveTier, consumeUsage, UsageLimitError } from "@/lib/permissions";
import { getUserAppDataAsync } from "@/lib/db";
import { generateAiInsights } from "@/lib/insights/ai-insights";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  try {
    await assertAccess(user.id, "ai_insights");
    const tier = await resolveEffectiveTier(user.id);
    if (tier === "free") {
      return NextResponse.json({ error: "upgrade_required", requiredTier: "starter" }, { status: 403 });
    }
    await consumeUsage(user.id, tier, "ai_insights");
  } catch (err) {
    if (err instanceof UsageLimitError) {
      return NextResponse.json({ error: "limit_reached", meter: err.meter }, { status: 429 });
    }
    return NextResponse.json({ error: "upgrade_required", requiredTier: "starter" }, { status: 403 });
  }

  const appData = await getUserAppDataAsync(user.id);
  if (!appData) {
    return NextResponse.json({ error: "Sync your data first" }, { status: 400 });
  }

  const tier = await resolveEffectiveTier(user.id);
  const insights = await generateAiInsights(appData, tier as "starter" | "plus" | "premium");
  return NextResponse.json({ insights });
}
