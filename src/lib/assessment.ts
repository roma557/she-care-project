import type { IntakePlan } from "@/lib/intake";

export type SeverityLevel = "mild" | "moderate" | "significant";

/** Personalised care profile — same shape as clinical intake plan. */
export type AssessmentResult = IntakePlan;

/** @deprecated Use INTAKE_STEPS + buildIntakePlan from @/lib/intake */
export const ASSESSMENT_QUESTIONS = [] as never[];

/** @deprecated Use buildIntakePlan from @/lib/intake */
export function calculateResult(): AssessmentResult {
  throw new Error("Use buildIntakePlan with IntakeAnswers instead");
}
