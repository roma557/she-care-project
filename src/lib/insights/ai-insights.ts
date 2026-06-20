import type { AppSyncPayload } from "@/lib/sync-types";

export interface AiInsightResult {
  title: string;
  body: string;
  category: "symptom_pattern" | "mood_correlation" | "pms" | "hormonal" | "general";
}

function countSymptomDays(cycle: AppSyncPayload["cycle"]): number {
  return Object.values(cycle.dailyLogs ?? {}).filter((log) => (log.symptoms?.length ?? 0) > 0).length;
}

export function generateRuleBasedInsights(data: AppSyncPayload, tier: "starter" | "plus" | "premium"): AiInsightResult[] {
  const insights: AiInsightResult[] = [];
  const symptomCount = countSymptomDays(data.cycle);
  const moodCount = Object.keys(data.insights?.history ?? {}).filter(
    (k) => data.insights?.history[k]?.stress,
  ).length;
  const periodCount = Object.values(data.cycle.markedDays ?? {}).filter((m) => m === "period").length;

  if (symptomCount >= 3) {
    insights.push({
      title: "Symptom pattern detected",
      body: `You've logged symptoms on ${symptomCount} days. Tracking consistently helps identify cycle-linked patterns to discuss with your gynecologist.`,
      category: "symptom_pattern",
    });
  }

  if (tier !== "starter" && moodCount >= 2 && symptomCount >= 2) {
    insights.push({
      title: "Mood & symptom correlation",
      body: "Your mood and symptom logs often overlap — this is common with hormonal shifts. Consider noting triggers like sleep or stress on high-symptom days.",
      category: "mood_correlation",
    });
  }

  if (tier !== "starter" && periodCount >= 2) {
    insights.push({
      title: "Early PMS awareness",
      body: "Based on your logging rhythm, consider watching the 7–10 days before your period for mood, bloating, or cravings — early awareness helps you prepare.",
      category: "pms",
    });
  }

  if (tier === "premium") {
    insights.push({
      title: "Advanced hormonal health note",
      body: "Premium analysis: Pair your cycle data with sleep and hydration trends. Poor sleep (<6 hrs) often correlates with worse PCOS symptom days — prioritise rest in your luteal phase.",
      category: "hormonal",
    });
  }

  if (insights.length === 0) {
    insights.push({
      title: "Keep logging",
      body: "Log a few more days of symptoms, mood, and cycle data to unlock personalised AI insights about your patterns.",
      category: "general",
    });
  }

  return insights;
}

export async function generateAiInsights(data: AppSyncPayload, tier: "starter" | "plus" | "premium"): Promise<AiInsightResult[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return generateRuleBasedInsights(data, tier);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        messages: [
          {
            role: "user",
            content: `Analyze this women's health tracking data and return 2-3 brief insights as JSON array with title, body, category fields. Tier: ${tier}. Data: ${JSON.stringify({
              cycleLength: data.profile.cycleLength,
              markedDaysCount: Object.keys(data.cycle.markedDays ?? {}).length,
              assessmentScore: data.assessmentResult?.score,
            })}. No diagnosis. Indian context.`,
          },
        ],
      }),
    });
    if (!res.ok) return generateRuleBasedInsights(data, tier);
    const json = await res.json();
    const text = json.content?.[0]?.text ?? "";
    const match = text.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]) as AiInsightResult[];
  } catch {
    // fallback
  }
  return generateRuleBasedInsights(data, tier);
}
