import type { IntakeStep } from "./types";

export const INTAKE_TOTAL_STEPS = 9;

/** Clinician-ordered intake: demographics → concerns → cycle → symptoms → lifestyle → goals */
export const INTAKE_STEPS: IntakeStep[] = [
  {
    id: "name",
    kind: "about-you",
    stepNumber: 1,
    totalSteps: INTAKE_TOTAL_STEPS,
    title: "Let's get to know you",
    subtitle:
      "SheCare is a supportive companion — not a replacement for your doctor. Your answers stay private on this device.",
    infoPill: "A gynecologist would start here: who you are and what age range you're in.",
  },
  {
    id: "concerns",
    kind: "multi",
    field: "concerns",
    stepNumber: 2,
    totalSteps: INTAKE_TOTAL_STEPS,
    title: "What brings you to SheCare?",
    subtitle: "Select everything that applies — there is no wrong answer.",
    options: [
      { label: "Track my menstrual cycle", value: "track-cycle" },
      { label: "Understand PCOS or PCOD", value: "understand-pcos" },
      { label: "Manage day-to-day symptoms", value: "manage-symptoms" },
      { label: "Prepare for a doctor visit", value: "doctor-visit" },
      { label: "Emotional support & wellness", value: "emotional-support" },
      { label: "Explore a condition I was told about", value: "explore-diagnosis" },
    ],
  },
  {
    id: "diagnoses",
    kind: "multi",
    field: "diagnoses",
    stepNumber: 3,
    totalSteps: INTAKE_TOTAL_STEPS,
    title: "Any diagnoses you already have?",
    subtitle: "Optional — skip if you're still figuring things out.",
    infoPill: "Knowing your history helps us surface the right Learn topics and gentle next steps.",
    options: [
      { label: "PCOS", value: "pcos" },
      { label: "PCOD", value: "pcod" },
      { label: "Endometriosis", value: "endometriosis" },
      { label: "Fibroids", value: "fibroids" },
      { label: "Adenomyosis", value: "adenomyosis" },
      { label: "PMDD or severe PMS", value: "pmdd" },
      { label: "Suspected, not confirmed yet", value: "suspected" },
      { label: "None yet — I'm exploring", value: "none" },
    ],
  },
  {
    id: "cycleLength",
    kind: "cycle-length",
    field: "cycleLength",
    stepNumber: 4,
    totalSteps: INTAKE_TOTAL_STEPS,
    title: "What's your average cycle length?",
    subtitle: "Count from the first day of one period to the day before the next.",
    infoPill: "Cycles between 21–35 days are typical. Irregular or absent cycles are common with PCOS.",
  },
  {
    id: "cycle-health-group",
    kind: "cycle-health",
    stepNumber: 5,
    totalSteps: INTAKE_TOTAL_STEPS,
    title: "Tell us about your periods",
    subtitle: "These three questions mirror what a doctor asks in clinic.",
  },
  {
    id: "physicalSymptoms",
    kind: "symptoms",
    field: "physicalSymptoms",
    symptomGroup: "physical",
    stepNumber: 6,
    totalSteps: INTAKE_TOTAL_STEPS,
    title: "Physical symptoms you notice",
    subtitle: "Select all that apply in the last 3 months.",
    options: [
      { label: "Weight gain or difficulty losing weight", value: "weight", score: 1 },
      { label: "Acne or oily skin", value: "acne", score: 1 },
      { label: "Excess hair growth (face, body)", value: "hair", score: 1 },
      { label: "Hair thinning on scalp", value: "thinning", score: 1 },
      { label: "Bloating", value: "bloating", score: 1 },
      { label: "Fatigue or low energy", value: "fatigue", score: 1 },
      { label: "Pelvic pain (outside period)", value: "pelvic-pain", score: 1 },
      { label: "Pain during intercourse", value: "pain-sex", score: 1 },
      { label: "Fever with pelvic pain", value: "fever-pelvic", score: 2 },
    ],
  },
  {
    id: "mentalSymptoms",
    kind: "symptoms",
    field: "mentalSymptoms",
    symptomGroup: "mental",
    stepNumber: 7,
    totalSteps: INTAKE_TOTAL_STEPS,
    title: "Mood & mind symptoms",
    subtitle: "Hormonal conditions affect emotions too — you're not alone.",
    options: [
      { label: "Mood swings", value: "mood", score: 1 },
      { label: "Anxiety", value: "anxiety", score: 1 },
      { label: "Low mood or sadness", value: "low-mood", score: 1 },
      { label: "Brain fog", value: "brain-fog", score: 1 },
      { label: "Sleep problems", value: "sleep", score: 1 },
      { label: "Food or sugar cravings", value: "cravings", score: 1 },
      { label: "Severe distress before my period (PMDD-like)", value: "pmdd-like", score: 2 },
    ],
  },
  {
    id: "dietaryTags",
    kind: "lifestyle",
    field: "dietaryTags",
    stepNumber: 8,
    totalSteps: INTAKE_TOTAL_STEPS,
    title: "Your daily rhythm",
    subtitle: "Diet, movement, and sleep shape how you feel across your cycle.",
  },
  {
    id: "primaryGoal",
    kind: "goals",
    field: "primaryGoal",
    stepNumber: 9,
    totalSteps: INTAKE_TOTAL_STEPS,
    title: "Your goal & how you're feeling",
    subtitle: "We'll personalise your home screen and care tips around this.",
  },
];

