import type { PcosGuideTabId } from "./types";

export const PCOS_GUIDE_TABS: { id: PcosGuideTabId; label: string }[] = [
  { id: "diff", label: "PCOS vs PCOD" },
  { id: "causes", label: "Causes" },
  { id: "types", label: "Types" },
  { id: "sympt", label: "Symptoms" },
  { id: "tests", label: "Tests" },
];

export const PCOS_CAUSES = [
  "Genetics & family history",
  "Insulin resistance",
  "Chronic inflammation",
  "Elevated androgens",
  "Sedentary lifestyle",
  "Chronic stress",
];

export const PCOS_TYPES = [
  { title: "Insulin-resistant", desc: "Most common — weight gain, cravings, dark skin patches", color: "bg-teal-light" },
  { title: "Inflammatory / Adrenal", desc: "High DHEA-S, stress-driven, normal BMI", color: "bg-purple-light" },
  { title: "Post-pill", desc: "Onset after stopping birth control pills", color: "bg-pink-light" },
  { title: "Hidden / Lean", desc: "Normal weight but hormonal imbalance present", color: "bg-amber-light" },
];

export const PCOS_SYMPTOM_GROUPS = [
  { group: "Common", tags: ["Irregular periods", "Acne", "Hair thinning", "Weight gain", "Fatigue"] },
  { group: "Metabolic", tags: ["Insulin resistance", "Sugar cravings", "Dark neck patches", "Bloating"] },
  { group: "Reproductive", tags: ["Infertility", "Heavy bleeding", "Pelvic pain", "Mood swings", "Anxiety"] },
];

export const PCOS_TESTS = [
  "Blood tests — testosterone, LH, FSH, insulin, glucose",
  "Pelvic ultrasound — ovarian morphology",
  "Thyroid & prolactin panel",
  "Vitamin D & lipid profile",
  "HbA1c for insulin resistance",
];
