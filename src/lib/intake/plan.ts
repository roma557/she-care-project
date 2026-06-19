import type { SeverityLevel } from "@/lib/assessment";
import { EMOTIONAL_REASSURANCE } from "./questions";
import type { IntakeAnswers, IntakePlan } from "./types";

const GOAL_ADVICE: Record<string, string> = {
  cycle:
    "Focus on low-GI Indian meals, spearmint tea, and consistent sleep. Log your cycle daily — patterns are powerful evidence for your gynecologist.",
  weight:
    "Prioritise protein at breakfast (eggs, dal, paneer), 20-minute post-meal walks, and strength training 2–3× weekly. Avoid extreme restriction — it can worsen insulin resistance.",
  fertility:
    "Track ovulation signs, optimise metabolic health, and discuss Myo-inositol and early referral with a fertility specialist if cycles are irregular.",
  symptoms:
    "Spearmint tea, anti-inflammatory meals, and zinc-rich foods may help androgen-related symptoms. Share persistent symptoms with your doctor — treatments exist.",
  energy:
    "Stabilise blood sugar with balanced meals every 3–4 hours. Prioritise 7–9 hours sleep and magnesium-rich foods (spinach, pumpkin seeds).",
  understand:
    "Explore Learn → Conditions for evidence-based guides. Knowledge helps you advocate for tests like a full hormonal panel and pelvic ultrasound.",
  doctor:
    "Bring this intake summary, a symptom log, and cycle history. Ask for testosterone, LH/FSH, insulin, HbA1c, thyroid, and ultrasound as indicated.",
};

const DIAGNOSIS_LEARN_MAP: Record<string, { id: string; name: string }> = {
  pcos: { id: "pcos-guide", name: "PCOS guide" },
  pcod: { id: "pcos-guide", name: "PCOD guide" },
  endometriosis: { id: "endometriosis", name: "Endometriosis" },
  fibroids: { id: "fibroids", name: "Fibroids" },
  adenomyosis: { id: "adenomyosis", name: "Adenomyosis" },
  pmdd: { id: "pmdd", name: "PMDD" },
  suspected: { id: "pcos-guide", name: "PCOS & PCOD basics" },
};

