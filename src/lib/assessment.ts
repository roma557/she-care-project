export type QuestionType = "single" | "multi";

export interface QuestionOption {
  label: string;
  value: string;
  /** Symptom weight for scoring (Q3/Q4 only) */
  score?: number;
}

export interface Question {
  key: string;
  prompt: string;
  type: QuestionType;
  options: QuestionOption[];
}

export const ASSESSMENT_QUESTIONS: Question[] = [
  {
    key: "age",
    prompt: "What is your age range?",
    type: "single",
    options: [
      { label: "Under 18", value: "under18" },
      { label: "18–25", value: "18-25" },
      { label: "26–35", value: "26-35" },
      { label: "36–45", value: "36-45" },
      { label: "Over 45", value: "over45" },
    ],
  },
  {
    key: "cycle",
    prompt: "How regular is your menstrual cycle?",
    type: "single",
    options: [
      { label: "Regular (21–35 days)", value: "regular" },
      { label: "Irregular (varies widely)", value: "irregular" },
      { label: "Absent / very infrequent", value: "absent" },
      { label: "On birth control", value: "on-pill" },
    ],
  },
  {
    key: "physical",
    prompt: "Which physical symptoms do you experience?",
    type: "multi",
    options: [
      { label: "Weight gain", value: "weight", score: 1 },
      { label: "Acne / oily skin", value: "acne", score: 1 },
      { label: "Excess hair growth", value: "hair", score: 1 },
      { label: "Hair thinning", value: "thinning", score: 1 },
      { label: "Bloating", value: "bloating", score: 1 },
      { label: "Fatigue", value: "fatigue", score: 1 },
    ],
  },
  {
    key: "mental",
    prompt: "Which mental or emotional symptoms apply?",
    type: "multi",
    options: [
      { label: "Mood swings", value: "mood", score: 1 },
      { label: "Anxiety", value: "anxiety", score: 1 },
      { label: "Low mood", value: "low-mood", score: 1 },
      { label: "Brain fog", value: "brain-fog", score: 1 },
      { label: "Sleep issues", value: "sleep", score: 1 },
      { label: "Food cravings", value: "cravings", score: 1 },
    ],
  },
  {
    key: "diagnosis",
    prompt: "Have you been diagnosed with PCOS or PCOD?",
    type: "single",
    options: [
      { label: "Yes — PCOS", value: "pcos" },
      { label: "Yes — PCOD", value: "pcod" },
      { label: "Suspected, not confirmed", value: "suspected" },
      { label: "No diagnosis yet", value: "none" },
    ],
  },
  {
    key: "lifestyle",
    prompt: "How would you describe your activity level?",
    type: "single",
    options: [
      { label: "Mostly sedentary", value: "sedentary" },
      { label: "Light activity (1–2×/week)", value: "light" },
      { label: "Moderate (3–4×/week)", value: "moderate" },
      { label: "Very active (5+×/week)", value: "active" },
    ],
  },
  {
    key: "diet",
    prompt: "How would you describe your eating habits?",
    type: "single",
    options: [
      { label: "Mostly processed / high sugar", value: "processed" },
      { label: "Mixed — some healthy meals", value: "mixed" },
      { label: "Mostly home-cooked, balanced", value: "balanced" },
      { label: "Following a specific diet plan", value: "planned" },
    ],
  },
  {
    key: "goal",
    prompt: "What is your primary health goal?",
    type: "single",
    options: [
      { label: "Regulate my cycle", value: "cycle" },
      { label: "Manage weight", value: "weight" },
      { label: "Improve fertility", value: "fertility" },
      { label: "Reduce symptoms (acne, hair)", value: "symptoms" },
      { label: "Boost energy & mood", value: "energy" },
      { label: "Understand my condition", value: "understand" },
      { label: "Prepare for doctor visit", value: "doctor" },
    ],
  },
  {
    key: "emotion",
    prompt: "How are you feeling about your health journey?",
    type: "single",
    options: [
      { label: "Overwhelmed", value: "overwhelmed" },
      { label: "Frustrated", value: "frustrated" },
      { label: "Hopeful", value: "hopeful" },
      { label: "Motivated", value: "motivated" },
      { label: "Accepting", value: "accepting" },
    ],
  },
];

export type SeverityLevel = "mild" | "moderate" | "significant";

export interface AssessmentResult {
  score: number;
  severity: SeverityLevel;
  severityLabel: string;
  severityColor: string;
  isIrregular: boolean;
  showDoctorAlert: boolean;
  goalAdvice: string;
  topTips: string[];
}

const GOAL_ADVICE: Record<string, string> = {
  cycle:
    "Focus on low-GI Indian meals, spearmint tea, and consistent sleep. Track your cycle daily and share patterns with your gynecologist.",
  weight:
    "Prioritise protein-rich breakfasts (eggs, dal, paneer), 20-min post-meal walks, and strength training 2–3× weekly. Avoid extreme calorie restriction.",
  fertility:
    "Work with a fertility specialist on ovulation tracking, Myo-inositol supplementation, and metabolic health. Early intervention improves outcomes.",
  symptoms:
    "Spearmint tea may reduce androgen-related symptoms. Consider zinc-rich foods, anti-inflammatory meals, and discuss spironolactone with your doctor.",
  energy:
    "Stabilise blood sugar with balanced meals every 3–4 hours. Prioritise 7–9 hrs sleep, magnesium-rich foods, and gentle morning movement.",
  understand:
    "Explore the Learn section for PCOS vs PCOD, causes, and types. Knowledge empowers better conversations with your healthcare team.",
  doctor:
    "Bring your symptom log, cycle history, and this assessment summary. Ask for a full hormonal panel, ultrasound, and HbA1c test.",
};

export function calculateResult(answers: Record<string, string | string[]>): AssessmentResult {
  const physical = (answers.physical as string[]) ?? [];
  const mental = (answers.mental as string[]) ?? [];
  const score = physical.length + mental.length;

  let severity: SeverityLevel = "mild";
  let severityLabel = "Mild";
  let severityColor = "text-teal-dark bg-teal-light";

  if (score >= 8) {
    severity = "significant";
    severityLabel = "Significant";
    severityColor = "text-pink-dark bg-pink-light";
  } else if (score >= 4) {
    severity = "moderate";
    severityLabel = "Moderate";
    severityColor = "text-amber-mid bg-amber-light";
  }

  const cycle = answers.cycle as string;
  const isIrregular = cycle === "irregular" || cycle === "absent";
  const showDoctorAlert = isIrregular && severity === "significant";

  const goal = (answers.goal as string) ?? "understand";
  const goalAdvice = GOAL_ADVICE[goal] ?? GOAL_ADVICE.understand;

  const topTips = [
    "Switch to millets (bajra, jowar) over white rice for lower GI impact",
    "Drink 2 cups spearmint tea daily — may help reduce androgens",
    "Walk 20 minutes after meals to improve insulin sensitivity",
  ];

  return {
    score,
    severity,
    severityLabel,
    severityColor,
    isIrregular,
    showDoctorAlert,
    goalAdvice,
    topTips,
  };
}
