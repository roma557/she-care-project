import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { assertAccess, resolveEffectiveTier, consumeUsage, UsageLimitError } from "@/lib/permissions";
import { createReportAsync, getUserAppDataAsync } from "@/lib/db";
import { generateWellnessReport } from "@/lib/reports/generator";
import { getTierLimits } from "@/lib/subscription";
import type { Feature } from "@/lib/permissions/features";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json();
  const reportType = body.type === "weekly" ? "weekly" : "monthly";
  const feature: Feature = reportType === "weekly" ? "weekly_report" : "monthly_report";

  try {
    await assertAccess(user.id, feature);
    const tier = await resolveEffectiveTier(user.id);
    await consumeUsage(user.id, tier, "reports_generated");
  } catch (err) {
    if (err instanceof UsageLimitError) {
      return NextResponse.json({ error: "limit_reached", meter: err.meter }, { status: 429 });
    }
    const requiredTier = (err as Error & { requiredTier?: string }).requiredTier ?? "starter";
    return NextResponse.json({ error: "upgrade_required", requiredTier }, { status: 403 });
  }

  const tier = await resolveEffectiveTier(user.id);
  const appData = await getUserAppDataAsync(user.id);
  if (!appData) {
    return NextResponse.json({ error: "Sync your data first" }, { status: 400 });
  }

  const generated = generateWellnessReport(reportType, {
    profile: appData.profile,
    cycle: appData.cycle,
    insights: appData.insights,
    assessmentResult: appData.assessmentResult,
    tier,
  });

  const report = await createReportAsync({
    userId: user.id,
    reportType: generated.reportType,
    periodStart: generated.periodStart,
    periodEnd: generated.periodEnd,
    title: generated.title,
    summary: generated.summary,
    content: generated.content,
  });

  return NextResponse.json({ report, limits: getTierLimits(tier) });
}
