import type { AppSyncPayload } from "@/lib/sync-types";
import type { SubscriptionTier } from "@/lib/subscription";
import { getDataHistoryCutoff } from "@/lib/subscription/limits";

export interface ReportInput {
  profile: AppSyncPayload["profile"];
  cycle: AppSyncPayload["cycle"];
  insights?: AppSyncPayload["insights"];
  assessmentResult: AppSyncPayload["assessmentResult"];
  tier: SubscriptionTier;
}

export interface GeneratedReport {
  reportType: "weekly" | "monthly";
  periodStart: string;
  periodEnd: string;
  title: string;
  summary: Record<string, unknown>;
  content: string;
}

function periodRange(type: "weekly" | "monthly"): { start: string; end: string } {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  if (type === "weekly") start.setDate(start.getDate() - 7);
  else start.setMonth(start.getMonth() - 1);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

export function generateWellnessReport(type: "weekly" | "monthly", input: ReportInput): GeneratedReport {
  const { start, end } = periodRange(type);
  const cutoff = getDataHistoryCutoff(input.tier);
  const periodDays = Object.keys(input.cycle.markedDays ?? {}).filter((k) => {
    if (k < start || k > end) return false;
    if (cutoff && new Date(k) < cutoff) return false;
    return true;
  });

  const periodMarks = periodDays.filter((k) => input.cycle.markedDays[k] === "period").length;
  const symptomDays = Object.keys(input.cycle.dailyLogs ?? {}).filter((k) => {
    if (k < start || k > end) return false;
    if (cutoff && new Date(k) < cutoff) return false;
    return (input.cycle.dailyLogs[k]?.symptoms?.length ?? 0) > 0;
  }).length;

  const insightHistory = input.insights?.history ?? {};
  const insightDays = Object.keys(insightHistory).filter((k) => k >= start && k <= end);
  const avgSleep =
    insightDays.length > 0
      ? insightDays.reduce((sum, k) => sum + (insightHistory[k]?.sleepHours ?? 0), 0) / insightDays.length
      : 0;
  const avgHydration =
    insightDays.length > 0
      ? insightDays.reduce((sum, k) => sum + (insightHistory[k]?.hydrationGlasses ?? 0), 0) / insightDays.length
      : 0;

  const summary = {
    periodDaysLogged: periodMarks,
    symptomDaysLogged: symptomDays,
    avgSleepHours: Math.round(avgSleep * 10) / 10,
    avgHydrationGlasses: Math.round(avgHydration * 10) / 10,
    assessmentScore: input.assessmentResult?.score ?? null,
    cycleLength: input.profile.cycleLength,
  };

  const label = type === "weekly" ? "Weekly" : "Monthly";
  const content = [
    `# ${label} Wellness Report`,
    `Period: ${start} to ${end}`,
    "",
    "## Cycle Summary",
    `- Period days logged: ${periodMarks}`,
    `- Symptom/mood days logged: ${symptomDays}`,
    `- Average cycle length setting: ${input.profile.cycleLength} days`,
    "",
    "## Wellness Metrics",
    `- Average sleep: ${summary.avgSleepHours} hrs/night`,
    `- Average hydration: ${summary.avgHydrationGlasses} glasses/day`,
    "",
    "## Notes",
    "This report is for personal tracking only — not a medical diagnosis.",
    "Share the doctor export (Premium) for structured clinical summaries.",
  ].join("\n");

  return {
    reportType: type,
    periodStart: start,
    periodEnd: end,
    title: `${label} Wellness Report`,
    summary,
    content,
  };
}
