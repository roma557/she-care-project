export type ConditionCategoryId =
  | "menstrual-cycle"
  | "vaginal-infections"
  | "structural-pain"
  | "hormonal-systemic";

export interface ConditionCategory {
  id: ConditionCategoryId;
  label: string;
}

export interface Condition {
  id: string;
  name: string;
  categoryId: ConditionCategoryId;
  description: string;
  keywords: string[];
  seeDoctor?: string;
}

export type PcosGuideTabId = "diff" | "causes" | "types" | "sympt" | "tests";
