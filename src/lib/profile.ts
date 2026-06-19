import type { IntakeAnswers } from "@/lib/intake";

export interface UserProfile {
  name: string;
  onboardingComplete: boolean;
  cycleLength: number;
  /** @deprecated Use intakeAnswers — kept for migration */
  symptomTags: string[];
  dietaryTags: string[];
  activityLevel: number;
  /** Full clinical intake from first launch */
  intakeAnswers?: IntakeAnswers;
}

export const DEFAULT_PROFILE: UserProfile = {
  name: "",
  onboardingComplete: false,
  cycleLength: 28,
  symptomTags: [],
  dietaryTags: [],
  activityLevel: 35,
};

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** @deprecated Legacy chips — prefer intake flow */
export const ONBOARDING_SYMPTOMS = [
  "Irregular periods",
  "Acne",
  "Hair growth",
  "Weight gain",
  "Mood swings",
  "Fatigue",
  "Bloating",
  "Cravings",
] as const;

export const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Dairy-free",
  "Low-GI",
  "Halal",
] as const;