export const INTAKE_AGE_OPTIONS = [
  { label: "Under 18", value: "under18" },
  { label: "18–25", value: "18-25" },
  { label: "26–35", value: "26-35" },
  { label: "36–45", value: "36-45" },
  { label: "Over 45", value: "over45" },
];

export const CYCLE_REGULARITY_OPTIONS = [
  { label: "Regular (21–35 days)", value: "regular" },
  { label: "Irregular (varies a lot)", value: "irregular" },
  { label: "Absent or very infrequent", value: "absent" },
  { label: "On birth control / hormonal treatment", value: "on-treatment" },
];

export const BLEEDING_PATTERN_OPTIONS = [
  { label: "Light", value: "light" },
  { label: "Normal for me", value: "normal" },
  { label: "Heavy or prolonged (menorrhagia)", value: "heavy" },
  { label: "Spotting between periods", value: "spotting" },
];

export const PERIOD_PAIN_OPTIONS = [
  { label: "Little or none", value: "none" },
  { label: "Mild — manageable", value: "mild" },
  { label: "Moderate — affects some days", value: "moderate" },
  { label: "Severe — limits daily life (dysmenorrhea)", value: "severe" },
];

export const DIETARY_INTAKE_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Dairy-free",
  "Low-GI focus",
  "Halal",
  "Mostly home-cooked",
] as const;

export const SLEEP_QUALITY_OPTIONS = [
  { label: "Poor — often tired", value: "poor" },
  { label: "Fair — some restless nights", value: "fair" },
  { label: "Good — usually rested", value: "good" },
];

export const PRIMARY_GOAL_OPTIONS = [
  { label: "Regulate my cycle", value: "cycle" },
  { label: "Manage weight & metabolism", value: "weight" },
  { label: "Support fertility", value: "fertility" },
  { label: "Reduce physical symptoms", value: "symptoms" },
  { label: "Improve energy & mood", value: "energy" },
  { label: "Understand my body better", value: "understand" },
  { label: "Prepare for my gynecologist", value: "doctor" },
];

export const EMOTIONAL_STATE_OPTIONS = [
  { label: "Overwhelmed", value: "overwhelmed" },
  { label: "Frustrated", value: "frustrated" },
  { label: "Hopeful", value: "hopeful" },
  { label: "Motivated", value: "motivated" },
  { label: "Accepting & calm", value: "accepting" },
];

export const EMOTIONAL_REASSURANCE: Record<string, string> = {
  overwhelmed:
    "Feeling overwhelmed is valid — many women with hormonal conditions share this. Small, steady steps matter more than perfection.",
  frustrated:
    "Frustration often means you've been trying hard without enough support. SheCare is here to organise that support with you.",
  hopeful:
    "Hope is a powerful starting point. Tracking patterns gives you clearer conversations with your doctor.",
  motivated:
    "Your motivation is an asset. We'll help you channel it into sustainable habits, not burnout.",
  accepting:
    "Self-compassion is part of healing. We'll meet you where you are — gently.",
};
