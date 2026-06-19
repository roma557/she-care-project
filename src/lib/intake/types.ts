import type { SeverityLevel } from "@/lib/assessment";

/** Answers collected during first-launch clinical intake (gynecology-style history). */
export interface IntakeAnswers {
  name: string;
  age: string;
  concerns: string[];
  diagnoses: string[];
  cycleLength: number;
  cycleRegularity: string;
  bleedingPattern: string;
  periodPain: string;
  physicalSymptoms: string[];
  mentalSymptoms: string[];
  dietaryTags: string[];
  activityLevel: number;
  sleepQuality: string;
  primaryGoal: string;
  emotionalState: string;
}

export const EMPTY_INTAKE_ANSWERS: IntakeAnswers = {
  name: "",
  age: "",
  concerns: [],
  diagnoses: [],
  cycleLength: 28,
  cycleRegularity: "",
  bleedingPattern: "",
  periodPain: "",
  physicalSymptoms: [],
  mentalSymptoms: [],
  dietaryTags: [],
  activityLevel: 35,
  sleepQuality: "",
  primaryGoal: "",
  emotionalState: "",
};

/** Personalised care plan generated from intake — not a medical diagnosis. */
export interface IntakePlan {
  score: number;
  severity: SeverityLevel;
  severityLabel: string;
  severityColor: string;
  isIrregular: boolean;
  showDoctorAlert: boolean;
  doctorReason?: string;
  goalAdvice: string;
  topTips: string[];
  summaryLines: string[];
  reassurance: string;
  suggestedLearnTopics: { id: string; name: string }[];
}

export type IntakeStepKind =
  | "about-you"
  | "multi"
  | "single"
  | "cycle-length"
  | "cycle-health"
  | "symptoms"
  | "lifestyle"
  | "goals";

export interface IntakeStepOption {
  label: string;
  value: string;
  score?: number;
}

export interface IntakeStep {
  id: keyof IntakeAnswers | "cycle-health-group";
  kind: IntakeStepKind;
  stepNumber: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  infoPill?: string;
  /** For multi/single — field key on IntakeAnswers */
  field?: keyof IntakeAnswers;
  options?: IntakeStepOption[];
  /** For symptoms step — physical vs mental */
  symptomGroup?: "physical" | "mental";
}