function uniqueTopics(topics: { id: string; name: string }[]): { id: string; name: string }[] {
  const seen = new Set<string>();
  return topics.filter((t) => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}

function inferLearnTopics(answers: IntakeAnswers): { id: string; name: string }[] {
  const topics: { id: string; name: string }[] = [];

  for (const d of answers.diagnoses) {
    const mapped = DIAGNOSIS_LEARN_MAP[d];
    if (mapped) topics.push(mapped);
  }

  if (answers.bleedingPattern === "heavy") {
    topics.push({ id: "menorrhagia", name: "Heavy bleeding (Menorrhagia)" });
    topics.push({ id: "fibroids", name: "Fibroids" });
  }
  if (answers.bleedingPattern === "spotting") {
    topics.push({ id: "uterine-polyps", name: "Uterine polyps" });
  }
  if (answers.periodPain === "severe" || answers.periodPain === "moderate") {
    topics.push({ id: "dysmenorrhea", name: "Painful periods (Dysmenorrhea)" });
  }
  if (answers.physicalSymptoms.includes("pelvic-pain") || answers.physicalSymptoms.includes("pain-sex")) {
    topics.push({ id: "endometriosis", name: "Endometriosis" });
  }
  if (answers.mentalSymptoms.includes("pmdd-like")) {
    topics.push({ id: "pmdd", name: "PMDD" });
  }
  if (answers.cycleRegularity === "absent") {
    topics.push({ id: "amenorrhea", name: "Absent periods (Amenorrhea)" });
  }

  if (topics.length === 0) {
    topics.push({ id: "pcos-guide", name: "PCOS & PCOD basics" });
  }

  return uniqueTopics(topics).slice(0, 4);
}

function buildTopTips(answers: IntakeAnswers): string[] {
  const tips: string[] = [];

  if (answers.bleedingPattern === "heavy") {
    tips.push("Heavy bleeding can cause anemia — ask your doctor about iron studies and menorrhagia evaluation.");
  }
  if (answers.sleepQuality === "poor") {
    tips.push("Prioritise a fixed sleep window — poor sleep worsens insulin resistance and mood swings.");
  }
  if (answers.dietaryTags.includes("Low-GI focus") || answers.primaryGoal === "weight") {
    tips.push("Swap white rice for millets (bajra, jowar) at lunch — lower GI helps PCOS metabolism.");
  } else {
    tips.push("Try millets (bajra, jowar) instead of white rice — a gentle low-GI shift for Indian meals.");
  }
  tips.push("Drink 2 cups spearmint tea daily — evidence suggests it may help androgen-related symptoms.");
  tips.push("Walk 20 minutes after meals — one of the simplest insulin-sensitivity habits.");

  return tips.slice(0, 4);
}

function buildSummaryLines(answers: IntakeAnswers, severity: SeverityLevel): string[] {
  const lines: string[] = [];
  const name = answers.name.trim() || "there";

  if (answers.diagnoses.includes("none") || answers.diagnoses.length === 0) {
    lines.push(`${name}, thank you for sharing openly — exploring your health is a brave first step.`);
  } else {
    const labels = answers.diagnoses.filter((d) => d !== "none" && d !== "suspected");
    if (labels.length > 0) {
      lines.push(`We see you're navigating ${labels.join(", ").replace(/-/g, " ")} — you're not alone in this.`);
    }
  }

  if (answers.cycleRegularity === "irregular" || answers.cycleRegularity === "absent") {
    lines.push("Irregular or absent cycles deserve medical attention — tracking here helps you show clear patterns to your gynecologist.");
  } else if (answers.cycleRegularity === "regular") {
    lines.push("Regular cycle tracking will help you spot changes early and connect symptoms to your phase.");
  }

  if (severity === "significant") {
    lines.push("Your symptom profile suggests your body is working hard — professional support alongside daily care is recommended.");
  } else if (severity === "moderate") {
    lines.push("Consistent lifestyle habits and cycle logging can meaningfully improve how you feel over time.");
  } else {
    lines.push("We'll keep your care plan gentle and practical — focused on habits that fit Indian daily life.");
  }

  return lines;
}

function evaluateDoctorUrgency(answers: IntakeAnswers, score: number): { alert: boolean; reason?: string } {
  if (answers.physicalSymptoms.includes("fever-pelvic")) {
    return {
      alert: true,
      reason: "Fever with pelvic pain can indicate infection (e.g. PID) and needs prompt medical evaluation.",
    };
  }
  if (answers.periodPain === "severe") {
    return {
      alert: true,
      reason: "Severe period pain (dysmenorrhea) that limits daily life should be evaluated — endometriosis and other causes are treatable.",
    };
  }
  if (answers.bleedingPattern === "heavy") {
    return {
      alert: true,
      reason: "Heavy or prolonged bleeding (menorrhagia) can affect your health and warrants a gynecologist visit.",
    };
  }
  if (answers.cycleRegularity === "absent") {
    return {
      alert: true,
      reason: "Absent or very infrequent periods (amenorrhea) should be investigated — especially if not explained by treatment.",
    };
  }
  const isIrregular = answers.cycleRegularity === "irregular" || answers.cycleRegularity === "absent";
  if (isIrregular && score >= 8) {
    return {
      alert: true,
      reason: "Irregular cycles combined with many symptoms suggest it's time for a full hormonal workup.",
    };
  }
  if (answers.mentalSymptoms.includes("pmdd-like")) {
    return {
      alert: true,
      reason: "Severe premenstrual distress may be PMDD — effective treatments exist; please discuss with a doctor.",
    };
  }
  return { alert: false };
}

/** Build a compassionate, non-diagnostic care plan from intake answers. */
export function buildIntakePlan(answers: IntakeAnswers): IntakePlan {
  const score = answers.physicalSymptoms.length + answers.mentalSymptoms.length;

  let severity: SeverityLevel = "mild";
  let severityLabel = "Mild burden";
  let severityColor = "text-teal-dark bg-teal-light";

  if (score >= 8) {
    severity = "significant";
    severityLabel = "Significant burden";
    severityColor = "text-pink-dark bg-pink-light";
  } else if (score >= 4) {
    severity = "moderate";
    severityLabel = "Moderate burden";
    severityColor = "text-amber-mid bg-amber-light";
  }

  const isIrregular =
    answers.cycleRegularity === "irregular" || answers.cycleRegularity === "absent";

  const urgency = evaluateDoctorUrgency(answers, score);
  const goal = answers.primaryGoal || "understand";
  const goalAdvice = GOAL_ADVICE[goal] ?? GOAL_ADVICE.understand;
  const emotional = answers.emotionalState || "hopeful";

  return {
    score,
    severity,
    severityLabel,
    severityColor,
    isIrregular,
    showDoctorAlert: urgency.alert,
    doctorReason: urgency.reason,
    goalAdvice,
    topTips: buildTopTips(answers),
    summaryLines: buildSummaryLines(answers, severity),
    reassurance: EMOTIONAL_REASSURANCE[emotional] ?? EMOTIONAL_REASSURANCE.hopeful,
    suggestedLearnTopics: inferLearnTopics(answers),
  };
}

/** Convert legacy onboarding profile fields into intake answers shape. */
export function intakeFromLegacyProfile(profile: {
  name?: string;
  cycleLength?: number;
  symptomTags?: string[];
  dietaryTags?: string[];
  activityLevel?: number;
}): Partial<IntakeAnswers> {
  return {
    name: profile.name ?? "",
    cycleLength: profile.cycleLength ?? 28,
    dietaryTags: profile.dietaryTags ?? [],
    activityLevel: profile.activityLevel ?? 35,
    physicalSymptoms: mapLegacySymptoms(profile.symptomTags ?? []),
  };
}

function mapLegacySymptoms(tags: string[]): string[] {
  const map: Record<string, string> = {
    "Irregular periods": "irregular-note",
    Acne: "acne",
    "Hair growth": "hair",
    "Weight gain": "weight",
    "Mood swings": "mood",
    Fatigue: "fatigue",
    Bloating: "bloating",
    Cravings: "cravings",
  };
  return tags.map((t) => map[t]).filter(Boolean) as string[];
}
